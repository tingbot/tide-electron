"use strict";
import {spawn,spawnSync} from 'child_process';
import path from 'path';
import fs from 'fs';
import resources from './resources';
import {TingProcess} from '../tingprocess.js';


function findPython(){
  var vendorPath = resources.getPath('vendor', 'python');

  try {
    var vendorPathStat = fs.statSync(vendorPath);

    if(vendorPathStat.isDirectory()){
      console.log("Using Bundled Python");

      if(process.platform === 'win32'){
        return path.join(vendorPath,"python.exe")
      } else {
        return path.join(vendorPath,"bin","python")
  }
  }
  } catch(ex){
    console.warn(ex.message);
  }

<<<<<<< Updated upstream
  console.log("Using System Python");
  if (process.platform === 'win32') {
    return 'python.exe';
  }else{
    return 'python';
=======
  if(tingbot == "simulate"){
    current = spawn(pythonExec, ['-m', 'tbtool', 'simulate',dir]);
      console.log("Spawned "+dir);
  }else{
    current = spawn(pythonExec, ['-m', 'tbtool','run',dir,tingbot]);
    console.log("Spawned" + dir+ " on "+tingbot);
>>>>>>> Stashed changes
  }
}

var pythonExec = findPython()

function findPythonEnvironment() {
  var env = {};

  const tidePackagesDir = resources.getPath('vendor', 'tide-packages');

  if (fs.existsSync(tidePackagesDir)) {
    env.PYTHONPATH = tidePackagesDir;
  }

  return env;
  }

var pythonEnvironment = findPythonEnvironment()

function simulate (tingappPath) {
  return _tbtool(['simulate', tingappPath])
  }

function run (tingbotHostname, tingappPath) {
  return _tbtool(['run', tingbotHostname, tingappPath])
}

function install (tingbotHostname, tingappPath) {
  return _tbtool(['install', tingbotHostname, tingappPath])
  }

function _tbtool (tbtoolArgs) {
  return _python(['-m', 'tbtool', ...tbtoolArgs]);
    }

function _python (pythonArgs) {
  return new TingProcess([pythonExec, ...pythonArgs], {
    extraEnv: pythonEnvironment
  })
}

export {simulate, run, install}
