const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

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
  }
}

module.exports = TingappWindow;
