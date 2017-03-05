const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const tideApp = require('./app');
const resources = require('./src/utils/resources');
const fs = require('fs');
const path = require('path');

/**
 * This module governs the application menu for Tide.
 *
 * The menu is configured here, but some menu items are enabled/disabled according to the
 * focused window.
 *
 * Windows can set to enable/disable menu items by setting the enabledMenuItems property
 * on their browserWindow. This can be done with the `remote` module, e.g.
 * `remote.getCurrentWindow().enabledMenuItems = {save: true}`.
 */

let windowMenuItems = null;
let focusedWindow = null;

function setup () {
    // enabledMenuItems is set by the renderer process using `remote`. The events
    // are observed in this process and the enabled/disabled menu items are 
    // updated.
    Object.defineProperty(BrowserWindow.prototype, 'enabledMenuItems', {
        get: function () { return this._enabledMenuItems; },
        set: function (enabledMenuItems) {
            this._enabledMenuItems = enabledMenuItems
            app.emit('enabledMenuItemsChanged', this)
        },
    })

    const menuTemplate = buildMenuTemplate()
    const menu = Menu.buildFromTemplate(menuTemplate)

    Menu.setApplicationMenu(menu)

    windowMenuItems = {
        save: getMenuItem(menu, ['File', 'Save']),
        saveAs: getMenuItem(menu, ['File', 'Save As…']),
        run: getMenuItem(menu, ['App', 'Run']),
        stop: getMenuItem(menu, ['App', 'Stop']),
    }

    enableMenuItemsBasedOnFocusedWindow()

    app.on('enabledMenuItemsChanged', function (browserWindow) {
        if (focusedWindow === browserWindow) {
            enableMenuItemsBasedOnFocusedWindow()
        }
    })

    app.on('browser-window-blur', function (event, browserWindow) {
        focusedWindow = null;
        enableMenuItemsBasedOnFocusedWindow();
    });
    app.on('browser-window-focus', function (event, browserWindow) {
        focusedWindow = browserWindow;
        enableMenuItemsBasedOnFocusedWindow();
    });
    app.on('browser-window-created', function (event, browserWindow) {
        if (browserWindow.isFocused()) {
            focusedWindow = browserWindow;
            enableMenuItemsBasedOnFocusedWindow();
        }
    });
}

module.exports.setup = setup

function getMenuItem (menu, keyPath) {
    keyPath = Array.from(keyPath)
    let menuItem = null

    while (keyPath.length > 0) {
        const key = keyPath.shift()
        menuItem = menu.items.find(function (m) { return m.label === key })
        menu = menuItem.submenu
    }

    return menuItem
}

function enableMenuItemsBasedOnFocusedWindow () {
    let enabledMenuItems = {}

    if (focusedWindow && focusedWindow.enabledMenuItems) {
        enabledMenuItems = focusedWindow.enabledMenuItems
    }

    for (let menuItemId in windowMenuItems) {
        const menuItem = windowMenuItems[menuItemId]

        if (enabledMenuItems && enabledMenuItems[menuItemId]) {
            menuItem.enabled = true
        } else {
            menuItem.enabled = false
        }
    }
}

function buildMenuTemplate () {
    let template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    click: function(item, focusedWindow) {
                        tideApp.newProject();
                    },
                    accelerator: 'CmdOrCtrl+N'
                }, {
                    label: 'Examples',
                    submenu: examplesMenu(),
                }, {
                    label: 'Open…',
                    click: function(item, focusedWindow) {
                        tideApp.showOpenProjectDialog();
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
                        tideApp.openWifiSetup()
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
                tideApp.openWifiSetup()
            }
        });
    }

    return template;
}

function examplesMenu() {
    const examplesDir = resources.getPath('app', 'examples');
    const menuItems = [];

    for (let filename of fs.readdirSync(examplesDir).sort()) {
        // parse the name
        const match = filename.match(/^[0-9]+ (.*?)(\..+)?$/);

        // ignore anything that doesn't start with a number
        if (!match) continue;

        let name, extension;
        [, name, extension] = match;

        // if it's a tingapp, add that to the menu
        if (extension === '.tingapp') {
            const filepath = path.join(examplesDir, filename);

            menuItems.push({
                label: `  ${name}`,
                click: () => { tideApp.newProject({template: filepath}) },
            })
        } else {
            menuItems.push({
                label: name,
                enabled: false
            })
        }
    }

    return menuItems;
}
