const electron = require('electron');
const autoUpdater = electron.autoUpdater;
const dialog = electron.dialog;
const app = electron.app;
const os = require('os');

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
		if (buttonId == 0) {
			callback();
		}
	});
};

module.exports.setup = function () {
	if (process.platform === 'darwin') {
		const platform = os.platform() + '_' + os.arch();
		const version = app.getVersion();

		autoUpdater.on('error', function (err) { console.log('Autoupdate: error', err); })
		autoUpdater.on('update-available', function () { console.log('Autoupdate: update available, downloading...')})
		autoUpdater.on('update-not-available', function () { console.log('Autoupdate: Up to date.')})
		autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName) {
			showAutoupdateDialog(releaseName, function () {
				autoUpdater.quitAndInstall();
			});
		})

		autoUpdater.setFeedURL('http://tide-download.tingbot.com/update/'+platform+'/'+version);
		autoUpdater.checkForUpdates();
    }
}
