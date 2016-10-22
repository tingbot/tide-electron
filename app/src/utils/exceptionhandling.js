
module.exports.setup = function () {
    if (process.type === 'browser') {
        // main process
        const raven = require('raven');
        const client = new raven.Client('https://622ec62626b041af8d8bbfa2dab8813f:3fd2f9b05a5f4efca80386f317f4ef65@sentry.io/108096');
        client.patchGlobal();

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
        const Raven = require('raven-js');
        const RavenVue = require('raven-js/plugins/vue');
        const Vue = require('vue');

        Raven
            .config('https://622ec62626b041af8d8bbfa2dab8813f@sentry.io/108096')
            .addPlugin(RavenVue, Vue)
            .install();
    }
}
