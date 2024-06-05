"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNovelAiRoutes = void 0;
const fetch = require('node-fetch').default;
//const {express} = require('express');
const secrets_1 = require("../../../src/endpoints/secrets");
const { readAllChunks, extractFileFromZipBuffer, forwardFetchResponse } = require('../../../src/util.js');
const util_1 = require("./util");
const SECRET_IMPROVEDIMPORT_NOVELAI = 'plugin_improvedimport_novelai';
const API_NOVELAI = 'https://api.novelai.net';
const IMAGE_NOVELAI = 'https://image.novelai.net';
function initNovelAiRoutes(router) {
    return __awaiter(this, void 0, void 0, function* () {
        router.get('/novelai/authorize', util_1.jsonParser, (req, res) => __awaiter(this, void 0, void 0, function* () {
            //log(LOG_TYPE.INFO, req.body);
            //var naiApi = new NovelAiApi();
            //const sodium = naiApi.sodium;
            //await sodium.ready;
        }));
        router.post('/novelai/login', util_1.jsonParser, (req, res) => __awaiter(this, void 0, void 0, function* () {
            //var naiApi = new NovelAiApi();
            //const sodium = naiApi.sodium;
            //await sodium.ready;
        }));
        router.post('/novelai/logout', util_1.jsonParser, (req, res) => __awaiter(this, void 0, void 0, function* () {
            (0, secrets_1.deleteSecret)(req.user.directories, SECRET_IMPROVEDIMPORT_NOVELAI);
        }));
    });
}
exports.initNovelAiRoutes = initNovelAiRoutes;
//# sourceMappingURL=novelai.js.map