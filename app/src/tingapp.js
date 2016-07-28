import path from 'path';
import fs from 'fs';
import fsextra from 'fs-extra';
import {remote} from 'electron';
import ace from 'brace';
import pty from 'ptyw.js';
import {python} from './utils/tbtool'

class Tingapp {
    constructor(path, options = {}) {
        this.root = new TingappRootFolder(path);

        const {isTemporary=false} = options;

        this.isTemporary = isTemporary;
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

        return new Tingapp(newDocumentPath, {isTemporary: true});
    }

    static openDocument(path) {
        return new Tingapp(path);
    }

    get files() {
        return this.root.files;
    }

    spawn_simulate() {
        return pty.spawn(python, ['python', '-m', 'tbtool', 'simulate', this.root.path], {
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

    get changed() {
        return this.root.changed;
    }

    get path() {
        return this.root.path;
    }

    save() {
        this.saveTo(this.path);
    }

    saveTo(path) {
        this.root.saveTo(path);
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
        this.changed = false;
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

    get editSession(){
      if(this.session){
        return this.session;
      }else{
        this.session = new ace.EditSession("Loading Data","ace/mode/python");
        this.session.setUndoManager(new ace.UndoManager());
        fs.readFile(this.path, (err,data) => {
            this.session.setValue(data.toString('utf8'));

            this._changeListener = (e) => { this.changed = true };
            this.session.on('change', this._changeListener);
        });
        return this.session;
      }
    }

    saveTo(path) {
        if (this.session) {
            fs.writeFileSync(path, this.session.getValue());

            if (path === this.path) {
                this.session.getUndoManager().reset();
                this.changed = false;
            }
        } else if (path !== this.path) {
            fsextra.copySync(this.path, path);
        }
    }

    wasRemoved() {
        super.wasRemoved()
        if (this.session) {
            this.session.removeListener('change', this._changeListener);
            this.session = undefined;
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

    get changed() {
        return this.files.some(file => file.changed);
    }

    _startWatching() {
        this._watcher = fs.watch(this.path, {persistent: false}, () => {
            this._reloadFiles();
        });
    }

    wasRemoved() {
        super.wasRemoved();
        this._watcher.close();
        for(let file of this.files){
            file.wasRemoved();
        }
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

    saveTo(dstPath) {
        fsextra.mkdirs(dstPath);

        for (let file of this.files) {
            const fileDstPath = path.join(dstPath, file.name);
            file.saveTo(fileDstPath);
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

    get sortedFiles() {
        // we want the main or main.py file to be at the top of the list.
        // Otherwise, alphabetical.
        let result = this.files.slice();
        return result.sort((a, b) =>  {
          if (a.name === 'main.py' || a.name === 'main') {
            return -1;
          } else if (b.name === 'main.py' || b.name === 'main') {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
    }
}

export {Tingapp, TingappFile, TingappFolder}
