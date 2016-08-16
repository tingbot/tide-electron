

<template>

<div id="app">
    <control-bar :is-running='processIsRunning'>
    </control-bar>
    <sidebar :root='tingapp.root' tabindex=0>
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

import Sidebar from './components/Sidebar.vue';
import ControlBar from './components/ControlBar.vue';
import Editor from './components/Editor.vue';
import Terminal from './components/Terminal.vue';
import VerticalSplit from './components/VerticalSplit.vue';

import * as tbtool from './utils/tbtool.js';
import {
    remote
}
from 'electron';

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
            process: null
        };
    },
    ready: function() {
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy: function() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        handleResize: function() {
            this.$broadcast('resize');
        },
        processEnded: function(code, signal) {
            this.process = null;
        }
    },
    events: {
        run: function(device) {
            const inProgressPath = this.tingapp.saveInProgressVersion();

            if (device == 'simulate') {
                this.process = tbtool.simulate(inProgressPath);
            } else {
                this.process = tbtool.run(inProgressPath, device);
            }

            this.process.once('exit', this.processEnded);
        },
        stop: function() {
            this.process.terminate();
        },
        fileClicked: function(file) {
            this.$broadcast('openFile', file);
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
            if (win.setDocumentEdited) {
                win.setDocumentEdited(changed);
            }
        }
    }
};

</script>
