const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const storage = require('electron-json-storage');

let _defaultZoomFactor = null;

function getDefaultZoomFactor(callback) {
  if (_defaultZoomFactor == null) {
    storage.get('TingappWindowDefaultZoomFactor', (error, data) => {
      if (error) {
        console.error('Failed to get stored zoomFactor', error);
        _defaultZoomFactor = 1.0;
      } else {
        _defaultZoomFactor = data.zoomFactor || 1.0;
      }
      callback(_defaultZoomFactor);
    });
  } else {
    callback(_defaultZoomFactor);
  }
}

function setDefaultZoomFactor(zoomFactor) {
  _defaultZoomFactor = zoomFactor;
  storage.set('TingappWindowDefaultZoomFactor', {zoomFactor: zoomFactor}, (error) => {
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
      webPreferences: {
        // if zoom factor is available synchronously, use that
        zoomFactor: _defaultZoomFactor || undefined, 
      }
    };

    // supply default options (but prefer options already there)
    options = Object.assign({}, defaultOptions, options);

    super(options);

    // render index.html which will contain our root Vue component
    this.loadURL('file://' + __dirname + '/index.html');

    // if zoom factor isn't loaded yet, use the async method to load/set
    if (_defaultZoomFactor === null) {
      this.webContents.on('did-finish-load', () => {
        getDefaultZoomFactor((zoomFactor) => {
          console.log('setting zoomFactor to ', zoomFactor);
          this.webContents.setZoomFactor(zoomFactor);
        });
      });
    }
  }

  resetZoom() {
    this.webContents.setZoomFactor(1.0);
    setDefaultZoomFactor(1.0);
  }
  zoomIn() {
    this.webContents.getZoomFactor((zoomFactor) => {
      zoomFactor *= 1.1;
      this.webContents.setZoomFactor(zoomFactor);
      setDefaultZoomFactor(zoomFactor);
    })
  }
  zoomOut() {
    this.webContents.getZoomFactor((zoomFactor) => {
      zoomFactor /= 1.1;
      this.webContents.setZoomFactor(zoomFactor);
      setDefaultZoomFactor(zoomFactor);
    })
  }
}

module.exports = TingappWindow;
