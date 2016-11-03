const resources = require('./resources.js');

const postToSentry = !resources.inDevelopmentMode();

function shouldAlertUserOfError(err) {
    if (err.message && (err.message.startsWith('trailing tokens')
                        || err.message.endsWith('has more than 20 characters')
                        || err.message.startsWith('protocol must be either "_tcp" or "_udp"'))) {
        // this message is from mdns-js and is benign 
        return false;
    }

    // TODO
    //   this should be 'return true' but errors raised by mdns-js are causing
    //   dialogs to be thrown apparently at random, and out of control of the user.
    //   Once errors are under control, we can reenable this.
    return false;
}

module.exports.setup = function () {
    if (process.type === 'browser') {
        // main process
        if (postToSentry) {
            const raven = require('raven');
            const client = new raven.Client('https://622ec62626b041af8d8bbfa2dab8813f:3fd2f9b05a5f4efca80386f317f4ef65@sentry.io/108096');
            client.patchGlobal();
        }

        process.on('uncaughtException', (err) => {
            const dialog = require('electron').dialog;

            dialog.showMessageBox({
                type: 'error',
                message: 'A JavaScript error occurred in the main process',
                detail: err.stack,
                buttons: ['OK'],
            })
        });
    } else if (process.type === 'renderer') {
        // renderer process
        if (postToSentry) {
            const Raven = require('raven-js');
            const RavenVue = require('raven-js/plugins/vue');
            const Vue = require('vue');

            Raven
                .config('https://622ec62626b041af8d8bbfa2dab8813f@sentry.io/108096')
                .addPlugin(RavenVue, Vue)
                .install();
        }

        const previousOnError = window.onerror;
        window.onerror = function(message, url, lineNo, colNo, err) {
            const remote = require('electron').remote;
            const dialog = remote.dialog;

            if (shouldAlertUserOfError(err)) {
                dialog.showMessageBox(remote.getCurrentWindow(), {
                    type: 'error',
                    message: 'A JavaScript error occurred in the renderer process',
                    detail: err.stack,
                    buttons: ['OK'],
                })
            }

            if (previousOnError) {
                return previousOnError.apply(this, arguments);
            } else {
                return false;
            }
        }
    }
}
