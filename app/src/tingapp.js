import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';
import fsextra from 'fs-extra';
import {remote, shell} from 'electron';
import ace from 'brace';
import pty from 'ptyw.js';
import uuid from 'node-uuid';
import {python} from './utils/tbtool';
import * as error from './error';
import minimatch from 'minimatch'
import resources from './utils/resources';

class Tingapp {
    constructor(path, options = {}) {
        this.root = new TingappRootFolder(path);

        const {isTemporary=false} = options;

        this.isTemporary = isTemporary;
    }

    static newDocument({template=resources.getPath('default.tingapp')}) {
        const tempDir = remote.app.getPath('temp');

        const newDocumentPath = path.join(tempDir, uuid.v1() + '.tingapp');
        fsextra.copySync(template, newDocumentPath);

        return new Tingapp(newDocumentPath, {isTemporary: true});
    }

    static openDocument(path) {
        return new Tingapp(path);
    }

    get files() {
        return this.root.files;
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

    saveInProgressVersion() {
        /**
         * Saves a copy of the app, including unsaved changes, to a temporary location.
         *
         * This is to support the 'simulate' and 'run' functionality - to allow users to test
         * code changes without saving first. It also keeps any temporary files (virtualenvs,
         * settings) out of the source tree when simulating.
         *
         * The code will be saved to the same location on the disk every time. This means
         * virtualenvs are cached.
         *
         * Returns the path to the temporary tingapp.
         */
        const path = this.inProgressVersionPath;
        this.saveTo(path);
        return path;
    }

    get inProgressVersionPath() {
        const pathHash = crypto.createHash('md5').update(this.root.path).digest('hex');
        return path.join(os.tmpdir(), 'tide', pathHash, this.root.name);
    }
}

class TingappFile {
    constructor(name, parent) {
        this._name = name;
        this.parent = parent;
    }

    get name() {
        return this._name;
    }

    set name(name) {
        const oldPath = this.path;
        const newPath = path.join(this.parent.path, name);

        fs.renameSync(oldPath, newPath);

        this._name = name;
    }

    get path() {
        return path.join(this.parent.path, this.name);
    }

    get type() {
        return 'file';
    }

    moveToTrash() {
        const success = shell.moveItemToTrash(this.path);

        if (!success) {
            throw Error(`Failed to delete file ${this.path}`);
        }

        this.parent._reloadFiles();
    }

    revealInExplorer() {
        shell.showItemInFolder(this.path);
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
        };
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

            this._changeListener = (e) => { this.changed = true; };
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
            fsextra.copySync(this.path, path, {clobber: true});
        }
    }

    moveToTrash() {
        // save any unsaved changes to file before moving to trash, so they're not lost
        this.saveTo(this.path);
        super.moveToTrash();
    }

    wasRemoved() {
        super.wasRemoved();
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
            const ignore = ['venv', '.git', '*.pyc']
            if (ignore.some(pattern => minimatch(file.name, pattern))) {
                continue;
            }

            const fileDstPath = path.join(dstPath, file.name);
            file.saveTo(fileDstPath);
        }
    }

    _createFile(name, type) {
        const filePath = path.join(this.path, name);

        if (fs.existsSync(filePath)) {
            throw new error.FileExistsError(filePath);
        }

        if (type === 'regularFile') {
            // make empty file at the location
            fs.writeFileSync(filePath, '');
        } else if (type === 'folder') {
            fs.mkdirSync(filePath);
        } else {
            throw Error("unknown 'type' parameter");
        }

        // reload from disk so the new file is in this.files
        this._reloadFiles();

        // return the file
        return this.files.find((file) => file.name === name);
    }

    createRegularFile(name) {
        return this._createFile(name, 'regularFile');
    }

    createFolder(name) {
        return this._createFile(name, 'folder');
    }

    addFile (source) {
      const name = path.basename(source);
      fsextra.copySync(source, path.join(this.path, name));

      // reload from disk so the new file[s] are in this.files
      this._reloadFiles();

      // return the file that was added
      return this.files.find((file) => file.name === name);
    }

    containsFile (searchFile) {
        /**
         * Returns true if `file' is anywhere in the subtree of this folder
         */
        for (let file of this.files) {
            if (file === searchFile) {
                return true;
            }

            if (file.containsFile && file.containsFile(file)) {
                return true;
            }
        }

        return false;
    }

    get sortedFiles() {
        // folders at the top of the list, otherwise, alphabetical.
        let result = this.files.slice();

        return result.sort((a, b) =>  {
          if (a.type === 'folder' && b.type === 'folder') {
            return a.name.localeCompare(b.name);
          } else if (a.type === 'folder') {
            return -1;
          } else if (b.type === 'folder') {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
    }
}

class TingappRootFolder extends TingappFolder {
    constructor(rootPath) {
        super(path.basename(rootPath), {path: path.dirname(rootPath)});
    }

    get isRootFolder() {
        return true;
    }

    get sortedFiles() {
        // we want the main or main.py file to be at the top of the list.
        // Otherwise, same as the default.
        const result = super.sortedFiles;

        const mainFileIndex = result.findIndex((a) => (a.name === 'main' || a.name === 'main.py'))

        if (mainFileIndex !== -1) {
            // move that file to the start of the list
            result.splice(0, 0, result.splice(mainFileIndex, 1)[0]);
        }

        return result;
    }
}

export {Tingapp, TingappFile, TingappFolder};
