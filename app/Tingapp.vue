<template>
  <div id="app">
    <control-bar :devices='devices'></control-bar>
    <sidebar :files='model.files'></sidebar>
    <editor></editor>
  </div>
</template>

<script>
  import Sidebar from './components/Sidebar.vue'
  import ControlBar from './components/ControlBar.vue'
  import Editor from './components/Editor.vue'

  import TbTool from './utils/tbtool.js'
  import fileWatcher from './utils/filewatcher.js'

  var folder = './default.tingapp'

  export default {
    props: ['model'],
    components: {
      Sidebar,
      ControlBar,
      Editor
    }
  },
  events:{
    run: function(device){
      TbTool.start(device,folder);
    },
    fileClicked: function(filename){
      this.$broadcast('openFile',filename);
    }
  },
  methods:{
    updateFiles: function(files){
      console.log(this.files);
      this.files = files;

    }
  },
  created: function(){
    fileWatcher.setup(folder,this.updateFiles);

  }

</script>
