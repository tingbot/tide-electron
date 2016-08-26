'use strict';
const mdns = require('mdns-js');

export class TingFinder {
    constructor(devices) {
        var service = this.service = mdns.tcp('tingbot-ssh');
        this.devices = devices;
        var browser = mdns.createBrowser(this.service);
        this.browser = browser;
        this.refreshTimer = null;

        browser.on('ready', function onReady() {
            console.log('browser is ready');
            browser.discover();

            // send a discover packet every 10 seconds
            this.refreshTimer = window.setInterval(() => {
                browser.discover();
            }, 10*1000);
        });

        browser.on('update', function onUpdate(data) {
            console.log('data:', data);
            if (!service.matches(data.type[0])) return;
            var ip = data.addresses[0];
            var host = data.host;
            for (var i in devices) {
                if (devices[i].target === ip) {
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

        if (this.refreshTimer) {
            window.clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

}
