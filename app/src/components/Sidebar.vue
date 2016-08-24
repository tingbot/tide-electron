<template>
  <div class="left" id="sidebar" v-on:drop="fileDropped">
    <div class="sidebar-files">
      <template v-for="file in root.sortedFiles">
        <file :file="file"></file>
      </template>
    </div>
    <div class="sidebar-button-bar">
      <a class="sidebar-button" title="New file" v-on:click="newFile">
        <i class="fa fa-file-code-o" style="transform: translateY(0px)"></i>
      </a>
      <a class="sidebar-button" title="New folder" v-on:click="newFile($event, 'folder')">
        <i class="fa fa-folder-o" style="transform: translateY(1px)"></i>
      </a>
      <a class="sidebar-button import" title="Import…" v-on:click="importFiles">
        <img class="import-icon"  style="transform: translateY(2px)"/>
      </a>
    </div>
  </div>
</template>

<style>
  .sidebar-files {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 26px;
  }
  .sidebar-button-bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 26px;
    background-color: #252525;
    font-size: 0;
    padding: 0 5px;
  }
  .sidebar-button {
    box-sizing: border-box;
    width: 21px;
    height: 26px;
    display: inline-block;
    color: rgba(255,255,255,0.3);
    font-size: 12px;
    padding: 5px;
  }
  .sidebar-button:hover {
    color: white;
  }
  .import-icon {
    -webkit-mask-box-image: url(../../static/img/import.png);
    background-color: currentColor;
    width: 15px;
    height: 14px;
  }
</style>

<script>
  import File from './File.vue';
  import * as error from '../error';

  export default {
    data: function () {
      return {
        selectedFile: null,
      }
    },
    props: ['root'],
    components: [File],
    methods: {
      fileDropped: function(event){
        event.preventDefault();
        event.stopPropagation();
        var file = event.dataTransfer.files[0];
        console.log('File you dragged here is', file.path, "dropped on sidebar");
        this.root.addFile(file.path);
        return false;
      },
      newFile: function (event, type = 'regularFile') {
        // 'type' is either 'regularFile' or 'folder'

        // try 100 different filenames for the new file before aborting
        for (let i = 0; i < 100; i++) {
          const name = (i == 0) ? 'untitled' : `untitled-${i}`;

          try {
            if (type == 'folder') {
              var file = this.destinationForNewFiles.createFolder(name);
            } else {
              var file = this.destinationForNewFiles.createRegularFile(name);
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
          this.$broadcast('ensureFileVisible', file);
          // make the new file's filename editable, with a blank textfield
          this.$broadcast('editFilename', file, true);
        });
      }
    },
    computed: {
      destinationForNewFiles: function () {
        if (this.selectedFile === null) {
          return this.root;
        }

        if (this.selectedFile.type === 'folder') {
          return this.selectedFile;
        } else {
          return this.selectedFile.parent;
        }
      }
    },
    events: {
      openFile: function (file) {
        this.selectedFile = file;
        return true;
      }
    }
  }
</script>
