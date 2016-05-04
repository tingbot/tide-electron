import path from 'path';

class Tingapp {
    constructor(files) {
        this.viewModel = {};
        this.files = files;
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
