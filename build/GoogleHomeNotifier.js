"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const castv2_client_1 = require("castv2-client");
const google_tts_api_1 = __importDefault(require("google-tts-api"));
const mdns_1 = __importDefault(require("mdns"));
class GoogleHomeNotifier {
    constructor(options) {
        const assignOps = Object.assign({
            device: '',
            ip: '',
            lang: 'en',
        }, options);
        this.deviceName = assignOps.device;
        this.deviceAddress = assignOps.ip;
        this.language = assignOps.lang;
    }
    device(name) {
        this.deviceName = name;
    }
    lang(lang) {
        this.language = lang;
    }
    ip(ip) {
        this.deviceAddress = ip;
    }
    create(timeout = 5000) {
        const browser = mdns_1.default.createBrowser(mdns_1.default.tcp('googlecast'));
        const timeoutProm = new Promise((_, reject) => {
            setTimeout(() => {
                return reject(new Error('timeout create browser'));
            }, timeout);
        });
        const browserProm = new Promise(resolve => {
            browser.start();
            browser.on('serviceUp', service => {
                if (service.fullname != undefined &&
                    service.fullname.indexOf(this.deviceName.replace(' ', '-')) !== -1) {
                    this.ip(service.addresses[0]);
                    browser.stop();
                    return resolve(`'Device "${service.fullname}" at ${service.addresses[0]}:${service.port}`);
                }
            });
        });
        return Promise.race([timeoutProm, browserProm]);
    }
    say(message, options) {
        if (!this.deviceAddress) {
            return Promise.reject(new Error('no deviceAddress'));
        }
        if (!message) {
            return Promise.reject(new Error('no message'));
        }
        const { lang, speed } = Object.assign({
            lang: this.language,
            speed: 1,
        }, options);
        return this.getSpeechUrl(message, this.deviceAddress, lang, speed);
    }
    play(mp3Url) {
        if (!this.deviceAddress) {
            return Promise.reject(new Error('no deviceAddress'));
        }
        if (!mp3Url) {
            return Promise.reject(new Error('no mp3 url'));
        }
        if (typeof mp3Url === 'string') {
            return this.getPlayUrl(mp3Url, this.deviceAddress);
        }
        if (Array.isArray(mp3Url)) {
            const proms = mp3Url.map(url => {
                return () => this.getPlayUrl(url, this.deviceAddress);
            });
            return proms.reduce((pre, cur) => {
                return pre.then(cur);
            }, Promise.resolve());
        }
        return Promise.reject(new Error('play() arg is string or string[]'));
    }
    getSpeechUrl(text, host, language, speed) {
        return google_tts_api_1.default(text, language, speed, 1000).then(url => {
            return this.onDeviceUp(host, url).catch(error => {
                throw error;
            });
        });
    }
    getPlayUrl(mp3Url, host) {
        return this.onDeviceUp(host, mp3Url);
    }
    onDeviceUp(host, url) {
        return new Promise((resolve, reject) => {
            const client = new castv2_client_1.Client();
            client.connect(host, () => {
                client.launch(castv2_client_1.DefaultMediaReceiver, (error, player) => {
                    if (error) {
                        client.close();
                        return reject(error);
                    }
                    const media = {
                        contentId: url,
                        contentType: 'audio/mp3',
                        streamType: 'BUFFERED',
                    };
                    player.load(media, { autoplay: true }, (error) => {
                        if (error) {
                            client.close();
                            return reject(error);
                        }
                    });
                    player.on('status', (status) => {
                        if (status &&
                            status.idleReason &&
                            status.idleReason === 'FINISHED') {
                            client.close();
                            return resolve('Device notified');
                        }
                    });
                });
            });
            client.on('error', (error) => {
                client.close();
                reject(error);
            });
        });
    }
}
exports.default = GoogleHomeNotifier;
module.exports = GoogleHomeNotifier;
