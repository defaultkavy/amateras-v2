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
exports.wordCounter = exports.checkImage = exports.validURL = exports.removeArrayItem = exports.idGenerator = exports.missionInfoEmbed = exports.cloneObj = exports.emoji = void 0;
const { XMLHttpRequest } = require('xmlhttprequest');
function emoji(name, amateras) {
    return amateras.client.emojis.cache.find(emoji => emoji.name === name);
}
exports.emoji = emoji;
function cloneObj(obj, keys) {
    let result = {};
    for (const i in obj) {
        if (keys && keys.indexOf(i) >= 0)
            continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i))
            continue;
        result[i] = obj[i];
    }
    return result;
}
exports.cloneObj = cloneObj;
function missionInfoEmbed(player, interaction, mission) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const embed = {
            title: mission.title,
            description: mission.description,
            fields: [
                {
                    name: '报酬金',
                    value: `${mission.pay}G`
                },
                {
                    name: '期限',
                    value: `${String(mission.expire.getFullYear())}年${String(mission.expire.getMonth() + 1)}月${String(mission.expire.getDate()).padStart(2, '0')}日`
                }
            ],
            author: {
                iconURL: interaction.user.displayAvatarURL({ size: 128 }),
                name: (yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(interaction.user.id))).displayName
            }
        };
        return embed;
    });
}
exports.missionInfoEmbed = missionInfoEmbed;
function idGenerator(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
exports.idGenerator = idGenerator;
function removeArrayItem(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}
exports.removeArrayItem = removeArrayItem;
function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}
exports.validURL = validURL;
function checkImage(image_url) {
    var http = new XMLHttpRequest;
    http.open('HEAD', image_url, false);
    http.send();
    console.log(http.status);
    if (http.status !== 200)
        return false;
    return true;
}
exports.checkImage = checkImage;
function wordCounter(txt, max) {
    let wordsCount = 0;
    let result = '';
    for (const char of txt) {
        if (char.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/)) {
            wordsCount += 2;
        }
        else {
            wordsCount += 1;
        }
        if (wordsCount > max) {
            return result + "...";
        }
        else {
            result += char;
        }
    }
    return result;
}
exports.wordCounter = wordCounter;
//# sourceMappingURL=terminal.js.map