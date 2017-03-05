const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const storage = require('electron-json-storage');

let _defaultZoomLevel = null;

function getDefaultZoomLevel(callback) {
  if (_defaultZoomLevel == null) {
    storage.get('TingappWindowDefaultZoomLevel', (error, data) => {
      if (error) {
        console.error('Failed to get stored zoom level', error);
        _defaultZoomLevel = 0;
      } else {
        _defaultZoomLevel = data.level || 0;
      }
      callback(_defaultZoomLevel);
    });
  } else {
    callback(_defaultZoomLevel);
  }
}

function setDefaultZoomLevel(level) {
  _defaultZoomLevel = level;
  storage.set('TingappWindowDefaultZoomLevel', {level: level}, (error) => {
    if (error) throw error;
  });
}

class TingappWindow extends BrowserWindow {
  constructor(options) {
    const defaultOptions = {
      width: 700,
      height: 600,
      minWidth: 450,
      minHeight: 300,
      darkTheme: true,
      backgroundColor: '#1c1c1c',
      title: 'Tide',
    };

    // supply default options (but prefer options already there)
    options = Object.assign({}, defaultOptions, options);

    super(options);

    // render index.html which will contain our root Vue component
    this.loadURL('file://' + __dirname + '/index.html');

    // set the zoom level to the default
    this.webContents.on('did-finish-load', () => {
      getDefaultZoomLevel((level) => {
        console.log('setting level to ', level);
        this.webContents.setZoomLevel(level);
      });
    });
  }

  zoomIn() {
    this.webContents.getZoomLevel((level) => {
      level += 0.5;
      this.webContents.setZoomLevel(level);
      setDefaultZoomLevel(level);
    })
  }
  zoomOut() {
    this.webContents.getZoomLevel((level) => {
      level -= 0.5;
      this.webContents.setZoomLevel(level);
      setDefaultZoomLevel(level);
    })
  }
}

module.exports = TingappWindow;
