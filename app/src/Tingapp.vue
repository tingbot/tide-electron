<template>
  <div id="app">
    <control-bar :devices='devices'></control-bar>
    <sidebar :root='tingapp.root' tabindex=0></sidebar>
    <editor></editor>
    <div class="bottom"></div>
  </div>
</template>

<script>
  import Sidebar from './components/Sidebar.vue'
  import ControlBar from './components/ControlBar.vue'
  import Editor from './components/Editor.vue'

  import TbTool from './utils/tbtool.js'
  import {remote} from 'electron';

  var folder = './default.tingapp'

  export default {
    props: ['tingapp'],
    components: {
      Sidebar,
      ControlBar,
      Editor
    },
    events:{
      run: function(device){
        TbTool.start(device,this.tingapp.path);
      },
      fileClicked: function(file){
        this.$broadcast('openFile', file);
      }
    },
    computed: {
      windowPath: function () {
        if (!this.tingapp.isTemporary) {
          return this.tingapp.path;
        } else {
          return '';
        }
      },
      windowTitle: function () { 
        if (this.tingapp.isTemporary) {
          return 'Untitled';
        } else {
          return this.tingapp.root.name;
        }
      },
      changed: function () {
        return (this.tingapp.changed === true);
      }
    },
    watch: {
      windowPath: function (path) {
        const win = remote.getCurrentWindow();
        if (win.setRepresentedFilename) {
          win.setRepresentedFilename(path);
        }
      },
      windowTitle: function (title) {
        const win = remote.getCurrentWindow();
        win.setTitle(title);
      },
      tingapp: function (tingapp) {
        // open the file at the top of the sidebar when a tingapp is opened.
        if (tingapp.root.files.length > 0) {
          this.$broadcast('openFile', tingapp.root.sortedFiles[0]);
        }
      },
      changed: function (changed) {
        const win = remote.getCurrentWindow();
        if (win.setDocumentEdited) {
          win.setDocumentEdited(changed);
        }
      }
    }
  }
</script>
