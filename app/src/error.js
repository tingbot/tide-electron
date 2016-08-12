function FileExistsError(path) {
    this.name = 'FileExistsError';
    this.message = `A file already exists at '${path}'`;
    this.stack = (new Error()).stack;
}

FileExistsError.prototype = new Error;

export {FileExistsError}
