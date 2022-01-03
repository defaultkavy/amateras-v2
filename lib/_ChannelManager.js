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
var __ChannelManager_amateras, __ChannelManager__guild, __ChannelManager_data;
Object.defineProperty(exports, "__esModule", { value: true });
exports._ChannelManager = void 0;
const discord_js_1 = require("discord.js");
const Err_1 = require("./Err");
const terminal_1 = require("./terminal");
const _Channel_1 = require("./_Channel");
const _TextChannel_1 = require("./_TextChannel");
class _ChannelManager {
    constructor(data, _guild, amateras) {
        __ChannelManager_amateras.set(this, void 0);
        __ChannelManager__guild.set(this, void 0);
        __ChannelManager_data.set(this, void 0);
        __classPrivateFieldSet(this, __ChannelManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, __ChannelManager__guild, _guild, "f");
        __classPrivateFieldSet(this, __ChannelManager_data, data, "f");
        this.cache = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const channel of __classPrivateFieldGet(this, __ChannelManager__guild, "f").get.channels.cache.values()) {
                let _channel;
                if (channel.isText() && !channel.isThread()) {
                    _channel = new _TextChannel_1._TextChannel(channel, __classPrivateFieldGet(this, __ChannelManager_amateras, "f"));
                }
                if (!_channel)
                    continue;
                this.cache.set(channel.id, _channel);
                yield _channel.init();
            }
            if (__classPrivateFieldGet(this, __ChannelManager_data, "f")) {
                if (__classPrivateFieldGet(this, __ChannelManager_data, "f").welcomeChannel) {
                    const _channel = this.cache.get(__classPrivateFieldGet(this, __ChannelManager_data, "f").welcomeChannel);
                    if (_channel instanceof _TextChannel_1._TextChannel) {
                        this.welcomeChannel = _channel;
                        yield this.welcomeChannel.init();
                    }
                }
            }
        });
    }
    /**
     * @returns 101 - Id is undefined
     * @returns 404 - Channel not found
     */
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const get = this.cache.get(id);
            if (get)
                return get;
            try {
                const channel = yield __classPrivateFieldGet(this, __ChannelManager__guild, "f").get.channels.fetch(id);
                if (!channel) {
                    new Err_1.Err(`Channel fetch failed. (Channel)${id}`);
                    return 404; // Channel not found
                }
                let _channel;
                if (channel instanceof discord_js_1.TextChannel) {
                    _channel = new _Channel_1._Channel(channel, __classPrivateFieldGet(this, __ChannelManager_amateras, "f"));
                }
                if (!_channel)
                    return 404;
                this.cache.set(id, _channel);
                yield _channel.init();
                return _channel;
            }
            catch (err) {
                new Err_1.Err(`Channel fetch failed. (Channel)${id}`);
                return 404;
            }
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Already set
     * @returns 102 - Not a Text Channel
     * @returns 404 - Channel not found
     */
    setWelcome(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const _channel = this.cache.get(id);
            if (!_channel) {
                return 404;
            }
            else {
                if (!(_channel instanceof _TextChannel_1._TextChannel))
                    return 102;
                if (_channel.isWelcomeChannel === true)
                    return 101;
                _channel.isWelcomeChannel = true;
                this.welcomeChannel = _channel;
                __classPrivateFieldGet(this, __ChannelManager__guild, "f").save();
                return 100;
            }
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Already unset
     * @returns 102 - Not a Text Channel
     * @returns 404 - Channel not found
     */
    unsetWelcome(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const _channel = this.cache.get(id);
            if (!_channel) {
                return 404;
            }
            else {
                if (!(_channel instanceof _TextChannel_1._TextChannel))
                    return 102;
                if (_channel.isWelcomeChannel === false)
                    return 101;
                _channel.isWelcomeChannel = false;
                this.welcomeChannel = undefined;
                return 100;
            }
        });
    }
    toData() {
        const data = (0, terminal_1.cloneObj)(this, ['cache']);
        data.welcomeChannel = this.welcomeChannel;
        return data;
    }
}
exports._ChannelManager = _ChannelManager;
__ChannelManager_amateras = new WeakMap(), __ChannelManager__guild = new WeakMap(), __ChannelManager_data = new WeakMap();
//# sourceMappingURL=_ChannelManager.js.map