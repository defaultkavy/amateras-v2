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
var __ChannelManager_amateras, __ChannelManager_channels, __ChannelManager_guild, __ChannelManager__guild;
Object.defineProperty(exports, "__esModule", { value: true });
exports._ChannelManager = void 0;
class _ChannelManager {
    constructor(data, guild, _guild, amateras) {
        __ChannelManager_amateras.set(this, void 0);
        __ChannelManager_channels.set(this, void 0);
        __ChannelManager_guild.set(this, void 0);
        __ChannelManager__guild.set(this, void 0);
        __classPrivateFieldSet(this, __ChannelManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, __ChannelManager_channels, data, "f");
        __classPrivateFieldSet(this, __ChannelManager_guild, guild, "f");
        __classPrivateFieldSet(this, __ChannelManager__guild, _guild, "f");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, __ChannelManager_channels, "f")) {
                // If channels data not exist, create one
                __classPrivateFieldSet(this, __ChannelManager_channels, {
                    lobby: undefined
                }, "f");
            }
            // if (this.#channels.settings) {
            //     this.settings = new SettingsChannel(this.#channels.settings, this.#_guild, this.#guild, this.#amateras)
            //     if (!await this.settings.init()) {
            //         await this.createSettingsChannel()
            //     }
            // } else {
            //     await this.createSettingsChannel()
            // }
            // if (this.#channels.notify) {
            //     this.notify = new NotifyChannel(this.#channels.notify, this.#_guild, this.#guild, this.#amateras)
            //     if (!await this.notify.init()) {
            //         this.notify = undefined
            //     }
            // }
        });
    }
}
exports._ChannelManager = _ChannelManager;
__ChannelManager_amateras = new WeakMap(), __ChannelManager_channels = new WeakMap(), __ChannelManager_guild = new WeakMap(), __ChannelManager__guild = new WeakMap();
//# sourceMappingURL=_ChannelManager.js.map