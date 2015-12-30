var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.
var mdns = require('multicast-dns')();

const ipcMain = require('electron').ipcMain;

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

var tingbots = [];

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    darkTheme: true
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on('resize', function(){
    mainWindow.webContents.send('resize',mainWindow.getSize());
  });

  var minutes = 5,
    the_interval = minutes * 60 * 1000;
  setInterval(function() {
    console.log("I am doing my 5 minutes check for new tingbots");
    updateDNS();
  }, the_interval);
  updateDNS();

  ipcMain.on('startTest', function(event, arg) {
    console.log("received");
    var subpy = require('child_process').spawn('vendor/tbtool', ['simulate','./test.py']);
    event.returnValue = "derp";
  });

  ipcMain.on('fileAdd', function(event,file){

  });

  mainWindow.webContents.on('did-finish-load',function(){
    mainWindow.webContents.send('refreshTingBots',tingbots);
  });


});

mdns.on('response', function(response) {
  console.log('got a response packet:', response);
  if(response.questions[0].name == "_tingbot-ssh._tcp.local"){
  for(var i in response.answers){
    if(response.answers[i].type == 'SRV'){
      console.log('IDENTIFIED TINGBOT SRV:' + JSON.stringify(response.answers[i].data));
    }
    if(response.answers[i].type == 'A'){
      console.log('IDENTIFIED TINGBOT:' + response.answers[i].name + "@" + response.answers[i].data);
      addTingBot(response.answers[i].name,response.answers[i].data);
    }
  }
}
});

function updateDNS(){
  console.log("DNS Ping");
  mdns.query({
  questions:[{
    name: '_tingbot-ssh._tcp.local',
    type: 'PTR'
  }]
});
}

function setupTempFile(){

}
function addTingBot(name,address){
  for(var i in tingbots){
    if(tingbots[i].address == address ){
      mainWindow.webContents.send('refreshTingBots',tingbots);
      return;
    }
  }
  tingbots.push({name: name, address: address});
  mainWindow.webContents.send('refreshTingBots',tingbots);
}
