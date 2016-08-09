"use strict";
import {spawn,spawnSync} from 'child_process';
import path from 'path';
import fs from 'fs';
import resources from './resources';
// var spawn = require('child_process').spawn;
// var spawnSync = require('child_process').spawnSync;

const tide_packages_dir = resources.getPath('vendor', 'tide-packages');

if (fs.existsSync(tide_packages_dir)) {
  process.env.PYTHONPATH = tide_packages_dir;
}

var current = null;
var requirements_met = check_requirements();


function start(tingbot,dir){

  if(!requirements_met && !check_requirements()){
    return;
  }
  var pythonExec = findPython();
  if(current){
    current.kill();
  }

  if(tingbot == "simulate"){
    current = spawn(pythonExec, ['-m', 'tbtool', 'simulate',dir]);
      console.log("Spawned");
  }else{
    current = spawn(pythonExec, ['-m', 'tbtool','run',tingbot,dir]);
  }

}

function check_requirements(){
  console.log("check");
  var exit;
  var missing = [];

  var pythonExec = findPython();

  exit = spawnSync(pythonExec,['-V']);

  if(exit.status !== 0){
    missing.push('Python');
  }

  exit = spawnSync(pythonExec,['-c','import pygame']);

  if(exit.status !== 0){
    missing.push('pygame');
  }

  exit = spawnSync(pythonExec,['-c','import tingbot']);

  if(exit.status !== 0){
    missing.push('python-tingbot');
  }


  if(missing.length > 0){
    alert("You are missing: " + missing.toString() + ". Code execution disabled");
    return false;
  }
  return true;
}

function findPython(){
  var vendorPath = resources.getPath('vendor', 'python');

  try{
    var pythonStat = fs.statSync(vendorPath);
    if(!pythonStat.isDirectory()){
      //no vendor use system python
      console.log("Using System Python");
      return 'python';
    }
    console.log("Using Bundled Python");
    if(process.platform === 'win32'){
      return path.join(vendorPath,"python.exe")
    }else{
      return path.join(vendorPath,"bin","python")
    }
  } catch(ex){
    console.log("Using System Python");
    return 'python';
  }
}

module.exports.start = start;
