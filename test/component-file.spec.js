// test/component-a.spec.js
var Vue = require('vue');
var File = require('../app/src/components/File.vue');
import {TingappFolder,TingappRegularFile} from '../app/src/tingapp.js';

describe('File.vue', function () {

  // What happens when no file is passed in
  it('should render error if not passed file', function () {
    var vm = new Vue({
      template: '<div><test></test></div>',
      components: {
        'test': File
      }
    }).$mount();
    expect(vm.$el.querySelector('div').textContent).to.equal('Error: No File');
  });

  // What happens if a normal file is passed in
  it('should render a regular file if passed one', function () {
    var regularFile = new TingappRegularFile();

    var vm = new Vue({
      template: '<div><test :file="file"></test></div>',
      components: {
        'test': File
      },
      data: function(){
        return {file: regularFile};
      }
    }).$mount();
    //TODO: Actually set expects

    //expect(vm.$el.querySelector('div').textContent).to.equal('Error: No File');
  });

//TODO: Wait until discussion on decoupling model and file system. Issue #47
  // // What happens if a folder is passed in
  // it('should render a folder if passed one', function () {
  //   var folder = new TingappFolder();
  //
  //   var vm = new Vue({
  //     template: '<div><test :file="file"></test></div>',
  //     components: {
  //       'test': File
  //     },
  //     data: function(){
  //       return {file: folder};
  //     }
  //   }).$mount();
  //   //TODO: Actually set expects
  //   //expect(vm.$el.querySelector('div').textContent).to.equal('Error: No File');
  // });
});
