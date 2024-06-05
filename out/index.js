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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exit = exports.init = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const novelai_1 = require("./novelai");
const util_1 = require("./util");
const NovelAiApi = require('./novelaiapi.js');
const fetch = require('node-fetch').default;
/**
 * Initialize the plugin.
 * @param router Express Router
 */
function init(router) {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonParser = body_parser_1.default.json();
        (0, novelai_1.initNovelAiRoutes)(router);
        /*
        router.post('/novelai/authenticate', jsonParser, async(req, res) => {
            var token = req.body['token'];
            var data = decodeFromB64(token);
            //var l = 'jason@draxjinn.com';
            //var k = '3b&r77h*$ettT&*';
            var l = data['l'];
            var k = data['k'];
    
            var naiApi = new NovelAiApi();
            const sodium = naiApi.sodium;
            await sodium.ready;
            try{
                const keys = await naiApi.login(l, k);
                return res.status(200).send(
                    {token: encodeToB64({ accessToken: keys['accessToken'], encryptionKey: btoa(String.fromCharCode.apply(null, keys['encryptionKey'])) }) }
                );
            } catch (ex) {
                console.log(chalk.red(MODULE_NAME), ex);
                return res.sendStatus(500);
            }
        });
        */
        /*
        router.get('/novelai/*', jsonParser, async (req, res) => {
            if (req.url.toLowerCase() == '/novelai/authenticate') {
                var token = req.body['token'];
                var data = decodeFromB64(token);
                //var l = 'jason@draxjinn.com';
                //var k = '3b&r77h*$ettT&*';
                var l = data['l'];
                var k = data['k'];
    
                var naiApi = new NovelAiApi();
                const sodium = naiApi.sodium;
                await sodium.ready;
                try{
                    const keys = await naiApi.login(l, k);
                    return res.status(200).send(
                        {token: encodeToB64({ accessToken: keys['accessToken'], encryptionKey: btoa(String.fromCharCode.apply(null, keys['encryptionKey'])) }) }
                    );
                } catch (ex) {
                    console.log(chalk.red(MODULE_NAME), ex);
                    return res.sendStatus(500);
                }
            }
    
    
            try {
                var body;
                var headers;
    
                if (req.headers['_Authorization'] || req.headers['_authorization'])
                    headers = {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': req.headers['_Authorization'] || req.headers['_authorization']
                    };
                else
                    headers = {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    };
    
                var s = JSON.stringify(req.body);
                if (s !== '{}')
                    body = s;
    
                const response = await fetch(API_NOVELAI + req.url, {
                    method: 'GET',
                    body: body,
                    headers: headers,
                });
        
                var data;
                if (response.headers.get('content-type') == 'application/json')
                    data = await response.json();
                else
                    data = await response.text();
    
                return res.status(response.status).setHeader('content-type', response.headers.get('content-type')).send(data);
            } catch (error) {
                console.log(error);
                return res.send({ error: true });
            }
        });
    
        router.post('/novelai/*', jsonParser, async (req, res) => {
            console.log(chalk.green(MODULE_NAME), req.url);
            
            if (req.url.toLowerCase() == '/novelai/authenticate') {
                var token = req.body['token'];
                var data = decodeFromB64(token);
                var l = data['l'];
                var k = data['k'];
    
    
                return;
            }
    
            try {
                var headers;
                var body = JSON.stringify(req.body);
    
                if (req.headers['_Authorization'] || req.headers['_authorization'])
                    headers = {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': req.headers['_Authorization'] || req.headers['_authorization']
                    };
                else
                    headers = {
                        'accept': 'application/json',
                        'Content-Type': 'application/json',
                    };
    
                if (body === '{}')
                    body = '';
    
                const response = await fetch(API_NOVELAI + req.url, {
                    method: 'POST',
                    body: body,
                    headers: headers,
                });
    
                var data;
                if (response.headers.get('content-type') == 'application/json')
                    data = await response.json();
                else
                    data = await response.text();
    
                return res.status(response.status).setHeader('content-type', response.headers.get('content-type')).send(data);
            } catch (error) {
                console.log(error);
                return res.send({ error: true });
            }
        });
        */
        router.get('/chub/*', jsonParser, (req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        router.get('/aids/*', jsonParser, (req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        router.get('/janitorai/*', jsonParser, (req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        router.get('/pygmalion/*', jsonParser, (req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        router.get('/aicc/*', jsonParser, (req, res) => __awaiter(this, void 0, void 0, function* () {
        }));
        /*
        // Used to check if the server plugin is running
        router.post('/probe', (_req, res) => {
            return res.sendStatus(204);
        });
        // Use body-parser to parse the request body
        router.post('/ping', jsonParser, async (req, res) => {
            try {
                const { message } = req.body;
                return res.json({ message: `Pong! ${message}` });
            } catch (error) {
                console.error(chalk.red(MODULE_NAME), 'Request failed', error);
                return res.status(500).send('Internal Server Error');
            }
        });
        */
        //console.log(chalk.green(MODULE_NAME), 'Plugin loaded!');
    });
}
exports.init = init;
function exit() {
    return __awaiter(this, void 0, void 0, function* () {
        //    console.log(chalk.yellow(MODULE_NAME), 'Plugin exited');
    });
}
exports.exit = exit;
const plugin = {
    init,
    exit,
    info: util_1.pluginInfo,
};
exports.default = plugin;
//# sourceMappingURL=index.js.map