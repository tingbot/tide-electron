const electron = require('electron');
const autoUpdater = electron.autoUpdater;
const dialog = electron.dialog;
const app = electron.app;
const shell = electron.shell;
const os = require('os');
const feed = require("feed-read");
const semver = require('semver');

// this file is run in the main process, not the renderer
console.assert(process.type !== 'renderer');

function showAutoupdateDialog(releaseName, callback) {
    dialog.showMessageBox({
        type: 'question',
        title: 'Update available',
        message: 'An update to Tide is available',
        detail: 'The latest version is '+releaseName+'. You are using '+app.getVersion()+'.',
        buttons: ['Update', 'Cancel'],
    }, function (buttonId) {
        if (buttonId === 0) {
            callback();
        }
    });
}

function showNewVersionAvailableDialog(releaseName, url) {
  dialog.showMessageBox({
      type: 'question',
      title: 'Update available',
      message: 'An update to Tide is available',
      detail: 'The latest version is '+releaseName+'. You are using '+app.getVersion()+'.',
      buttons: ['Download', 'Cancel'],
  }, function (buttonId) {
      if (buttonId === 0) {
          shell.openExternal(url);
      }
  });
}

function setupOSXWin(){
  autoUpdater.on('error', function (err) { console.log('Autoupdate: error', err); });
  autoUpdater.on('update-available', function () { console.log('Autoupdate: update available, downloading...');});
  autoUpdater.on('update-not-available', function () { console.log('Autoupdate: Up to date.');});
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName) {
      showAutoupdateDialog(releaseName, function () {
          autoUpdater.quitAndInstall();
      });
  });

  const version = app.getVersion();

  if (process.platform === 'darwin') {
      const platform = os.platform() + '_' + os.arch();

      autoUpdater.setFeedURL('http://tide-download.tingbot.com/update/'+platform+'/'+version);
      autoUpdater.checkForUpdates();
  } else if (process.platform === 'win32') {
      autoUpdater.setFeedURL('http://tide-download.tingbot.com/update/win32/'+version);
      autoUpdater.checkForUpdates();
  }
}

function setupLinux(){
  feed('http://tide-download.tingbot.com/feed/channel/all.atom',function(err,versions){
    var newest = versions[0].title;
    if(semver.gt(newest,app.getVersion())){
      showNewVersionAvailableDialog(newest,'https://github.com/tingbot/tide-electron/releases')
    }
  });
}

module.exports.setup = function () {
  if (process.platform === 'linux') {
      setupLinux();
    } else {
      setupOSXWin();
  }
};
