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
const tmi_js_1 = require("tmi.js");
function twitch(bot) {
    const tclient = new tmi_js_1.Client({
        options: { debug: true },
        identity: {
            username: 'amateras_bot',
            password: bot.twitchToken
        },
        channels: ['venicec']
    });
    tclient.connect();
    tclient.on('message', (channel, tags, message, self) => {
        // "Alca: Hello, World!"
        console.log(`${tags['display-name']}: ${message}`);
        console.log(tags);
    });
    tclient.on('connected', (address, port) => __awaiter(this, void 0, void 0, function* () {
    }));
}
exports.default = twitch;
//# sourceMappingURL=twitch.js.map