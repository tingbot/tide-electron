"use strict";
import {spawn,spawnSync} from 'child_process'
// var spawn = require('child_process').spawn;
// var spawnSync = require('child_process').spawnSync;
var current = null;
var requirements_met = check_requirements();




function start(tingbot,dir){

  if(!requirements_met && !check_requirements()){
    return;
  }

  if(current){
    current.kill();
  }

  if(tingbot == "simulate"){
    current = spawn('tbtool', ['simulate',dir]);
      console.log("Spawned");
  }else{
    current = spawn('tbtool', ['run',tingbot,dir]);
  }

}

function check_requirements(){
  console.log("check");
  var exit;
  var missing = [];

  exit = spawnSync('python',['-V']);

  if(exit.status !== 0){
    missing.push('Python');
  }

  exit = spawnSync('python',['-c','import pygame']);

  if(exit.status !== 0){
    missing.push('pygame');
  }

  exit = spawnSync('python',['-c','import tingbot']);

  if(exit.status !== 0){
    missing.push('python-tingbot');
  }


  if(missing.length > 0){
    alert("You are missing: " + missing.toString() + ". Code execution disabled");
    return false;
  }
  return true;
}

module.exports.start = start;
