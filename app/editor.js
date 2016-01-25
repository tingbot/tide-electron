"use strict";

var fs = require('fs');

function Editor(){
  // Setup our editor
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  var PythonMode = ace.require("ace/mode/python").Mode;
  editor.session.setMode(new PythonMode());

  editor.setShowPrintMargin(false);

  editor.$blockScrolling = Infinity;

  this.openFile = function(path) { //TODO: Check if image or something other than python
    console.log("Opening" + path);
    fs.readFile(path, function(err, data) {
      editor.setValue(data.toString(), 1);
    });
  }
}

module.exports=Editor;
