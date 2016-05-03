import path from 'path';

class Tingapp {
    constructor(files) {
        this.viewModel = {};
        this.files = files;
    }

    get files() {
        return this._files;
    }

    set files(newFiles) {
        this._files = newFiles;
        this.viewModel['files'] = newFiles;
    }
}

class TingappFile {
    constructor(path) {
        this.path = path;
    }

    get name() {
        return path.basename(this.path);
    }

    get contents() {

    }
}

export {Tingapp, TingappFile}
