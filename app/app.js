const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const shell = electron.shell;
const fs = require('fs');
const path = require('path');
const autoupdate = require('./autoupdate');
const examplesMenu = require('./examples');

if (require('electron-squirrel-startup')) return;

function createWindow(on_load) {
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

    const newWindow = new BrowserWindow({
        width: 700,
        height: 600,
        minWidth: 450,
        minHeight: 300,
        darkTheme: true,
        backgroundColor: '#1c1c1c',
        title: 'Tide',
    });

    if (on_load) {
        newWindow.webContents.on('did-finish-load', function() {
            on_load(newWindow);
        });
    }

    // render index.html which will contain our root Vue component
    newWindow.loadURL('file://' + __dirname + '/index.html');
}

function newProject(options = {}) {
    createWindow(function(win) {
        win.webContents.send('new-project', options);
    });
}

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

    const menuTemplate = buildMenuTemplate();
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

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

function buildMenuTemplate() {
    let template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    click: function(item, focusedWindow) {
                        newProject();
                    },
                    accelerator: 'CmdOrCtrl+N'
                }, {
                    label: 'Examples',
                    submenu: examplesMenu(function (exampleToOpen) {
                        newProject({template: exampleToOpen});
                    }),
                }, {
                    label: 'Open…',
                    click: function(item, focusedWindow) {
                        dialog.showOpenDialog({
                            filters: [{
                                name: 'Tingapps',
                                extensions: ['tingapp','tbinfo']
                            }, ],
                            properties: ['openFile']
                        }, function(filenames) {
                            console.log(filenames);
                            if (filenames !== undefined && filenames.length > 0) {
                                openProject(filenames[0]);
                            }
                        });
                    },
                    accelerator: 'CmdOrCtrl+O'
                }, {
                    type: 'separator'
                }, {
                    label: 'Save',
                    click: function(item, focusedWindow) {
                        focusedWindow.webContents.send('save-document');
                    },
                    accelerator: 'CmdOrCtrl+S'
                }, {
                    label: 'Save As…',
                    click: function(item, focusedWindow) {
                        focusedWindow.webContents.send('save-as-document');
                    },
                    accelerator: 'CmdOrCtrl+Shift+S'
                }, {
                    label: 'Save All',
                    click: function(item, focusedWindow) {
                        focusedWindow.webContents.send('save-all-documents');
                    }
                }, {
                    type: 'separator'
                }, {
                    label: 'Print…',
                    click: function(item, focusedWindow) {
                        focusedWindow.webContents.print();
                    },
                    accelerator: 'CmdOrCtrl+P'
                },
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectall'
                },
            ]
        },
        {
            label: 'App',
            submenu: [
                {
                    label: 'Run',
                    accelerator: 'CmdOrCtrl+R',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.webContents.send('vue-event', 'menu-run');
                        }
                    },
                },
                {
                    label: 'Stop',
                    accelerator: 'CmdOrCtrl+.',
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.webContents.send('vue-event', 'menu-stop');
                        }
                    },
                },
            ]
        },
        {
            label: 'Window',
            role: 'window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                },
                {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: function(item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.reload();
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: (function() {
                        if (process.platform == 'darwin')
                            return 'Alt+Command+I';
                        else
                            return 'Ctrl+Shift+I';
                    })(),
                    click: function(item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.toggleDevTools();
                    }
                },
            ]
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Tingbot Documentation',
                    click: function() { shell.openExternal('http://docs.tingbot.com') }
                }
            ]
        },
    ];

    if (process.platform === 'darwin') {
        var name = app.getName();
        template.unshift({
            label: name,
            submenu: [
                {
                    label: 'About ' + name,
                    role: 'about'
                },
                {
                    label: 'Tingbot WiFi settings…',
                    click: function(item, focusedWindow) {
                        openWifiSetup()
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Services',
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Hide ' + name,
                    accelerator: 'Command+H',
                    role: 'hide'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    role: 'hideothers'
                },
                {
                    label: 'Show All',
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: function() { app.quit(); }
                },
            ]
        });
        var windowMenu = template.find(function(m) { return m.role === 'window' })
        if (windowMenu) {
            windowMenu.submenu.push(
                {
                    type: 'separator'
                },
                {
                    label: 'Bring All to Front',
                    role: 'front'
                }
            );
        }
    } else {
        // add to the file menu
        template[0].submenu.push({
            label: 'Tingbot WiFi settings…',
            click: function(item, focusedWindow) {
                openWifiSetup()
            }
        });
    }

    return template;
}
