export interface Options {
    device?: string;
    ip?: string;
    lang?: string;
}
interface TtsOptions {
    lang?: string;
    speed?: number;
}
export default class GoogleHomeNotifier {
    deviceName: string;
    deviceAddress: string;
    language: string;
    constructor(options?: Options);
    device(name: string): void;
    lang(lang: string): void;
    ip(ip: string): void;
    create(timeout?: number): Promise<unknown>;
    say(message: string, options?: TtsOptions): Promise<unknown>;
    play(mp3Url: string | Array<string>): Promise<any>;
    getSpeechUrl(text: string, host: string, language: string, speed: number): Promise<unknown>;
    getPlayUrl(mp3Url: string, host: string): Promise<unknown>;
    onDeviceUp(host: string, url: string): Promise<unknown>;
}
export {};
