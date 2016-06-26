const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const dialog = electron.dialog;
const defaultMenu = require('electron-default-menu')
const BrowserWindow = electron.BrowserWindow;
const fs = require('fs');

if (require('electron-squirrel-startup')) return;

function createWindow(on_load) {
    newWindow = new BrowserWindow({
        width: 700,
        height: 600,
        darkTheme: true,
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

function newProject() {
    createWindow(function(win) {
        win.webContents.send('new-project');
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

app.on('ready', function() {
    // Get template for default menu
    var menu = defaultMenu();

    // on the mac the first menu is the Application menu, File comes after that.
    var fileMenuLocation =  (process.platform === 'darwin') ? 1 : 0;

    // Add File menu
    menu.splice(fileMenuLocation, 0, {
        label: 'File',
        submenu: [{
            label: 'New',
            click: function(item, focusedWindow) {
                newProject();
            },
            accelerator: 'CmdOrCtrl+N'
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
        }, ]
    });

    // Set top-level application menu, using modified template
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

    newProject();
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
