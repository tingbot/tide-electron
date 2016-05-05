import Vue from 'vue';
import {default as TingappVue} from './Tingapp.vue';
import {Tingapp, TingappFile} from './tingapp.js';

var newApp = new Tingapp('./default.tingapp');

window.vueInstance = new Vue({
  el: 'body',
  template: "<app :model='model'></app>",
  components: { app: TingappVue },
  data: { model: newApp },
  replace: false,
})
