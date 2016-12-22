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
            browser.discover();

            // send a discover packet every 10 seconds
            this.refreshTimer = window.setInterval(() => {
                browser.discover();
            }, 10*1000);
        });

        browser.on('update', function onUpdate(data) {
            if (!service.matches(data.type[0])) return;

            var ip = data.addresses[0];

            if (!devices.includes(ip)) {
                devices.push(ip);   
            }
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
