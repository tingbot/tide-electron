<template>
  <div class="left" id="sidebar">
    <div class="sidebar-files">
      <file :file="root"></file>
    </div>
    <div class="sidebar-button-bar">
      <a class="sidebar-button" title="New file" v-on:click="newFile">
        <i class="fa fa-file-code-o" style="transform: translateY(0px)"></i>
      </a>
      <a class="sidebar-button" title="New folder" v-on:click="newFolder">
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
  import {BrowserWindow, remote} from 'electron';

  export default {
    props: ['root'],
    components: [File],
    methods: {
      newFile: function () { this.$broadcast('newFile') },
      newFolder: function () { this.$broadcast('newFile', 'folder') },
      importFiles: function () { this.$broadcast('importFiles') },
    },
  }
</script>
