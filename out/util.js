"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeFromB64 = exports.encodeToB64 = exports.log = exports.LOG_TYPE = exports.MODULE_NAME = exports.pluginInfo = exports.chalk = exports.textParser = exports.jsonParser = void 0;
const chalk_1 = require("chalk");
const express_1 = __importDefault(require("express"));
exports.jsonParser = express_1.default.json({ limit: '20mb' });
exports.textParser = express_1.default.text({ limit: '2mb' });
exports.chalk = new chalk_1.Chalk();
exports.pluginInfo = {
    id: 'improvedimport',
    name: 'Improved Import Plugin',
    description: 'A  plugin for SillyTavern servers that allows for retrieval and import of scenarios, stories and character cards from sources not yet supported out-of-box by the main SillyTavern server.',
};
exports.MODULE_NAME = `[${exports.pluginInfo.id}]`;
var LOG_TYPE;
(function (LOG_TYPE) {
    LOG_TYPE[LOG_TYPE["INFO"] = 256] = "INFO";
    LOG_TYPE[LOG_TYPE["SUCCESS"] = 16] = "SUCCESS";
    LOG_TYPE[LOG_TYPE["WARNING"] = 8] = "WARNING";
    LOG_TYPE[LOG_TYPE["DANGER"] = 1] = "DANGER";
})(LOG_TYPE = exports.LOG_TYPE || (exports.LOG_TYPE = {}));
;
const _VERBOSE = true;
function log(type, ...msg) {
    if (!_VERBOSE)
        return null;
    switch (type) {
        case LOG_TYPE.INFO:
            console.log(exports.chalk.cyan(exports.MODULE_NAME), ...msg);
            break;
        case LOG_TYPE.WARNING:
            console.log(exports.chalk.yellowBright(exports.MODULE_NAME), ...msg);
            break;
        case LOG_TYPE.DANGER:
            console.log(exports.chalk.red(exports.MODULE_NAME), ...msg);
    }
}
exports.log = log;
function encodeToB64(obj) {
    return btoa(new Uint8Array(JSON
        .stringify(obj)
        .split('')
        .map(function (c) { return c.charCodeAt(0); }))
        .toString());
}
exports.encodeToB64 = encodeToB64;
function decodeFromB64(s) {
    return JSON.parse(String.fromCharCode.apply(null, atob(s).split(',').map(function (n) { return Number(n); })));
}
exports.decodeFromB64 = decodeFromB64;
//# sourceMappingURL=util.js.map