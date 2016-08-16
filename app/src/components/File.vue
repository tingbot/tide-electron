<template>
  <div class="file" v-on:drop="fileDropped">
    <div
        class="file-row"
        v-bind:class="{'is-folder': isFolder, 'folder-open': folderOpen, 'selected': selected}"
        v-on:click="fileclicked">
      <span
          class="file-disclosure-triangle"
          v-bind:style="{ visibility: isFolder }"
          v-bind:class="{'folder-open': folderOpen}"
          v-on:click="toggleFolderOpen"></span>
      <span class="file-icon file-icon-{{file.type}}"></span>
      <span class="file-name">
        {{file.name}}
      </span>
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

  export default {
    name: 'file',
    props: ['file'],
    data: function () {
      return {
        folderOpen: false,
        selected: false,
      };
    },
    methods: {
      toggleFolderOpen: function (event) {
        this.folderOpen = !this.folderOpen;
        event.stopPropagation();
      },
      fileclicked: function(event){
        if (this.isFolder) {
          this.toggleFolderOpen(event);
        } else {
          this.$dispatch('fileClicked', this.file);
          event.stopPropagation();
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
      }
    },
    events: {
      openFile: function(file) {
        let isThisFile = (file == this.file);

        this.selected = isThisFile;

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
