

<template>

<div class="top" id="top-menu">
    <button
        type="button"
        class="run-button"
        title="Run"
        v-on:click="start"
        v-show="!isRunning"></button>
    <button
        type="button"
        class="stop-button"
        title="Stop"
        v-on:click="stop"
        v-show="isRunning"></button>
    <button type="button"
        class="upload-button"
        title="Upload"
        v-on:click="upload"
        :disabled="!canUpload"></button>

    <select v-model="selectedDevice" id="device-list" name="device-list">
        <option value="simulate" selected>Tingbot Simulator</option>
        <option v-for='device in devices' value="{{device.target}}">Tingbot @ {{device.target}}</option>
    </select>
</div>

</template>

<script>

import {
    TingFinder
}
from '../utils/tingfinder.js';
export default {
    props: ['isRunning'],
    data() {
        return {
            selectedDevice: "simulate",
            devices: []
        };
    },
    created() {
        this.finder = new TingFinder(this.devices);
    },
    destroyed() {
        this.finder.stop();
    },
    methods: {
        start: function() {
            this.$dispatch('run', this.selectedDevice);
        },
        stop: function() {
            this.$dispatch('stop');
        },
        upload: function(){
            this.$dispatch('upload', this.selectedDevice);
        }
    },
    events: {
        'menu-run': function () {
            if (this.isRunning) {
                this.stop();
            }

            this.start();
        },
        'menu-stop': function () {
            if (this.isRunning) {
                this.stop();
            }
        },
    },
    computed:{
        canUpload: function(){
            return !this.isRunning && this.selectedDevice !== 'simulate';
        }
    }
    // watch: {
    //   selectedDevice: function(currentValue) {
    //     this.selectedTarget = currentValue;
    //   }
    // }
};

</script>
