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
  }

}

</script>
