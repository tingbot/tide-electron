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

  export default {
    props: ['model'],
    components: {
      Sidebar,
      ControlBar,
      Editor
    }
  }

</script>
