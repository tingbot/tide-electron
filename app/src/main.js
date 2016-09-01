import Vue from 'vue';
import {default as TingappVue} from './Tingapp.vue';
import {Tingapp, TingappFile} from './tingapp.js';
import {ipcRenderer, remote} from 'electron';

let vm = window.vueInstance = new Vue({
  el: 'body',
  template: "<app :tingapp='tingapp'></app>",
  components: { app: TingappVue },
  data: { tingapp: { root: { files:[] } }},
  replace: false,
});

ipcRenderer.on('new-project', function () {
    vm.tingapp = Tingapp.newDocument();
});

ipcRenderer.on('open-project', function (event, path) {
    vm.tingapp = Tingapp.openDocument(path);
});

ipcRenderer.on('save-document', function () {
    if (vm.tingapp.isTemporary) {
      saveAs();
    } else {
      vm.$broadcast("saveFile");
    }
});

ipcRenderer.on('vue-event', function (event, vueEventName) {
    vm.$broadcast(vueEventName);
});

function saveAs() {
  const dialog = remote.dialog;

  const savePath = dialog.showSaveDialog(remote.getCurrentWindow(), {
    title: 'Save as…',
    buttonLabel: 'Save',
    filters: [{
      name: 'Tingapps',
      extensions: ['tingapp']
    }]
  });

  if (savePath !== undefined) {
    vm.tingapp.saveTo(savePath);
    vm.tingapp = Tingapp.openDocument(savePath);
  }
}

ipcRenderer.on('save-as-document', function () {
    saveAs();
});

ipcRenderer.on('save-all-documents', function () {
    if (vm.tingapp.isTemporary) {
      saveAs();
    } else {
      vm.tingapp.save();
    }
});

document.addEventListener('drop', function(e) {
  e.preventDefault();
  e.stopPropagation();
});
document.addEventListener('dragover', function(e) {
  e.preventDefault();
  e.stopPropagation();
});

window.addEventListener('beforeunload', function (e) {
  try {
    if (vm.tingapp.changed) {
      const dialog = remote.dialog;

      const button_index = dialog.showMessageBox(remote.getCurrentWindow(), {
        type: 'question',
        buttons: ['Save', 'Cancel', 'Don’t Save'],
        defaultId: 0,
        message: `Do you want to save the changes made to the document “${vm.tingapp.root.name}”?`,
        detail: 'Your changes will be lost if you don’t save them.',
      });

      if (button_index === 0) {
        // Save
        if (vm.tingapp.isTemporary) {
          saveAs();
        } else {
          vm.tingapp.save();
        }
      } else if (button_index == 1) {
        // Cancel
        e.returnValue = true; // cancel the window close
      } else {
        // Don't save
      }
    }
  }
  catch (e) {
    // this catch statement halts the debugger if open, otherwise any exceptions above are
    // discarded.
    console.log(e);
    debugger;
  }
});
