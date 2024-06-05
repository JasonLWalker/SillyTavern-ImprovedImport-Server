import { Chalk } from 'chalk';
import express, { Router } from "express";
import characterCardParser from "../../../src/character-card-parser"
import jimp from 'jimp';

export const jsonParser =  express.json({ limit: '20mb' });
export const textParser =  express.text({ limit: '2mb' });

export interface PluginInfo {
    id: string;
    name: string;
    description: string;
}

export const chalk = new Chalk();

export const pluginInfo: PluginInfo = {
    id: 'improvedimport',
    name: 'Improved Import Plugin',
    description: 'A  plugin for SillyTavern servers that allows for retrieval and import of scenarios, stories and character cards from sources not yet supported out-of-box by the main SillyTavern server.',
};

export const MODULE_NAME = `[${pluginInfo.id}]`;

export enum LOG_TYPE {
    INFO = 256,
    SUCCESS = 16,
    WARNING = 8,
    DANGER = 1,
};

const _VERBOSE = true;

export function log(type:LOG_TYPE, ...msg:any) {
    if (!_VERBOSE) return null;

    switch(type) {
        case LOG_TYPE.INFO:
            console.log(chalk.cyan(MODULE_NAME), ...msg);
            break;
        case LOG_TYPE.WARNING:
            console.log(chalk.yellowBright(MODULE_NAME), ...msg);
            break;
        case LOG_TYPE.DANGER:
            console.log(chalk.red(MODULE_NAME), ...msg)
    }
}

export function objToBase64(obj: object) {
    return btoa(
        new Uint8Array(
            JSON
            .stringify(obj)
            .split('')
            .map(function (c) { return c.charCodeAt(0); })
        )
        .toString()
    );
}

export function base64ToObj(s: string) {
    return JSON.parse(String.fromCharCode.apply(null, atob(s).split(',').map(function(n){ return Number(n);})));
}

export function encodeBase64(dataIn) {
    return btoa(String.fromCharCode.apply(null, dataIn))
}

export function decodeBase64(dataIn) {
    return atob(dataIn).split('').map(function (c) { return c.charCodeAt(0); });
}

export async function getImageBufferFromDataUrl(data) {
    try {
        let rawImg = await jimp.read(Buffer.from(data.replace(/^data:image\/png;base64,/, ""), 'base64'));
        let finalWidth = rawImg.bitmap.width, finalHeight = rawImg.bitmap.height;
        return await rawImg.cover(finalWidth, finalHeight).getBufferAsync(jimp.MIME_PNG);
    } catch {
        throw 'Unable to open image data';
    }
}

export async function initUtilityRoutes(router: Router) {
    router.post('/mergecardavatar', jsonParser, async (req, res) => {
        try{
            let avatarData = await getImageBufferFromDataUrl(req.body['avatar']);
            let cardData = req.body['card'];

            var outputImage;
            if (typeof(cardData) == 'string')
                outputImage = characterCardParser.write(avatarData, cardData);
            else
                outputImage = characterCardParser.write(avatarData, JSON.stringify(cardData));
            
            return res.status(200).appendHeader('content-type', 'text/plain').send(outputImage.toString('base64'));
        } catch (ex) {
            return res.status(400).send({ status: 'INVALID' });
        }
    });
}