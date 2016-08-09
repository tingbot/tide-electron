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
  export default {
    props: ['devices', 'isRunning'],
    data () {
      return{
        selectedDevice: "simulate"
      }
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
