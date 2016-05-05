import Vue from 'vue';
import {default as TingappVue} from './Tingapp.vue';
import {Tingapp, TingappFile} from './tingapp.js';
import {ipcRenderer} from 'electron';

let vm = window.vueInstance = new Vue({
  el: 'body',
  template: "<app :tingapp='tingapp'></app>",
  components: { app: TingappVue },
  data: { tingapp: { root: { files:[] } }},
  replace: false,
})

ipcRenderer.on('new-document', function () {
    vm.tingapp = Tingapp.newDocument();
})

ipcRenderer.on('open-document', function (event, path) {
    vm.tingapp = Tingapp.openDocument(path);
})
