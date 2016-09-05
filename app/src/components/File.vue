<template>
  <div class="file" v-on:drop="fileDropped">
    <div
        class="file-row"
        v-bind:class="{'is-folder': isFolder, 'folder-open': folderOpen, 'selected': selected}"
        v-on:click="fileclicked"
        v-on:mousedown="mouseDown"
        v-on:contextmenu="rightClick">
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
    <ul class="filetree" v-if="isFolder" v-show="folderOpen">
      <template v-for="child in file.files">
        <file :file="child"></file>
      </template>
    </ul>
  </div>
</template>

<script>
  import {TingappFolder} from '../tingapp.js';
  import {remote} from 'electron';

  export default {
    name: 'file',
    props: ['file'],
    data: function () {
      return {
        folderOpen: false,
        selected: false,
        editingFilename: false,
        parentWasFocusedOnMouseDown: false,
      }
    },
    methods: {
      toggleFolderOpen: function (event) {
        this.folderOpen = !this.folderOpen;
        event.stopPropagation();
      },
      fileclicked: function(event) {
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
      fileDropped: function(event){
        event.preventDefault();
        event.stopPropagation();
        var file = event.dataTransfer.files[0];
        console.log('File you dragged here is', file.path, "dropped on", this.file.path);
        if(this.isFolder){
          this.file.addFile(file.path);
        }else{
          this.file.parent.addFile(file.path);
        }
        return false;
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

        const menu = new Menu();

        menu.append(new MenuItem({
          label: this.file.name,
          enabled: false
        }));
        menu.append(new MenuItem({
          type: 'separator'
        }));
        menu.append(new MenuItem({
          label: 'Rename',
          click: () => { this.editingFilename = true }
        }));
        menu.append(new MenuItem({
          label: `Reveal in ${explorer}`,
          click: () => { this.file.revealInExplorer() }
        }));
        menu.append(new MenuItem({
          label: 'Delete file',
          click: () => { this.file.moveToTrash() }
        }));

        menu.popup(remote.getCurrentWindow());
        event.preventDefault();
      },
      stopEditingFilename: function (event) {
        this.editingFilename = false;
      },
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
      }
    },
    computed: {
      isFolder: function () {
        return (this.file.type == 'folder');
      }
    }
  };
</script>
