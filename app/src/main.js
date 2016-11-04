import Vue from 'vue';
import {default as TingappVue} from './Tingapp.vue';
import {Tingapp, TingappFile} from './tingapp.js';
import {ipcRenderer, remote} from 'electron';

require('./utils/exceptionhandling.js').setup();

let vm = window.vueInstance = new Vue({
  el: 'body',
  template: "<app :tingapp='tingapp'></app>",
  components: { app: TingappVue },
  data: { tingapp: { root: { files:[] } }},
  replace: false,
});

ipcRenderer.on('new-project', function (event, options = {}) {
    vm.tingapp = Tingapp.newDocument(options);
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

const ignore = (e) => { e.preventDefault(); e.stopPropagation() };

document.addEventListener('dragenter', ignore);
document.addEventListener('dragover', ignore);
document.addEventListener('drop', ignore);
document.addEventListener('dragleave', ignore);

window.addEventListener('beforeunload', function (event) {
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
        event.returnValue = true; // cancel the window close
      } else {
        // Don't save
      }
    }
  }
  catch (err) {
    try {
      const dialog = remote.dialog;
      const button_index = dialog.showMessageBox(remote.getCurrentWindow(), {
        type: "error",
        buttons: ['Cancel', 'Close without saving'],
        defaultId: 0,
        message: `An error occurred while trying to save this app.`,
        detail: `If you close now you'll lose any unsaved changes.\n\nThe error was ${err.stack}`,
      });

      if (button_index == 0) {
        event.returnValue = true; // cancel the window close
      }
    }
    catch (dialogErr) {
      // this catch statement halts the debugger if open, otherwise any exceptions above are
      // discarded.
      console.error(dialogErr);
      debugger;
      event.returnValue = true; // cancel the window close
    }
  }
});
