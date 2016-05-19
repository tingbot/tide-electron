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
        :process="process"
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
        horizontalDragBarPosition: 150,
        process: null
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
      },
      processEnded: function(code, signal) {
        this.process = null;
      }
    },
    events: {
      run: function(device){
        if (device == 'simulate') {
          this.process = this.tingapp.spawn_simulate();
        } else {
          this.process = this.tingapp.spawn_run(device);
        }

        this.process.on('exit', this.processEnded);
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
