"use strict";
// Make contact with the rest of the app
const ipcRenderer = require('electron').ipcRenderer;
var TingAppNav = require("./app/tingappnav");
var TingApp = require("./app/tingapp");
var Editor = require("./app/editor");

var editor = new Editor();


// // Ensures editor is the right size
// $('#editor').height(window.innerHeight - $('#top-menu').height());

// ipcRenderer.on('resize', function(event, newSize) {
//     $('#editor').height(newSize[1] - $('#top-menu').height());
// });

ipcRenderer.on('refreshTingBots', function(event, tingbots) {
  $('#device-list').html("");
  $('#device-list').append("<option value='simulate'>Tingbot Simulator</option>");
  for (var i in tingbots) {
    $('#device-list').append("<option value='" + tingbots[i].address + "'>" + tingbots[i].name + "</option>");
  }

});


// Start implementing UI callbacks
function startTest() {
  var tingbot = $('#device-list').val();
  console.log(ipcRenderer.send('startTest', tingbot, current_app));

}


// Start Sidebar control
var holder = document.getElementById('sidebar');
holder.ondragover = function() {
  return false;
};
holder.ondragleave = holder.ondragend = function() {
  return false;
};
holder.ondrop = function(e) {
  e.preventDefault();
  var file = e.dataTransfer.files[0];
  console.log(file);
  console.log('File you dragged here is', file.path);
  ipcRenderer.send("fileAdd", file);

  return false;
};

// directory stuff
var fs = require('fs');

var path = require('path');




function openFile(path) { //TODO: Check if image or something other than python
  console.log("Opening" + path);
  fs.readFile(path, function(err, data) {
    editor.setValue(data.toString(), 1);
  });
}
//saveDir(__dirname + "/default.tingapp", current_app, loadTingapp);

var tingappnav = new TingAppNav();
var current_app = new TingApp(__dirname + "/default.tingapp");
var temp_path = require('temp').path() + "/new.tingapp";
current_app.copy(temp_path);

tingappnav.addApp(current_app);

var current_app = new TingApp(__dirname + "/default.tingapp");
var temp_path = require('temp').path() + "/new2.tingapp";
current_app.copy(temp_path);

tingappnav.addApp(current_app);

tingappnav.on('fileOpen',editor.openFile);

// DragBar

$('#dragbar').mousedown(function(e) {

  e.preventDefault();

  $(document).mousemove(function(e) {
    $('#sidebar').css("width", e.pageX + 2);
    $('.main').css("left", e.pageX + 2);
  });

});
$(document).mouseup(function(e) {

  $(document).unbind('mousemove');
});
