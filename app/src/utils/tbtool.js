"use strict";

import path from 'path';
import fs from 'fs';
import resources from './resources';
import {TingProcess} from '../tingprocess.js';

function findPython() {
    var vendorPath = resources.getPath('vendor', 'python27');

    try {
        var vendorPathStat = fs.statSync(vendorPath);

        if (vendorPathStat.isDirectory()) {
            console.log("Using Bundled Python");

            if (process.platform === 'win32') {
                return path.join(vendorPath, "python.exe");
            } else {
                return path.join(vendorPath, "bin", "python");
            }
        }
    } catch (ex) {
        console.warn(ex.message);
    }

    console.log("Using System Python");
    if (process.platform === 'win32') {
        return 'python.exe';
    } else if (process.platform === 'darwin') {
        return '/System/Library/Frameworks/Python.framework/Versions/2.7/bin/python';
    } else {
        return 'python2.7';
    }
}

var pythonExec = findPython();

function findPythonEnvironment() {
    var env = {};

    const tidePackagesDir = resources.getPath('vendor', 'tide-packages');

    if (fs.existsSync(tidePackagesDir)) {
        env.PYTHONPATH = tidePackagesDir;
    }

    return env;
}

var pythonEnvironment = findPythonEnvironment();

function simulate(tingappPath) {
    return _tbtool(['simulate', tingappPath]);
}

function run(tingappPath, tingbotHostname) {
    return _tbtool(['run', tingappPath, tingbotHostname]);
}

function install(tingappPath, tingbotHostname) {
    return _tbtool(['install', tingappPath, tingbotHostname]);
}

function _tbtool(tbtoolArgs) {
    return _python(['-m', 'tbtool', ...tbtoolArgs]);
}

function _python(pythonArgs) {
    return new TingProcess([pythonExec, ...pythonArgs], {
        extraEnv: pythonEnvironment
    });
}

export {
    simulate,
    run,
    install
};
