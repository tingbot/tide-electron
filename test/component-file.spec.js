// test/component-a.spec.js
var Vue = require('vue');
var File = require('../app/src/components/File.vue');

describe('a.vue', function () {

  // asserting JavaScript options
  it('should have correct message', function () {
    expect(File.data().folderOpen).to.equal(false);
  })

  // asserting rendered result by actually rendering the component
  it('should render correct message', function () {
    var vm = new Vue({
      template: '<div><test></test></div>',
      components: {
        'test': File
      }
    }).$mount()
    console.log(vm.$data);
    expect(vm.$data).to.exist;
  });
});
