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
exports.arrayHasObj = exports.objectEqual = exports.arrayEqual = exports.wordCounter = exports.checkImage = exports.validURL = exports.removeArrayItem = exports.idGenerator = exports.missionInfoEmbed = exports.cloneObj = exports.emoji = void 0;
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
function arrayEqual(arr, array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    // compare lengths - can save a lot of time 
    if (arr.length != array.length)
        return false;
    for (var i = 0, l = arr.length; i < l; i++) {
        // Check if we have nested arrays
        if (arr[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!arr[i].equals(array[i]))
                return false;
        }
        else if (arr[i] instanceof Object && array[i] instanceof Object) {
            if (!objectEqual(arr[i], array[i]))
                return false;
        }
        else if (arr[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
exports.arrayEqual = arrayEqual;
function objectEqual(obj, object2) {
    //For the first loop, we only check for types
    for (const propName in obj) {
        //Check for inherited methods and properties - like .equals itself
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
        //Return false if the return value is different
        if (obj.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        }
        //Check instance type
        else if (typeof obj[propName] != typeof object2[propName]) {
            //Different types => not equal
            return false;
        }
    }
    //Now a deeper check using other objects property names
    for (const propName in object2) {
        //We must check instances anyway, there may be a property that only exists in object2
        //I wonder, if remembering the checked values from the first loop would be faster or not 
        if (obj.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        }
        else if (typeof obj[propName] != typeof object2[propName]) {
            return false;
        }
        //If the property is inherited, do not check any more (it must be equa if both objects inherit it)
        if (!obj.hasOwnProperty(propName))
            continue;
        //Now the detail check and recursion
        //This returns the script back to the array comparing
        /**REQUIRES Array.equals**/
        if (obj[propName] instanceof Array && object2[propName] instanceof Array) {
            // recurse into the nested arrays
            if (!arrayEqual(obj[propName], (object2[propName])))
                return false;
        }
        else if (obj[propName] instanceof Object && object2[propName] instanceof Object) {
            // recurse into another objects
            //console.log("Recursing to compare ", this[propName],"with",object2[propName], " both named \""+propName+"\"");
            if (!arrayEqual(obj[propName], (object2[propName])))
                return false;
        }
        //Normal value comparison for strings and numbers
        else if (obj[propName] != object2[propName]) {
            return false;
        }
    }
    //If everything passed, let's say YES
    return true;
}
exports.objectEqual = objectEqual;
function arrayHasObj(arr, obj) {
    for (const child of arr) {
        if (child instanceof Object) {
            return objectEqual(child, obj);
        }
    }
    return false;
}
exports.arrayHasObj = arrayHasObj;
//# sourceMappingURL=terminal.js.map