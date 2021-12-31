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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MusicPlayerNotify_amateras, _MusicPlayerNotify_player;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicPlayerNotify = void 0;
const terminal_1 = require("./terminal");
class MusicPlayerNotify {
    constructor(musicPlayer, amateras) {
        _MusicPlayerNotify_amateras.set(this, void 0);
        _MusicPlayerNotify_player.set(this, void 0);
        __classPrivateFieldSet(this, _MusicPlayerNotify_amateras, amateras, "f");
        __classPrivateFieldSet(this, _MusicPlayerNotify_player, musicPlayer, "f");
        this.notifications = [];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _MusicPlayerNotify_player, "f").channel)
                return;
            if (this.message && !this.message.deleted) {
                if (!this.notifications[0]) {
                    try {
                        yield this.message.delete();
                        this.message = undefined;
                    }
                    catch (_a) {
                    }
                    return;
                }
                else {
                    this.message.edit({ embeds: [embed.call(this)] });
                    setTimeout(this.timeout.bind(this, this.notifications[this.notifications.length - 1]), 3000);
                }
            }
            else {
                this.message = yield __classPrivateFieldGet(this, _MusicPlayerNotify_player, "f").channel.send({ embeds: [embed.call(this)] });
                setTimeout(this.timeout.bind(this, this.notifications[this.notifications.length - 1]), 3000);
            }
            function embed() {
                let description = '';
                for (const notification of this.notifications) {
                    description += `${notification.player.mention()} - ${notification.content}\n`;
                }
                const embed = {
                    description: description,
                    footer: {
                        text: `Notification`
                    }
                };
                return embed;
            }
        });
    }
    add(player, content) {
        return __awaiter(this, void 0, void 0, function* () {
            this.notifications.push({
                player: player,
                content: content
            });
            yield this.init();
        });
    }
    timeout(notification) {
        this.notifications = (0, terminal_1.removeArrayItem)(this.notifications, notification);
        console.debug(this.notifications);
        this.init();
    }
}
exports.MusicPlayerNotify = MusicPlayerNotify;
_MusicPlayerNotify_amateras = new WeakMap(), _MusicPlayerNotify_player = new WeakMap();
//# sourceMappingURL=MusicPlayerNotify.js.map