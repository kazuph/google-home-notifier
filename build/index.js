"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GoogleHomeNotifier_1 = __importDefault(require("./GoogleHomeNotifier"));
exports.GoogleHomeNotifier = GoogleHomeNotifier_1.default;
const notifier = (opts) => {
    return new GoogleHomeNotifier_1.default(opts);
};
exports.default = notifier;
module.exports = notifier;
module.exports.GoogleHomeNotifier = GoogleHomeNotifier_1.default;
