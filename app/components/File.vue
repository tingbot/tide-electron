<template>
  <div class="file">
    <div
        class="file-row"
        v-bind:class="{'is-folder': isFolder, 'folder-open': folderOpen, 'selected': selected}"
        v-on:click="fileclicked">
      <span 
          class="file-disclosure-triangle" 
          v-bind:style="{ visibility: isFolder }"
          v-bind:class="{'folder-open': folderOpen}"
          v-on:click="toggleFolderOpen"></span>
      <span class="file-icon"></span>
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
      }
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
          this.$dispatch('fileClicked', this.file.path);
          event.stopPropagation();
        }
      }
    },
    events: {
      openFile: function(filename) {
        console.log('opening', filename, 'this', this.file.path);

        let isThisFile = (filename == this.file.path);
        this.selected = isThisFile;

        return true;
      }
    },
    computed: {
      isFolder: function () {
        return (this.file instanceof TingappFolder);
      }
    }
  }
</script>
