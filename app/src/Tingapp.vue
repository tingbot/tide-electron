

<template>

<div id="app" class="platform-{{platform}}">
    <control-bar :is-running='processIsRunning' :previous-devices='previousDevices'>
    </control-bar>
    <sidebar :root='tingapp.root' tabindex=0>
    </sidebar>

    <vertical-split class="main" :position="1" :min-position="1" :max-position="(windowHeight - 80) * 0.9">
        <editor slot="top" class="fill">
        </editor>
        <terminal slot="bottom" class="fill" :process="process">
        </terminal>
    </vertical-split>

    <div class="bottom"></div>
</div>

</template>

<script>

import Sidebar from './components/Sidebar.vue';
import ControlBar from './components/ControlBar.vue';
import Editor from './components/Editor.vue';
import Terminal from './components/Terminal.vue';
import VerticalSplit from './components/VerticalSplit.vue';
import storage from 'electron-json-storage';

import * as tbtool from './utils/tbtool.js';
import {remote} from 'electron';
const dialog = remote.dialog;

var folder = './default.tingapp';

export default {
    props: ['tingapp'],
    components: {
        Sidebar,
        ControlBar,
        Editor,
        Terminal,
        VerticalSplit
    },
    data: function() {
        return {
            process: null,
            windowWidth: 0,
            windowHeight: 0,
            platform: process.platform,
            enabledMenuItems: {
                save: true,
                saveAs: true,
                print: true,
                run: true
            },
            previousDevices: [],
        };
    },
    ready: function() {
        window.addEventListener('resize', this.handleResize);
        this.$emit('resize');

        storage.get('previousDevices', (error, data) => {
            if (error) {
                console.error('Failed to get previous devices', error)
                return
            }

            if (data['list']) {
                this.previousDevices = data['list']   
            }
        })
    },
    beforeDestroy: function() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        handleResize: function() {
            this.$emit('resize');
            this.$broadcast('resize');
        },
        processEnded: function(endedProcess) {
            if (this.process === endedProcess) {
                this.process = null;
            }
        },
        addPreviousDevice: function(previousDevice) {
            if (!this.previousDevices.includes(previousDevice)) {
                this.previousDevices.push(previousDevice)

                storage.set('previousDevices', {list: this.previousDevices}, (error) => {
                    if (error) {
                        console.log('Failed to set previous devices', error)
                    }
                })
            }
        }
    },
    events: {
        run: function(device) {
            const inProgressPath = this.tingapp.saveInProgressVersion();
            let newProcess = null;

            if (device == 'simulate') {
                newProcess = tbtool.simulate(inProgressPath);
            } else {
                newProcess = tbtool.run(inProgressPath, device);
                this.addPreviousDevice(device);
            }

            newProcess.once('exit', () => { this.processEnded(newProcess) });
            this.process = newProcess;
        },
        stop: function() {
            this.process.terminate();
        },
        upload: function(device){
            if (this.tingapp.isTemporary) {
              dialog.showMessageBox(remote.getCurrentWindow(), {
                title: 'Save your app',
                message: 'You need to save your app before you can upload to Tingbot',
                detail: 'Save your app using File -> Save and then try to upload again.\n\nTide needs to know the name of the app so it can upload to the Tingbot under that name.',
                buttons: ['OK'],
              })
              return;
            }

            const inProgressPath = this.tingapp.saveInProgressVersion();
            const newProcess = tbtool.install(inProgressPath, device);
            newProcess.once('exit', () => { this.processEnded(newProcess) });
            this.process = newProcess;
            this.addPreviousDevice(device);
        },
        fileClicked: function(file) {
            this.$broadcast('openFile', file);
        },
        resize: function () {
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
        }
    },
    computed: {
        windowPath: function() {
            if (!this.tingapp.isTemporary) {
                return this.tingapp.path;
            } else {
                return '';
            }
        },
        windowTitle: function() {
            if (this.tingapp.isTemporary) {
                return 'Untitled';
            } else {
                return this.tingapp.root.name;
            }
        },
        changed: function() {
            return (this.tingapp.changed === true);
        },
        processIsRunning: function() {
            return (this.process !== null);
        }
    },
    watch: {
        windowPath: function(path) {
            const win = remote.getCurrentWindow();
            if (win.setRepresentedFilename) {
                win.setRepresentedFilename(path);
            }
        },
        windowTitle: function(title) {
            const win = remote.getCurrentWindow();
            win.setTitle(title);
        },
        tingapp: function(tingapp) {
            // open the file at the top of the sidebar when a tingapp is opened.
            if (tingapp.root.files.length > 0) {
                this.$broadcast('openFile', tingapp.root.sortedFiles[0]);
            }
        },
        changed: function(changed) {
            const win = remote.getCurrentWindow();
            this.enabledMenuItems.save = changed;
            this.enabledMenuItems.saveAs = changed;

            if (win.setDocumentEdited) {
                win.setDocumentEdited(changed);
            }
        },
        enabledMenuItems: {
            handler: function (enabledMenuItems) {
                const win = remote.getCurrentWindow();
                win.enabledMenuItems = enabledMenuItems
            },
            deep: true,
            immediate: true,
        },
        processIsRunning: function (processIsRunning) {
            this.enabledMenuItems.stop = processIsRunning
        },
    }
};

</script>
