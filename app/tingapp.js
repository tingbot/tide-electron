"use strict";

var fs = require('fs');
var path = require('path');
var ncp = require('ncp').ncp;
const EventEmitter = require('events');
const util = require('util');

/*
This is a model of a tingapp
*/

function TingApp(dir){
  var folder = dir;
  var files = [];
  var apppath = path.parse(dir);
  var ref = this;

  this.refresh = function(){
    apppath = path.parse(folder);
    fs.readdir(folder, function(err, array) {
      if(err) return err;
      files = array;
      ref.emit('change');
      console.log(files);
    });

  };

  this.move = function(path){

  };

  this.copy = function(destination){
    var destpath = path.parse(destination);
    fs.mkdir(destpath.dir, function() {
      ncp(folder, destination, function(err) {
        if (err) {
          return console.error(err);
        }

        console.log(destination);
        folder = destination;
        ref.refresh();
      });
    });
  };

  this.getName = function(){
    return apppath.name;
  };
  this.getFolder = function(){
    return folder;
  };

  this.getFiles = function(){
    return files;
  };

}

util.inherits(TingApp, EventEmitter);
module.exports = TingApp;
