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

        <!-- Nearby and previous devices -->
        <option v-for='device in nearbyAndPreviousDevices' value="{{device}}">Tingbot @ {{device}}</option>

        <optgroup label="Nearby devices" v-if="newDevices.length > 0">
            <option v-for='device in newDevices' value="{{device}}">Tingbot @ {{device}}</option>
        </optgroup>
        <optgroup label="Previous devices" v-if="lostDevices.length > 0">
            <option v-for='device in lostDevices' value="{{device}}">Tingbot @ {{device}}</option>
        </optgroup>
    </select>
</div>

</template>

<script>

import {
    TingFinder
}
from '../utils/tingfinder.js';
export default {
    props: ['isRunning', 'previousDevices'],
    data() {
        return {
            selectedDevice: "simulate",
            nearbyDevices: []
        };
    },
    created() {
        this.finder = new TingFinder(this.nearbyDevices);
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
    computed: {
        canUpload: function(){
            return !this.isRunning && this.selectedDevice !== 'simulate';
        },
        nearbyAndPreviousDevices: function () {
            return this.nearbyDevices.filter((el) => this.previousDevices.includes(el))
        },
        lostDevices: function () {
            return this.previousDevices.filter((el) => !this.nearbyDevices.includes(el))
        },
        newDevices: function () {
            return this.nearbyDevices.filter((el) => !this.previousDevices.includes(el))
        },
    }
    // watch: {
    //   selectedDevice: function(currentValue) {
    //     this.selectedTarget = currentValue;
    //   }
    // }
};

</script>
