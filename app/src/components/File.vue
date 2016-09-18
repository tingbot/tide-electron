<template>
  <div v-if="!file">Error: No File</div>
  <div
      v-if="file"
      class="file"
      v-bind:class="{'root': isRoot, 'drag-over': dragOver}"
      v-on:dragenter="fileDragEnter"
      v-on:dragleave="fileDragLeave"
      v-on:dragover="fileDragover"
      v-on:drop="fileDropped"
      v-on:contextmenu="rightClick">
    <div
        class="file-row"
        v-if="!isRoot"
        v-bind:class="{'is-folder': isFolder, 'folder-open': folderOpen, 'selected': selected}"
        v-on:click="fileClicked"
        v-on:mousedown="mouseDown">
      <span
          class="file-disclosure-triangle"
          v-bind:style="{ visibility: isFolder }"
          v-bind:class="{'folder-open': folderOpen}"
          v-on:click="toggleFolderOpen"></span>
      <span
          class="file-icon file-icon-{{file.type}}"
          v-bind:class="{'folder-open': folderOpen}"></span>

      <template v-if="editingFilename">
        <input
          class="file-name-field"
          v-el:file-name-field
          v-on:blur="stopEditingFilename"
          v-on:keyup.13="stopEditingFilename"
          v-model="file.name" lazy />
      </template>
      <template v-else>
        <span class="file-name" v-else>
          {{file.name}}
        </span>
      </template>

    </div>
    <ul class="filetree" v-if="isFolder" v-show="isRoot || folderOpen">
      <template v-for="child in file.sortedFiles">
        <file :file="child"></file>
      </template>
    </ul>
  </div>
</template>

<script>
  import {TingappFolder} from '../tingapp.js';
  import {remote} from 'electron';
  import * as error from '../error';
  const dialog = remote.dialog;

  export default {
    name: 'file',
    props: ['file'],
    data: function () {
      return {
        folderOpen: false,
        selected: false,
        editingFilename: false,
        parentWasFocusedOnMouseDown: false,
        isDestinationForNewFiles: false,
        dragOver: false,
      }
    },
    methods: {
      toggleFolderOpen: function (event) {
        this.folderOpen = !this.folderOpen;
        event.stopPropagation();
      },
      fileClicked: function(event) {
        if (this.parentWasFocusedOnMouseDown && this.selected) {
          this.editingFilename = true;
        } else {
          if (this.isFolder) {
            this.toggleFolderOpen(event);
          } else {
            this.$dispatch('fileClicked', this.file);
            event.stopPropagation();
          }
        }
      },
      fileDragEnter: function(event) {
        if (this.acceptDrop(event)) {
          event.dataTransfer.dropEffect = 'copy';
          this.dragOver = true;
          event.preventDefault();
          event.stopPropagation();
        }
      },
      fileDragLeave: function(event) {
        this.dragOver = false;
      },
      fileDragover: function(event) {
        if (this.acceptDrop(event)) {
          this.dragOver = true;
          event.dataTransfer.dropEffect = 'copy';
          event.preventDefault();
          event.stopPropagation();
        }
      },
      fileDropped: function(event){
        if (this.acceptDrop(event)) {
          event.preventDefault();
          event.stopPropagation();
          this.dragOver = false;

          var file = event.dataTransfer.files[0];
          console.log('File you dragged here is', file.path, "dropped on", this.file.path);
          if (this.isFolder) {
            this.file.addFile(file.path);
          } else {
            this.file.parent.addFile(file.path);
          }
          return false;
        }
      },
      mouseDown: function (event) {
        this.parentWasFocusedOnMouseDown = document.activeElement.contains(this.$el);
      },
      rightClick: function (event) {
        const {Menu, MenuItem} = remote;

        let explorer = null;
        if (process.platform === 'darwin') {
          explorer = 'Finder';
        } else if (process.platform === 'win32') {
          explorer = 'Explorer';
        } else {
          // Linux, there are many file managers so use a generic term
          explorer = 'file manager';
        }

        const type = this.file.type === 'folder' ? 'folder' : 'file';

        const menu = new Menu();

        if (!this.isRoot) {
          menu.append(new MenuItem({
            label: this.file.name,
            enabled: false
          }));
          menu.append(new MenuItem({
            type: 'separator'
          }));
        }

        if (this.isFolder) {
          menu.append(new MenuItem({
            label: 'New file…',
            click: () => { this.newFile() }
          }));
          menu.append(new MenuItem({
            label: 'New folder…',
            click: () => { this.newFile('folder') }
          }));
          menu.append(new MenuItem({
            label: 'Import…',
            click: () => { this.importFiles() }
          }));
        }

        if (!this.isRoot) {
          menu.append(new MenuItem({
            type: 'separator'
          }));
          menu.append(new MenuItem({
            label: 'Rename…',
            click: () => { this.editingFilename = true }
          }));
          menu.append(new MenuItem({
            label: `Reveal in ${explorer}`,
            click: () => { this.file.revealInExplorer() }
          }));
          menu.append(new MenuItem({
            label: `Delete ${type}`,
            click: () => { this.file.moveToTrash() }
          }));
        }

        menu.popup(remote.getCurrentWindow());
        event.preventDefault();
        event.stopPropagation();
      },
      stopEditingFilename: function (event) {
        this.editingFilename = false;
      },
      newFile: function (type = 'regularFile') {
        // type can only be 'regularFile' or 'folder'
        console.assert(type === 'regularFile' || type === 'folder');

        // try 100 different filenames for the new file before aborting
        for (let i = 0; i < 100; i++) {
          const name = (i == 0) ? 'untitled' : `untitled-${i}`;

          try {
            if (type == 'folder') {
              var file = this.file.createFolder(name);
            } else {
              var file = this.file.createRegularFile(name);
            }
            break;
          } catch (e) {
            if ((e instanceof error.FileExistsError) && (i < 99)) {
              continue;
            } else {
              throw e;
            }
          }
        }

        this.$nextTick(() => {
          // select the new file
          this.$dispatch('fileClicked', file);
          // make sure any parent folders are open so the file is visible
          this.$dispatch('ensureFileVisible', file);
          // make the new file's filename editable, with a blank textfield
          this.$broadcast('editFilename', file, true);
        });
      },
      importFiles: function () {
        let dialogProperties = null;

        if (process.platform === 'darwin') {
          dialogProperties = ['openFile', 'openDirectory', 'multiSelections']
        } else {
          // windows/linux don't support file and directory selection
          dialogProperties = ['openFile', 'multiSelections']
        }

        dialog.showOpenDialog(remote.getCurrentWindow(), {
          title: 'Import files into project',
          buttonLabel: 'Import',
          properties: dialogProperties,
        }, (filenames) => {
          if (filenames === undefined) {
            return;
          }

          let file = null;

          for (let filename of filenames) {
            file = this.file.addFile(filename);
          }

          // select the last imported file
          if (file !== null) {
            this.$nextTick(() => {
              this.$dispatch('fileClicked', file);
              this.$broadcast('ensureFileVisible', file);
            })
          }
        })
      },
      acceptDrop: function (event) {
        return this.isFolder && event.dataTransfer.types.includes('Files');
      }
    },
    watch: {
      editingFilename: function (editingFilename) {
        if (editingFilename) {
          this.$nextTick(() => {
            this.$els.fileNameField.focus();
            this.$els.fileNameField.select();
          })
        }
      }
    },
    events: {
      openFile: function(file) {
        let isThisFile = (file === this.file);
        this.selected = isThisFile;

        this.isDestinationForNewFiles = (this.selected || (this.isFolder && this.file.files.includes(file) && file.type !== 'folder'));

        return true;
      },
      editFilename: function (file, blank=false) {
        let isThisFile = (file === this.file);

        this.editingFilename = isThisFile;

        if (isThisFile && blank) {
          this.$nextTick(() => {
            this.$els.fileNameField.value = "";
          });
        }

        return true;
      },
      ensureFileVisible: function (file) {
        if (this.isFolder && this.file.containsFile(file)) {
          this.folderOpen = true;
        }
        return true;
      },
      newFile: function (type) {
        if (this.selected || this.isDestinationForNewFiles) {
          this.newFile(type);
        } else {
          return true;
        }
      },
      importFiles: function () {
        if (this.selected || this.isDestinationForNewFiles) {
          this.importFiles();
        } else {
          return true;
        }
      }
    },
    computed: {
      isFolder: function () {
        return (this.file.type == 'folder');
      },
      isRoot: function () {
        return this.file.isRootFolder;
      },
    }
  };
</script>
