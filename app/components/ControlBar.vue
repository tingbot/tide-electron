<template>
  <div class="top" id="top-menu">
      <button type="button" class="run-button" name="start" v-on:click="start"></button>
      <button type="button" class="upload-button" name="upload" disabled></button>
      <select v-model="selectedDevice" id="device-list" name="device-list">
        <option value="simulate" selected>Simulator</option>
        <option v-for='device in devices' value="{{device.target}}">{{device.name}}</option>
      </select>
    </div>
</template>

<script>
  import TbTool from '../utils/tbtool.js'
  export default {
    props: ['devices'],
    data () {
      return{
        selectedDevice: "simulate"
      }
    },
    methods: {
      start: function(){

        TbTool.start(this.selectedDevice,"./default.tingapp");
      }
    },
    // watch: {
    //   selectedDevice: function(currentValue) {
    //     this.selectedTarget = currentValue;
    //   }
    // }
  }
</script>
