'use strict';
const mdns = require('mdns-js');

export class TingFinder {
    constructor(devices) {
        var service = this.service = mdns.tcp('tingbot-ssh');
        this.devices = devices;
        var browser = mdns.createBrowser(this.service);
        this.browser = browser;
        browser.on('ready', function onReady() {
            console.log('browser is ready');
            browser.discover();
        });

        browser.on('update', function onUpdate(data) {
            console.log('data:', data);
            if (!service.matches(data.type[0])) return;
            var ip = data.addresses[0];
            var host = data.host;
            for (var i in devices) {
                if (devices[i].name === host) {
                    return;
                }
            }
            devices.push({
                name: host,
                target: ip
            });
        });

    }

    stop() {
        this.browser.stop();
    }

}
