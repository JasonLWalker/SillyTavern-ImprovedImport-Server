'use strict';
const fetch = require('node-fetch').default;
const pako = require('pako');
const {Unpackr, addExtension} = require('msgpackr');

module.exports = NovelAiApi;
const API_NOVELAI = 'https://api.novelai.net';

// libsodium wrapper initialization is weird, so initialize sodium and pass in as first argument.
function NovelAiApi(_libsodium) {
    const compressionHeader = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1].toString();
    const sodium = _libsodium;

    var keys = {
        accessToken: null,
        encryptionKey: null,
        keystore: []
    };

    var lib = {
        keys: keys,
        login: login,
        populateKeystore: populateKeystore,
        encodeBase64: encodeBase64,
        decodeBase64: decodeBase64,
        decodeData: decodeData,
        getUserStories: getUserStories,
        getUserStory: getUserStory,
        getUserStoryContent: getUserStoryContent,
        getCharacterCardV1: getCharacterCardV1,
        getCharacterCardV2: getCharacterCardV2,
        sodium: sodium,
        buildEncryptionKeys: buildEncryptionKeys
    };
    
    // Custom MsgPackr extensions with read passthrough for handling Document decoding
    function extReadPassthrough(data) {
        return data;
    };
    addExtension({ type: 20, read: extReadPassthrough });
    addExtension({ type: 30, read: extReadPassthrough });
    addExtension({ type: 31, read: extReadPassthrough });
    addExtension({ type: 40, read: extReadPassthrough });
    addExtension({ type: 41, read: extReadPassthrough });

    function hashArgon(email, password, size, domain) {
        var preSalt = (password || '').substr(0, 6) + email + domain;
        var salt = sodium.crypto_generichash(16, preSalt)
        return sodium.crypto_pwhash(size, password, salt, 2, 2000000, 2);
    }

    function getEncryptionKey(secret, user) {
        if (secret instanceof Uint8Array) {
            return secret;
        }
        var encryption_key = hashArgon(user, secret, 128, 'novelai_data_encryption_key');
        //var encryption_string = sodium.toBase64(encryption_key, sodium.base64_variants.URLSAFE_NO_PADDING);//btoa(String.fromCharCode.apply(null, encryption_key));
        var encryption_string = btoa(String.fromCharCode.apply(null, encryption_key));
        encryption_string = encryption_string.replaceAll("/", "_").replaceAll("+", "-").replaceAll("=", "");
        return sodium.crypto_generichash(32, encryption_string)
    }

    function getAccessKey(secret, user) {
        var access_key = [];
        if (secret instanceof Uint8Array) {
            return user;
        } else if (typeof (user) === 'string' && typeof (secret) === 'string') {
            access_key = hashArgon(user, secret, 64, 'novelai_data_access_key');
        }
        var access_string = btoa(String.fromCharCode.apply(null, access_key)).substr(0, 64)
        return access_string.replaceAll("/", "_").replaceAll("+", "-");
    }

    async function buildEncryptionKeys(secret, user) {
        return {
            encryptionKey: getEncryptionKey(secret, user),
            accessKey: getAccessKey(secret, user),
            accessToken: null,
            keystore: []
        }
    }

    async function getAccessToken(accessKey) {
        const response = await fetch(
            API_NOVELAI + '/user/login',
            {
                method: 'post',
                body: JSON.stringify({
                    key: accessKey
                }),
                headers: {'Content-Type': 'application/json'}
            }
        );
        const data = await response.json();
        return data['accessToken'];
    }

    async function populateKeystore(accessToken, encryptionKey) {
        if (typeof (encryptionKey) == 'string') {
            encryptionKey = new Uint8Array(decodeBase64(encryptionKey));
        }


        const response = await fetch(
            API_NOVELAI + '/user/keystore',
            {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                }
            }
        );
        var resData = await response.json();
        //resData['accessToken'] = accessToken;
        try {
            if (!resData['keystore'])
                throw ("keystore does not exist");

            var data = JSON.parse(atob(resData['keystore']));
            if (!data['nonce'] || !data['sdata'])
                throw ("Unable to retrieve nonce and sdata");

            var bytes = sodium.crypto_secretbox_open_easy(new Uint8Array(data['sdata']), new Uint8Array(data['nonce']), encryptionKey);
            var str = new TextDecoder().decode(bytes);
            lib.keys.keystore = JSON.parse(str)['keys'];
            lib.keys.encryptionKey = encryptionKey;
            lib.keys.accessToken = accessToken;
        } catch {
            throw ("Unable to decode keystore");
        }
        return lib.keys;
    }


    // Login to NovelAi API with either an email/password, or AccessKey/EncryptionKey
    // Pass in email address for the user and password for the secret to generate and access and encryption key and login,
    // or
    // Pass in the access key string for the user and a Uint8Array encryption key for the secret to log in directly
    async function login(user, secret) {
        var keys = await buildEncryptionKeys(secret, user);
        this.keys.accessKey = keys.accessKey;
        this.keys.encryptionKey = keys.encryptionKey;
        this.keys.accessToken = await getAccessToken(this.keys.accessKey);
        return await populateKeystore(this.keys.accessToken, this.keys.encryptionKey);
    }

    function encodeBase64(dataIn) {
        return btoa(String.fromCharCode.apply(null, dataIn))
    }

    function decodeBase64(dataIn) {
        return atob(dataIn).split('').map(function (c) { return c.charCodeAt(0); });
    }

    function decodeData(dataIn, meta) {
        var bytes;
        var str = atob(dataIn);
        var data = Uint8Array.from(str, (m) => m.codePointAt(0));
        var sk = meta ? lib.keys.keystore[meta] : null;
        // Is data compressed?
        if (data.length > 16) {
            if (compressionHeader == data.slice(0, 16).toString()) {
                // Data is compressed, use deflate to decompress
                bytes = data.slice(16);
                if (sk) {
                    var nonce = bytes.slice(0, 24);
                    bytes = bytes.slice(24);
                    bytes = sodium.crypto_secretbox_open_easy(bytes, nonce, new Uint8Array(sk));
                    //return new TextDecoder().decode(bytes);

                }
                return pako.inflateRaw(bytes, { to: 'string', raw: true });
            }
        }

        if (sk) {
            bytes = data.slice(24);
            var nonce = data.slice(0, 24);
            var bytes = sodium.crypto_secretbox_open_easy(bytes, nonce, new Uint8Array(sk));
            return new TextDecoder().decode(bytes);
        }

        return decodeBase64(dataIn);
    }

    function decodeDocument(dataIn) {
        var str = atob(dataIn);
        var data = Uint8Array.from(str, (m) => m.codePointAt(0));
        var unpacker = new Unpackr();
        return unpacker.unpack(data, { bundleStrings: true, moreTypes: true });
    }

    async function getUserStories() {
        var resData = {};
        const response = await fetch(
            API_NOVELAI + '/user/objects/stories',
            {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + lib.keys.accessToken
                }
            }
        );
        const data = await response.json();
        const objects = data['objects'];
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj['data'] && obj['meta']) {
                obj['data'] = JSON.parse(decodeData(obj['data'], obj['meta']));
            }
            resData[obj['id']] = obj
        }

        return resData;
    }

    async function getUserStory(storyId) {
        const response = await fetch(
            API_NOVELAI + '/user/objects/stories/' + storyId,
            {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + lib.keys.accessToken
                }
            }
        );
        var obj = await response.json();
        if (obj['data'] && obj['meta']) {
            var decodedData = decodeData(obj['data'], obj['meta']);
            obj['data'] = JSON.parse(decodedData);
        }
        return obj;
    }

    async function getUserStoryContent(storyContentId) {
        var respData = {};
        const response = await fetch(
            API_NOVELAI + '/user/objects/storycontent/' + storyContentId,
            {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + lib.keys.accessToken
                }
            }
        );
        var obj = await response.json();
        var objData = JSON.parse(decodeData(obj['data'], obj['meta']));
        obj['data'] = objData;
        objData['document'] = decodeDocument(objData['document']);
        return obj;
    }

    async function getCharacterCardV1(storyId) {
        var story = await getUserStory(storyId);
        var storyData = await getUserStoryContent(story['data']['remoteStoryId']);
        var document = storyData['data']['document'];
        var context = storyData['data']['context'];
        var order = document['order'];
        var sections = document['sections'];
        var memory = (context || [{}])[0]['text'];
        var authorsNote = (context || [{}, {}])[1]['text'];
        var s = '';
        if (document && order && order.length > 0 && sections) {
            for (var i = 0; i < order.length; i++) {
                var node = document.sections.get(order[i]);
                if (node && node['text']) {
                    s += node.text += '\n';
                }
            }
        }
        return {
            name: story['data']['title'],
            description: memory,
            personality: '',
            scenario: authorsNote,
            first_mes: s,
            mes_example: ''
        }
    }

    async function getCharacterCardV2(storyId) {

    }

    return lib;
}

