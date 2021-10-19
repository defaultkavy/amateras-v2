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
const discord_js_1 = require("discord.js");
const NotifyChannel_1 = require("./NotifyChannel");
const SettingsChannel_1 = require("./SettingsChannel");
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
        this.settings = undefined;
        this.notify = undefined;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, __ChannelManager_channels, "f")) {
                // If channels data not exist, create one
                __classPrivateFieldSet(this, __ChannelManager_channels, {
                    settings: undefined,
                    notify: undefined,
                    lobby: undefined
                }, "f");
            }
            if (__classPrivateFieldGet(this, __ChannelManager_channels, "f").settings) {
                this.settings = new SettingsChannel_1.SettingsChannel(__classPrivateFieldGet(this, __ChannelManager_channels, "f").settings, __classPrivateFieldGet(this, __ChannelManager__guild, "f"), __classPrivateFieldGet(this, __ChannelManager_guild, "f"), __classPrivateFieldGet(this, __ChannelManager_amateras, "f"));
                if (!(yield this.settings.init())) {
                    yield this.createSettingsChannel();
                }
            }
            else {
                yield this.createSettingsChannel();
            }
            if (__classPrivateFieldGet(this, __ChannelManager_channels, "f").notify) {
                this.notify = new NotifyChannel_1.NotifyChannel(__classPrivateFieldGet(this, __ChannelManager_channels, "f").notify, __classPrivateFieldGet(this, __ChannelManager__guild, "f"), __classPrivateFieldGet(this, __ChannelManager_guild, "f"), __classPrivateFieldGet(this, __ChannelManager_amateras, "f"));
                if (!(yield this.notify.init())) {
                    this.notify = undefined;
                }
            }
        });
    }
    /**
     * Set channel become a specify type.
     * @param channelId Provide a channel ID.
     * @param type Set channel type.
     */
    set(channelId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (type === 'NOTIFY') {
                __classPrivateFieldGet(this, __ChannelManager_channels, "f").notify = { id: channelId };
                this.notify = new NotifyChannel_1.NotifyChannel(__classPrivateFieldGet(this, __ChannelManager_channels, "f").notify, __classPrivateFieldGet(this, __ChannelManager__guild, "f"), __classPrivateFieldGet(this, __ChannelManager_guild, "f"), __classPrivateFieldGet(this, __ChannelManager_amateras, "f"));
                if (!(yield this.notify.init())) {
                    this.notify = undefined;
                    return;
                }
            }
        });
    }
    createSettingsChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, __ChannelManager_channels, "f"))
                return;
            const channel = yield __classPrivateFieldGet(this, __ChannelManager_guild, "f").channels.create('bot-settings', {
                permissionOverwrites: [
                    {
                        id: __classPrivateFieldGet(this, __ChannelManager_guild, "f").roles.everyone.id,
                        deny: [discord_js_1.Permissions.FLAGS.VIEW_CHANNEL]
                    }
                ]
            });
            __classPrivateFieldGet(this, __ChannelManager_channels, "f").settings = { id: channel.id };
            this.settings = new SettingsChannel_1.SettingsChannel(__classPrivateFieldGet(this, __ChannelManager_channels, "f").settings, __classPrivateFieldGet(this, __ChannelManager__guild, "f"), __classPrivateFieldGet(this, __ChannelManager_guild, "f"), __classPrivateFieldGet(this, __ChannelManager_amateras, "f"));
            yield this.settings.init();
            yield this.settings.update();
        });
    }
}
exports._ChannelManager = _ChannelManager;
__ChannelManager_amateras = new WeakMap(), __ChannelManager_channels = new WeakMap(), __ChannelManager_guild = new WeakMap(), __ChannelManager__guild = new WeakMap();
//# sourceMappingURL=_ChannelManager.js.map