const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const fs = require('fs');
const path = require('path');
const autoupdate = require('./autoupdate');
const menu = require('./menu');
const TingappWindow = require('./TingappWindow');

if (require('electron-squirrel-startup')) return;

require('./src/utils/exceptionhandling.js').setup();

function createWindow(on_load) {
    const newWindow = new TingappWindow();

    if (on_load) {
        newWindow.webContents.on('did-finish-load', function() {
            on_load(newWindow);
        });
    }
}

function newProject(options = {}) {
    createWindow(function(win) {
        win.webContents.send('new-project', options);
    });
}

exports.newProject = newProject

function openProject(pathToOpen) {
    // the user opens the app.tbinfo file on Linux/Windows
    // go up one level and select that as the project
    if (fs.statSync(pathToOpen).isFile()) {
        pathToOpen = path.dirname(pathToOpen);
    }

    createWindow(function(win) {
        win.webContents.send('open-project', pathToOpen);
    });
}

exports.openProject = openProject

function showOpenProjectDialog() {
    dialog.showOpenDialog({
        filters: [{
            name: 'Tingapps',
            extensions: ['tingapp','tbinfo']
        }, ],
        properties: ['openFile']
    }, function(filenames) {
        console.log('Open dialog returned filenames', filenames);
        if (filenames !== undefined && filenames.length > 0) {
            openProject(filenames[0]);
        }
    });
}

exports.showOpenProjectDialog = showOpenProjectDialog

var wifiSetupWindow = null;

function openWifiSetup() {
    if (wifiSetupWindow) {
        wifiSetupWindow.show();
        return;
    }

    wifiSetupWindow = new BrowserWindow({
        width: 455,
        height: 255,
        resizable: false,
        fullscreen: false,
        maximizable: false,
        backgroundColor: '#e6e6e6',
        title: 'Tingbot Wifi Setup',
        autoHideMenuBar: true,
        show: false,
    });

    wifiSetupWindow.once('ready-to-show', () => {
        wifiSetupWindow.show()
    })

    wifiSetupWindow.on('closed', function () {
        wifiSetupWindow = null;
    });

    // render index.html which will contain our root Vue component
    wifiSetupWindow.loadURL('file://' + __dirname + '/wifisetup/index.html');
}

exports.openWifiSetup = openWifiSetup

var appIsReady = false;
var projectsToOpenWhenReady = [];

app.on('open-file', function (event, path) {
    if (appIsReady) {
        openProject(path);
    } else {
        projectsToOpenWhenReady.push(path);
    }
});

app.on('ready', function() {
    autoupdate.setup();
    menu.setup();

    try {
        var electronDevtoolsInstaller = require('electron-devtools-installer');
        var installExtension = electronDevtoolsInstaller.default;
        installExtension(electronDevtoolsInstaller.VUEJS_DEVTOOLS)
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log('An error occurred: ', err));
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            // electron-devtools-installer isn't available in production builds,
            // ignore this error
        } else {
            throw e;
        }
    }

    if (projectsToOpenWhenReady.length === 0) {
        newProject();
    } else {
        for (var projectPath of projectsToOpenWhenReady) {
            openProject(projectPath);
        }
    }

    appIsReady = true;
});

// when all windows are closed, quit the application on Windows/Linux
app.on('window-all-closed', function() {
    // only quit the application on OS X if the user hits cmd + q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    // create a new document if the dock icon is clicked in OS X and no other
    // windows were open
    if (BrowserWindow.getAllWindows().length === 0) {
        newProject();
    }
});
