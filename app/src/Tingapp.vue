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
        TbTool.start(device,folder);
      },
      fileClicked: function(file){
        this.$broadcast('openFile', file);
      }
    }
  }

</script>
