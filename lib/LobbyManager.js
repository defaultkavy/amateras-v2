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
var _LobbyManager_amateras, _LobbyManager_collection, _LobbyManager__guild, _LobbyManager_lobby, _LobbyManager_channel, _LobbyManager_message, _LobbyManager_resolve;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyManager = void 0;
const discord_js_1 = require("discord.js");
const Lobby_1 = require("./Lobby");
const terminal_1 = require("./terminal");
class LobbyManager {
    constructor(data, _guild, amateras) {
        _LobbyManager_amateras.set(this, void 0);
        _LobbyManager_collection.set(this, void 0);
        _LobbyManager__guild.set(this, void 0);
        _LobbyManager_lobby.set(this, void 0);
        _LobbyManager_channel.set(this, void 0);
        _LobbyManager_message.set(this, void 0);
        _LobbyManager_resolve.set(this, void 0);
        __classPrivateFieldSet(this, _LobbyManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _LobbyManager_collection, amateras.db.collection('lobbies'), "f");
        __classPrivateFieldSet(this, _LobbyManager__guild, _guild, "f");
        __classPrivateFieldSet(this, _LobbyManager_channel, data.channel, "f");
        this.channel = {};
        __classPrivateFieldSet(this, _LobbyManager_lobby, data.lobby, "f");
        this.cache = new Map;
        __classPrivateFieldSet(this, _LobbyManager_message, data.message, "f");
        this.message;
        __classPrivateFieldSet(this, _LobbyManager_resolve, new Map, "f");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let channel;
            try {
                channel = yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").get.channels.fetch(__classPrivateFieldGet(this, _LobbyManager_channel, "f"));
                if (!channel) {
                    console.error('channel is ' + channel);
                    return;
                }
            }
            catch (_a) {
                console.error('Lobby Channel is deleted. Lobby function close.');
                __classPrivateFieldGet(this, _LobbyManager__guild, "f").closeLobbyManager();
                return;
            }
            this.channel = channel;
            if (__classPrivateFieldGet(this, _LobbyManager_lobby, "f") && __classPrivateFieldGet(this, _LobbyManager_lobby, "f").length !== 0) {
                for (const lobbyId of __classPrivateFieldGet(this, _LobbyManager_lobby, "f")) {
                    const lobbyData = yield __classPrivateFieldGet(this, _LobbyManager_collection, "f").findOne({ owner: lobbyId, state: "OPEN" });
                    if (lobbyData) {
                        const lobby = new Lobby_1.Lobby(lobbyData, __classPrivateFieldGet(this, _LobbyManager__guild, "f"), this, __classPrivateFieldGet(this, _LobbyManager_amateras, "f"));
                        this.cache.set(lobbyId, lobby);
                        if (yield lobby.init())
                            __classPrivateFieldGet(this, _LobbyManager_resolve, "f").set(lobby.categoryChannel.id, lobby);
                        else
                            this.cache.delete(lobbyId);
                    }
                }
            }
            if (__classPrivateFieldGet(this, _LobbyManager_message, "f"))
                try {
                    this.message = yield this.channel.messages.fetch(__classPrivateFieldGet(this, _LobbyManager_message, "f"));
                }
                catch (_b) {
                    console.error('Lobby Message is deleted.');
                }
            if (!this.message)
                yield this.sendInitMessage();
            else
                yield this.updateInitMessage();
            yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").save();
        });
    }
    setup(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            this.channel = channel;
            __classPrivateFieldSet(this, _LobbyManager_channel, channel.id, "f");
            if (this.message && !this.message.deleted)
                this.message.delete();
            yield this.sendInitMessage();
            yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").save();
        });
    }
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const lobby = this.cache.get(id);
            if (lobby && lobby.state === 'OPEN') {
                return lobby;
            }
            else if (lobby && lobby.state === 'CLOSED') {
                return;
            }
            const lobbyData = yield __classPrivateFieldGet(this, _LobbyManager_collection, "f").findOne({ owner: id, state: "OPEN" });
            if (lobbyData) {
                const lobby = new Lobby_1.Lobby(lobbyData, __classPrivateFieldGet(this, _LobbyManager__guild, "f"), this, __classPrivateFieldGet(this, _LobbyManager_amateras, "f"));
                this.cache.set(id, lobby);
                yield lobby.init();
                __classPrivateFieldGet(this, _LobbyManager_resolve, "f").set(lobby.categoryChannel.id, lobby);
                return lobby;
            }
            else
                return;
        });
    }
    fetchByCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const lobby = __classPrivateFieldGet(this, _LobbyManager_resolve, "f").get(id);
            if (lobby && lobby.state === 'OPEN') {
                return lobby;
            }
            else if (lobby && lobby.state === 'CLOSED') {
                return;
            }
            let lobbyData = yield __classPrivateFieldGet(this, _LobbyManager_collection, "f").findOne({ categoryChannel: id, state: "OPEN" });
            if (lobbyData) {
                const lobby = new Lobby_1.Lobby(lobbyData, __classPrivateFieldGet(this, _LobbyManager__guild, "f"), this, __classPrivateFieldGet(this, _LobbyManager_amateras, "f"));
                this.cache.set(lobby.owner.id, lobby);
                yield lobby.init();
                __classPrivateFieldGet(this, _LobbyManager_resolve, "f").set(lobby.categoryChannel.id, lobby);
                return lobby;
            }
            return;
        });
    }
    create(interact) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").get.members.fetch(interact.user.id);
            const ownerPermission = {
                id: interact.user.id,
                allow: 'VIEW_CHANNEL'
            };
            const otherPermission = {
                id: __classPrivateFieldGet(this, _LobbyManager__guild, "f").get.roles.everyone,
                deny: 'VIEW_CHANNEL'
            };
            const category = yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").get.channels.create(member.displayName + '的房间', {
                type: 'GUILD_CATEGORY',
                permissionOverwrites: [ownerPermission, otherPermission],
                position: this.channel.parent ? this.channel.parent.position + 1 : this.channel.position + 1
            });
            const infoChannel = yield category.createChannel('素材频道', {
                type: 'GUILD_TEXT'
            });
            const textChannel = yield category.createChannel('文字频道', {
                type: 'GUILD_TEXT'
            });
            const voiceChannel = yield category.createChannel('语音频道', {
                type: 'GUILD_VOICE'
            });
            textChannel.lockPermissions();
            voiceChannel.lockPermissions();
            const data = {
                owner: interact.user.id,
                member: [],
                vFolder: {},
                categoryChannel: category.id,
                textChannel: textChannel.id,
                voiceChannel: voiceChannel.id,
                infoChannel: infoChannel.id,
                state: 'OPEN',
                guild: __classPrivateFieldGet(this, _LobbyManager__guild, "f").id,
                messages: {}
            };
            const lobby = new Lobby_1.Lobby(data, __classPrivateFieldGet(this, _LobbyManager__guild, "f"), this, __classPrivateFieldGet(this, _LobbyManager_amateras, "f"));
            this.cache.set(data.owner, lobby);
            yield lobby.init();
            yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").save();
            yield this.updateInitMessage();
            if (lobby.owner.v)
                lobby.owner.v.sendInfoLobby(lobby);
        });
    }
    toData() {
        const data = (0, terminal_1.cloneObj)(this, ['cache']);
        data.channel = __classPrivateFieldGet(this, _LobbyManager_channel, "f");
        data.lobby = Array.from(this.cache.keys());
        data.message = __classPrivateFieldGet(this, _LobbyManager_message, "f");
        return data;
    }
    sendInitMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = this.initEmbed();
            const create_button = new discord_js_1.MessageButton;
            create_button.label = '创建房间';
            create_button.customId = '#lobby_create';
            create_button.style = 'PRIMARY';
            const close_button = new discord_js_1.MessageButton;
            close_button.label = '关闭房间';
            close_button.customId = '#lobby_close';
            close_button.style = 'DANGER';
            const action = new discord_js_1.MessageActionRow;
            action.addComponents(create_button);
            action.addComponents(close_button);
            const message = yield this.channel.send({ embeds: [embed], components: [action] });
            this.message = message;
            __classPrivateFieldSet(this, _LobbyManager_message, message.id, "f");
            __classPrivateFieldGet(this, _LobbyManager_amateras, "f").messages.create(message, {
                lobby_create: 'lobby_create',
                lobby_close: 'lobby_close'
            });
        });
    }
    updateInitMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = this.initEmbed();
            if (this.message)
                yield this.message.edit({ embeds: [embed] });
        });
    }
    initEmbed() {
        const embed = {
            title: '创建你的房间，和好友一起联动',
            description: '点击下方按钮，将会立即创建一个只对你可见的文字频道和语音频道！\n创建后便可以邀请朋友加入啦！',
            fields: [
                {
                    name: '当前已创建的房间',
                    value: this.cache.size + '个'
                }
            ]
        };
        return embed;
    }
}
exports.LobbyManager = LobbyManager;
_LobbyManager_amateras = new WeakMap(), _LobbyManager_collection = new WeakMap(), _LobbyManager__guild = new WeakMap(), _LobbyManager_lobby = new WeakMap(), _LobbyManager_channel = new WeakMap(), _LobbyManager_message = new WeakMap(), _LobbyManager_resolve = new WeakMap();
//# sourceMappingURL=LobbyManager.js.map