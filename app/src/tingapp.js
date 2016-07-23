import path from 'path';
import fs from 'fs';
import fsextra from 'fs-extra';
import {remote} from 'electron';
import ace from 'brace';
import pty from 'pty.js';

class Tingapp {
    constructor(path) {
        this.root = new TingappRootFolder(path);
    }

    static newDocument() {
        const tempDir = remote.app.getPath('temp');

        const newDocumentPath = path.join(tempDir, 'untitled.tingapp');
        console.log(newDocumentPath);
        // check for dev to select where to fetch resources from
        if(/[\\/]electron-prebuilt[\\/]/.test(process.execPath)){
          fsextra.copySync('./default.tingapp', newDocumentPath);
        }else{
          fsextra.copySync(path.join(process.resourcesPath,'default.tingapp'), newDocumentPath);
        }


        return new Tingapp(newDocumentPath);
    }

    static openDocument(path) {
        return new Tingapp(path);
    }

    get files() {
        return this.root.files;
    }

    spawn_simulate() {
        return pty.spawn('tbtool', ['simulate', this.root.path], {
            name: 'xterm-256color',
        });
    }

    spawn_run(tingbotHostname) {
        return pty.spawn('tbtool', ['run', tingbotHostname, this.root.path], {
            name: 'xterm-256color',
        });
    }

    spawn_install(tingbotHostname) {
        return pty.spawn('tbtool', ['install', tingbotHostname, this.root.path], {
            name: 'xterm-256color',
        });
    }
}

class TingappFile {
    constructor(name, parent) {
        this.name = name;
        this.parent = parent;
    }

    get path() {
        return path.join(this.parent.path, this.name);
    }

    get type() {
        return 'file';
    }

    wasRemoved() {
        this.parent = null;
    }
}

class TingappRegularFile extends TingappFile {
    constructor(name, parent) {
        super(name, parent);
    }

    get type() {
        const file_type_map = {
            '.jpg': 'image',
            '.jpeg': 'image',
            '.gif': 'image',
            '.png': 'image',
            '.py': 'code',
            '.txt': 'text',
            '.csv': 'text',
        }
        const extension = path.extname(this.name);

        if (extension in file_type_map) {
            return file_type_map[extension];
        }

        return 'file';
    }

    // callback takes two arguments, (err, data)
    read(callback) {
        fs.readFile(this.path, callback);
    }

    write(data, callback){
        fs.writeFile(this.path,data,callback);
    }

    get editSession(){
      if(this.session){
        return this.session;
      }else{
        this.session = new ace.EditSession("Loading Data","ace/mode/python");
        this.session.setUndoManager(new ace.UndoManager());
        this.read((err,data) => {
          this.session.setValue(data.toString('utf8'));
        });
        return this.session;
      }
    }

    get changed(){
      if(this.session){
        return true;
      }else{
        return false;
      }
    }

    save(){
      if(this.session){
        this.write(this.session.getValue(),function(err){
          if(err) console.log(err);
        });
        this.session.getUndoManager().reset();
      }
    }


}

class TingappFolder extends TingappFile {
    constructor(name, parent) {
        super(name, parent);
        this.files = [];
        this._reloadFiles();
        this._startWatching();
    }

    get type() {
        return 'folder';
    }

    _startWatching() {
        this._watcher = fs.watch(this.path, {persistent: false}, () => {
            this._reloadFiles();
        });
    }

    wasRemoved() {
        super.wasRemoved();
        this._watcher.close();
    }

    _reloadFiles() {
        let filename_list = fs.readdirSync(this.path);

        // copy the array
        let oldFiles = this.files.slice();
        let newFiles = [];

        for (let filename of filename_list) {
            let newFile;
            // look for a TingappFile with this path in oldFiles
            let oldFileIndex = oldFiles.findIndex(file => file.name == filename);

            if (oldFileIndex > -1) {
                newFile = oldFiles[oldFileIndex];
                // remove this file from the old array
                oldFiles.splice(oldFileIndex, 1);
            } else {
                let filepath = path.join(this.path, filename);

                if (fs.lstatSync(filepath).isDirectory()) {
                    newFile = new TingappFolder(filename, this);
                } else {
                    newFile = new TingappRegularFile(filename, this);
                }
            }

            newFiles.push(newFile);
        }

        // anything still in oldFiles has been removed.
        for (let oldFile of oldFiles) {
            oldFile.wasRemoved();
        }

        this.files = newFiles;
    }

    save(){
      for(let file of this.files){
        file.save();
      }
    }

    addFile(source){
      fsextra.copySync(source,path.join(this.path,path.basename(source)));
    }
}

class TingappRootFolder extends TingappFolder {
    constructor(rootPath) {
        super(path.basename(rootPath), {path: path.dirname(rootPath)});
    }
}

export {Tingapp, TingappFile, TingappFolder}
