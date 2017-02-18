<template>

<div class="top" id="top-menu">
    <button
        type="button"
        class="run-button"
        title="Run"
        v-on:click="start"
        v-show="!isRunning"
        :disabled="!canRun"></button>
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

    <select v-model="selectedDevice"
            id="device-list"
            name="device-list"
            v-if="selectedDevice !== 'manual'">
        <option value="simulate">Tingbot Simulator</option>

        <!-- Nearby and previous devices -->
        <option v-for='device in nearbyAndPreviousDevices' value="{{device}}">Tingbot @ {{device}}</option>

        <optgroup label="Nearby devices" v-if="newDevices.length > 0">
            <option v-for='device in newDevices' value="{{device}}">Tingbot @ {{device}}</option>
        </optgroup>
        <optgroup label="Previous devices" v-if="lostDevices.length > 0">
            <option v-for='device in lostDevices' value="{{device}}">Tingbot @ {{device}}</option>
        </optgroup>

        <option value="manual">Manually enter Tingbot IP…</option>
    </select>
    <div class="manual-ip-form" v-if="selectedDevice === 'manual'">
        <input class="manual-ip-form-field"
               type="text"
               v-model="manualIp"
               v-on:blur="enterManualIp"
               v-on:keyup.enter="enterManualIp"
               v-on:keyup.esc="cancelManualIp"
               v-el:manual-ip-input />
        <button type="button"
                class="manual-ip-form-button"
                v-on:click="cancelManualIp">
            Cancel
        </button>
        <button type="button"
                class="manual-ip-form-button"
                v-on:click="enterManualIp">
            OK
        </button>
    </div>
</div>

</template>

<script>

import { TingFinder } from '../utils/tingfinder.js';
import net from 'net';

export default {
    props: ['isRunning', 'previousDevices'],
    data() {
        return {
            selectedDevice: "simulate",
            nearbyDevices: [],
            manualIp: '',
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
        upload: function() {
            this.$dispatch('upload', this.selectedDevice);
        },
        cancelManualIp: function () {
            this.selectedDevice = 'simulate';
            this.manualIp = '';
        },
        enterManualIp: function () {
            // check it matches the right pattern for an ip
            const ipAddress = this.manualIp;
            if (net.isIP(ipAddress) == 0) {
                console.warn(ipAddress, 'is not a valid IP address.');
                return;
            }

            this.$dispatch('addPreviousDevice', this.manualIp);
            this.selectedDevice = this.manualIp;
        },
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
        canRun: function(){
            return this.selectedDevice !== 'manual';
        },
        canUpload: function(){
            return (!this.isRunning
                    && this.selectedDevice !== 'simulate' 
                    && this.selectedDevice !== 'manual');
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
    },
    watch: {
      selectedDevice: function(currentValue, previousValue) {
        if (currentValue === 'manual') {
            this.manualIp = '';
            this.$nextTick(() => {
                if (this.$els.manualIpInput)  this.$els.manualIpInput.focus();   
            });
        }
      }
    }
};

</script>
