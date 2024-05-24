import bodyParser from 'body-parser';
import express, { Router } from 'express';
import { Chalk } from 'chalk';
const fetch = require('node-fetch').default;

interface PluginInfo {
    id: string;
    name: string;
    description: string;
}

interface Plugin {
    init: (router: Router) => Promise<void>;
    exit: () => Promise<void>;
    info: PluginInfo;
}

const jsonParser =  express.json({ limit: '20mb' });
const textParser =  express.text({ limit: '2mb' });

const API_NOVELAI = 'https://api.novelai.net';
const IMAGE_NOVELAI = 'https://image.novelai.net';


const chalk = new Chalk();
const MODULE_NAME = '[improvedimport]';

/**
 * Initialize the plugin.
 * @param router Express Router
 */
export async function init(router: Router): Promise<void> {
    const jsonParser = bodyParser.json();

    router.get('/novelai/*', jsonParser, async (req, res) => {
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

    router.get('/chub/*', jsonParser, async (req, res) => {

    });

    router.get('/aids/*', jsonParser, async (req, res) => {

    });

    router.get('/janitorai/*', jsonParser, async (req, res) => {

    });

    router.get('/pygmalion/*', jsonParser, async (req, res) => {

    });

    router.get('/aicc/*', jsonParser, async (req, res) => {

    });



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
    console.log(chalk.green(MODULE_NAME), 'Plugin loaded!');
}

export async function exit(): Promise<void> {
    console.log(chalk.yellow(MODULE_NAME), 'Plugin exited');
}

export const info: PluginInfo = {
    id: 'improvedimport',
    name: 'Improved Import Plugin',
    description: 'A  plugin for SillyTavern servers that allows for retrieval and import of scenarios, stories and character cards from sources not yet supported out-of-box by the main SillyTavern server.',
};

const plugin: Plugin = {
    init,
    exit,
    info,
};

export default plugin;
