// test/component-a.spec.js
var Vue = require('vue');
var File = require('../app/src/components/File.vue');
import {TingappFolder,TingappRegularFile} from '../app/src/tingapp.js';

describe('File.vue', function () {

  //TODO: Test Computed Values

  //TODO: Test Right click Menu?

  //TODO: Test events

  //

////////////////////
// Render Testing //
////////////////////

  // What happens when no file is passed in
  it('should render error if not passed file', function () {
    var vm = new Vue({
      template: '<div><test></test></div>',
      components: {
        'test': File
      }
    }).$mount();
    // Should display an error
    expect(vm.$el.querySelector('div').textContent).to.equal('Error: No File');
  });

  // What happens if a normal file is passed in
  it('should render a regular file if passed one', function () {
    var fileName = "untitled";
    var codeFileName = "code.py";
    var regularFile = new TingappRegularFile(fileName);

    var vm = new Vue({
      template: '<div><test :file="file"></test></div>',
      components: {
        'test': File
      },
      data: function(){
        return {file: regularFile};
      }
    }).$mount();

    // Should contain a file row
    expect(vm.$el.querySelector('.file-row')).to.exist;
    // with no dropdown arrow
    expect(vm.$el.querySelector('.file-disclosure-triangle').style.visibility).to.be.empty;
    // with file icon
    expect(vm.$el.querySelector('.file-icon')).to.exist;
    expect(vm.$el.querySelector('.file-icon-file')).to.exist;
    // and file name
    expect(vm.$el.querySelector('.file-name')).to.exist;
    expect(vm.$el.querySelector('.file-name').textContent).to.have.string(fileName);

    //TODO: Test changing data to detect
    // vm.$data.file = new TingappRegularFile(codeFileName);
    //
    // console.log(vm.$data)
    // // Code file icon
    // console.log(vm.$el)

    // Editing name

    // There should also not be a nested filetree

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
  //   // should contain file row
  //   // with dropdown arrow
  //   // with folder icon
  //   // and folder name
  //
  //
  //   //TODO: Change to open
  //   // should have open dropdown arrow
  //   // and open folder icon
  //
  //   // Should be a nested filetree
  //
  //
  //
  //   //expect(vm.$el.querySelector('div').textContent).to.equal('Error: No File');
  // });


  //TODO: Test nested files?
});
