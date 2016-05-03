<template>
  <div id="app">
    <control-bar :devices='devices'></control-bar>
    <sidebar :files='files'></sidebar>
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
  components: {
    Sidebar,
    ControlBar,
    Editor
  },
  data (){
    return {
      files: [{name:"test.py",path:"test.py"},{name:"test2.img"}],
      devices: [{name:"TestBot"}]
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

}

</script>
