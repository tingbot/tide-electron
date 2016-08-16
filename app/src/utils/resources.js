import path from 'path';

module.exports.getPath = function( /* arguments... */ ) {
    /**
     * Returns the path for the named resource.
     * If running in development mode, the resource is at '<project_root>/<arg1>/arg2'.
     * If running in a build, the resource is in 'Contents/Resources', 'resources' or
     * or similar.
     *
     * Always returns an absolute path.
     *
     * Resources folders should also be listed in build.extraResources in package.json.
     */

    var path_components = Array.from(arguments);

    if (!/[\\/]electron-prebuilt[\\/]/.test(process.execPath)) {
        // development mode
        path_components.unshift(process.resourcesPath); // 'unshift' adds to the front of the list
    } else {
        path_components.unshift(process.cwd());
    }

    return path.join.apply(null, path_components);
};
