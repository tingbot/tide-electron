<template>
  <div class="top" id="top-menu">
    <button type="button" class="run-button" alt="start" v-on:click="start" v-show="!isRunning"></button>
    <button type="button" class="stop-button" name="stop" v-on:click="stop" v-show="isRunning"></button>
    <button type="button" class="upload-button" name="upload" disabled></button>
    <select v-model="selectedDevice" id="device-list" name="device-list">
        <option value="simulate" selected>Tingbot Simulator</option>
      <option v-for='device in devices' value="{{device.target}}">{{device.name}}</option>
    </select>
  </div>
</template>

<script>
  import {TingFinder} from '../utils/tingfinder.js'
  export default {
    props: [ 'isRunning'],
    data () {
      return{
        selectedDevice: "simulate",
        devices: []
      }
    },
    created(){
      this.finder = new TingFinder(this.devices);
    },
    destroyed(){
      this.finder.stop();
    },
    methods: {
      start: function(){
        this.$dispatch('run',this.selectedDevice);
      },
      stop: function () {
        this.$dispatch('stop');
      }
    },
    // watch: {
    //   selectedDevice: function(currentValue) {
    //     this.selectedTarget = currentValue;
    //   }
    // }
  }
</script>
