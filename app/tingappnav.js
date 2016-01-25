"use strict";

const EventEmitter = require('events');
const util = require('util');

function TingAppNav(){
  var apps = [];
  var nav = $('#filetree');
  var ref = this;

 this.getApps = function(){
   return apps;
 };

  this.refresh = function(){
    apps.forEach(function(app){app.refresh();});
  };

  this.addApp = function(app){
    apps.push(app);
    app.on('change',this.updateNav);
    this.updateNav();
  };

  this.updateNav = function(){
    nav.html("");
    apps.forEach(function(app){
      var name = app.getName();
      var files = app.getFiles();
      var dir = app.getFolder();
      if(nav.find("#"+name).length ===0){
        nav.append("<li><input type='checkbox' id='"+name+"cb'><label for='"+name+"cb'>" + name  + ".tingapp</label><ul id='"+name+"'></ul></li>");
      }
      for (var i in files) {
        $('#'+name).append("<li class='treefile' data-path=" + dir + "/" + files[i] + ">" + files[i] + "</li>");
      }


    });

    $('.treefile').on('click', function() {
      $('.treefile').removeClass('selected');
      $(this).addClass('selected');
      ref.emit('fileOpen',$(this).data("path"));
    });
  };
}

util.inherits(TingAppNav, EventEmitter);
module.exports=TingAppNav;
