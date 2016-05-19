<template>
  <div id="app">
    <control-bar
      :devices='devices'
      :is-running='processIsRunning'>
    </control-bar>
    <sidebar 
      :root='tingapp.root'
      tabindex=0>
    </sidebar>

    <vertical-split class="main" :position="1" :min-position="1" :max-position="200">
      <editor slot="top" class="fill">
      </editor>
      <terminal slot="bottom" class="fill" :process="process">
      </terminal>
    </vertical-split>

    <div class="bottom"></div>
  </div>
</template>

<script>
  import Sidebar from './components/Sidebar.vue'
  import ControlBar from './components/ControlBar.vue'
  import Editor from './components/Editor.vue'
  import Terminal from './components/Terminal.vue'
  import VerticalSplit from './components/VerticalSplit.vue'

  import TbTool from './utils/tbtool.js'

  var folder = './default.tingapp'

  export default {
    props: ['tingapp'],
    components: {
      Sidebar,
      ControlBar,
      Editor,
      Terminal,
      VerticalSplit
    },
    data: function () {
      return {
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
    events:{
      run: function(device){
        if (device == 'simulate') {
          this.process = this.tingapp.spawn_simulate();
        } else {
          this.process = this.tingapp.spawn_run(device);
        }

        this.process.on('exit', this.processEnded);
      },
      stop: function () {
        const processToStop = this.process;

        processToStop.kill('SIGTERM');

        setTimeout(() => {
          if (this.process === processToStop) {
            // it's still running
            processToStop.kill('SIGKILL');
          }
        }, 1000);
      },
      fileClicked: function(file){
        this.$broadcast('openFile', file);
      }
    },
    computed: {
      processIsRunning: function () {
        return (this.process !== null);
    }
  }
  }

</script>
