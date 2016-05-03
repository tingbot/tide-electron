import Watch from 'watch'
import FS from 'fs'

    var fileWatcher = {};
    let folder = '';
    let callback = function() {};
    let files = [];

    fileWatcher.setup = function(f, cb) {
        folder = f;
        callback = cb;
        Watch.createMonitor(folder, function(monitor) {
            monitor.on("created", function(f, stat) {
                console.log("Create:" + f);
                fileWatcher.refresh();
            })
            monitor.on("changed", function(f, curr, prev) {
                console.log("Changed:" + f);
                fileWatcher.refresh();
            })
            monitor.on("removed", function(f, stat) {
                console.log("Removed:" + f);
                fileWatcher.refresh();
            })
        });
        fileWatcher.refresh();
    }

    fileWatcher.refresh = function() {
        files = [];
        FS.readdir(folder, function(err, array) {
            if (err) return err;
            for (var i in array) {
                console.log(array[i]);
                files.push({
                    name: array[i]
                });
            }
            callback(files);
        });
    }

export default fileWatcher;
