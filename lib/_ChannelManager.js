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
var __ChannelManager_amateras, __ChannelManager__guild;
Object.defineProperty(exports, "__esModule", { value: true });
exports._ChannelManager = void 0;
const Err_1 = require("./Err");
const _Channel_1 = require("./_Channel");
class _ChannelManager {
    constructor(_guild, amateras) {
        __ChannelManager_amateras.set(this, void 0);
        __ChannelManager__guild.set(this, void 0);
        __classPrivateFieldSet(this, __ChannelManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, __ChannelManager__guild, _guild, "f");
        this.cache = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const channel of __classPrivateFieldGet(this, __ChannelManager__guild, "f").get.channels.cache.values()) {
                const _channel = new _Channel_1._Channel(channel, __classPrivateFieldGet(this, __ChannelManager_amateras, "f"));
                this.cache.set(channel.id, _channel);
                yield _channel.init();
            }
        });
    }
    /**
     *
     * @returns 404 - Channel not found
     */
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const channel = yield __classPrivateFieldGet(this, __ChannelManager__guild, "f").get.channels.fetch(id);
                if (!channel) {
                    new Err_1.Err(`Channel fetch failed. (Channel)${id}`);
                    return 404; // Channel not found
                }
                const _channel = new _Channel_1._Channel(channel, __classPrivateFieldGet(this, __ChannelManager_amateras, "f"));
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
}
exports._ChannelManager = _ChannelManager;
__ChannelManager_amateras = new WeakMap(), __ChannelManager__guild = new WeakMap();
//# sourceMappingURL=_ChannelManager.js.map