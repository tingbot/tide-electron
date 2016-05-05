import Vue from 'vue';
import {default as TingappVue} from './Tingapp.vue';
import {Tingapp, TingappFile} from './tingapp.js';
import {ipcRenderer} from 'electron';

let vm = window.vueInstance = new Vue({
  el: 'body',
  template: "<app :model='model'></app>",
  components: { app: TingappVue },
  data: { model: { files: [] }},
  replace: false,
})

ipcRenderer.on('new-document', function () {
    vm.model = Tingapp.newDocument();
})

ipcRenderer.on('open-document', function (event, path) {
    console.log(path);
    vm.model = Tingapp.openDocument(path);
})

