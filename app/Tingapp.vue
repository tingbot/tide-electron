<template>
  <div id="app">
    <control-bar :devices='devices'></control-bar>
    <sidebar 
      :root='tingapp.root'
      tabindex=0>
    </sidebar>
    <div class="main">
      <editor
        class="fill"
        :style="{bottom: horizontalDragBarPosition + 'px'}">
      </editor>
      <horizontal-dragbar
        :position.sync="horizontalDragBarPosition"
        :max-position="200">
      </horizontal-dragbar>
      <terminal
        class="fill"
        :style="{top: 'auto', height: horizontalDragBarPosition + 'px'}">
      </terminal>
    </div>
    <div class="bottom"></div>
  </div>
</template>

<script>
  import Sidebar from './components/Sidebar.vue'
  import ControlBar from './components/ControlBar.vue'
  import Editor from './components/Editor.vue'
  import Terminal from './components/Terminal.vue'
  import HorizontalDragbar from './components/HorizontalDragbar.vue'

  import TbTool from './utils/tbtool.js'

  var folder = './default.tingapp'

  export default {
    props: ['tingapp'],
    components: {
      Sidebar,
      ControlBar,
      Editor,
      HorizontalDragbar,
      Terminal
    },
    data: function () {
      return {
        horizontalDragBarPosition: 150
      }
    },
    ready: function () {
      window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy: function () {
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
      handleResize: function () {
        this.$broadcast('resize');
      }
    },
    events: {
      run: function(device){
        TbTool.start(device,folder);
      },
      fileClicked: function(file){
        this.$broadcast('openFile', file);
      }
    },
    watch: {
      horizontalDragBarPosition: function () {
        this.handleResize()
      }
    }
  }

</script>
