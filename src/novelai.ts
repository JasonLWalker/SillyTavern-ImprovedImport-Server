const NovelAiApi = require('./novelaiapi.js');

import _sodium from 'libsodium-wrappers-sumo';
import { deleteSecret, readSecret, writeSecret } from '../../../src/endpoints/secrets';
import express, { Router, response } from "express";
import { 
    jsonParser, 
    log, 
    LOG_TYPE,
    objToBase64,
    base64ToObj 
} from "./util";

const SECRET_IMPROVEDIMPORT_NOVELAI = 'plugin_improvedimport_novelai';

interface SecretTokens {
    l: string;
    k: string;
};

function getTokens(token: string) : SecretTokens {
    var data = base64ToObj(token);
    return { l: data['l'], k: data['k'] };
}

export async function initNovelAiRoutes(router: Router) {

    router.post('/novelai/login', jsonParser, async (req, res) => {
        await _sodium.ready;
        const sodium = _sodium;
        try{
            var data = getTokens(req.body['token']);
            var naiApi = new NovelAiApi(sodium);
            const keys = await naiApi.login(data['l'], data['k']);
            const token = {l:keys['accessToken'], k:btoa(String.fromCharCode.apply(null, keys['encryptionKey']))};
            writeSecret(req.user.directories, SECRET_IMPROVEDIMPORT_NOVELAI, objToBase64(token));
            return res.status(200).send({status: 'OK'});
        } catch (ex) {
            log(LOG_TYPE.DANGER, ex);
            deleteSecret(req.user.directories, SECRET_IMPROVEDIMPORT_NOVELAI);
            return res.status(400).send({ status: 'INVALID' });
        }
    });

    router.get('/novelai/stories', jsonParser, async(req, res) => {
        await _sodium.ready;
        const sodium = _sodium;
        try {
            var token = readSecret(req.user.directories, SECRET_IMPROVEDIMPORT_NOVELAI);
            if (token) {
                var data = getTokens(token);
                var naiApi = new NovelAiApi(sodium);
                await naiApi.populateKeystore(data['l'], data['k']);
                var stories = await naiApi.getUserStories();
                return res.status(200).send(stories);
            }
            return res.status(400).send({ status: 'INVALID' });
        } catch(ex) {
            log(LOG_TYPE.DANGER, ex);
            return res.status(400).send({ status: 'INVALID' });
        }
    });

    router.get('/novelai/v1card/:storyId', jsonParser, async(req, res) => {
        await _sodium.ready;
        const sodium = _sodium;
        try {
            var data = getTokens(readSecret(req.user.directories, SECRET_IMPROVEDIMPORT_NOVELAI));
            var naiApi = new NovelAiApi(sodium);
            await naiApi.populateKeystore(data['l'], data['k']);
            var storyId = req.params['storyId'];
            var card = await naiApi.getCharacterCardV1(storyId);
            res.status(200).send(card);
        } catch(ex) {
            log(LOG_TYPE.DANGER, ex);
            return res.status(400).send({ status: 'INVALID' });
        }
    });

    router.get('/novelai/logout', jsonParser, async (req, res) => {
        deleteSecret(req.user.directories, SECRET_IMPROVEDIMPORT_NOVELAI);
        return res.status(200).send({status: 'OK'});
    });

}
