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
var _LobbyManager_amateras, _LobbyManager_collection, _LobbyManager__guild, _LobbyManager_data, _LobbyManager_resolve;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyManager = void 0;
const discord_js_1 = require("discord.js");
const Err_1 = require("./Err");
const Lobby_1 = require("./Lobby");
const terminal_1 = require("./terminal");
class LobbyManager {
    constructor(data, _guild, amateras) {
        _LobbyManager_amateras.set(this, void 0);
        _LobbyManager_collection.set(this, void 0);
        _LobbyManager__guild.set(this, void 0);
        _LobbyManager_data.set(this, void 0);
        _LobbyManager_resolve.set(this, void 0);
        __classPrivateFieldSet(this, _LobbyManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _LobbyManager_collection, amateras.db.collection('lobbies'), "f");
        __classPrivateFieldSet(this, _LobbyManager__guild, _guild, "f");
        __classPrivateFieldSet(this, _LobbyManager_data, data, "f");
        this.channel = {};
        this.cache = new Map;
        this.message;
        this.threadMessage;
        __classPrivateFieldSet(this, _LobbyManager_resolve, new Map, "f");
        this.permissions = __classPrivateFieldGet(this, _LobbyManager_data, "f") ? __classPrivateFieldGet(this, _LobbyManager_data, "f").permissions : [];
        this.enabled = false;
    }
    init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _LobbyManager_data, "f")) {
                this.enabled = false;
                return;
            }
            try {
                const channel = yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").channels.fetch((_a = __classPrivateFieldGet(this, _LobbyManager_data, "f")) === null || _a === void 0 ? void 0 : _a.channel);
                if (channel === 404) {
                    new Err_1.Err(`Lobby channel fetch failed`);
                    return 404;
                }
                this.channel = channel.get;
                if (__classPrivateFieldGet(this, _LobbyManager_data, "f").lobbies && __classPrivateFieldGet(this, _LobbyManager_data, "f").lobbies.length !== 0) {
                    for (const lobbyId of __classPrivateFieldGet(this, _LobbyManager_data, "f").lobbies) {
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
                if (__classPrivateFieldGet(this, _LobbyManager_data, "f").message) {
                    try {
                        this.message = yield this.channel.messages.fetch(__classPrivateFieldGet(this, _LobbyManager_data, "f").message);
                    }
                    catch (_b) {
                        new Err_1.Err(`Lobby message fetch failed`);
                    }
                }
                if (__classPrivateFieldGet(this, _LobbyManager_data, "f").threadMessage) {
                    try {
                        if (this.message && this.message.thread) {
                            this.threadMessage = yield this.message.thread.messages.fetch(__classPrivateFieldGet(this, _LobbyManager_data, "f").threadMessage);
                        }
                    }
                    catch (_c) {
                        new Err_1.Err(`Lobby thread message fetch failed`);
                    }
                }
                yield this.updateInitMessage();
            }
            catch (_d) {
                return 404;
            }
        });
    }
    /**
     * Setup lobby channel
     * @returns 101 - Already set
     */
    setup(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channel && this.channel.id === channel.id)
                return 101;
            this.enabled = true;
            this.channel = channel;
            if (this.message && !this.message.deleted)
                this.message.delete();
            yield this.sendInitMessage();
            yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").save();
            return this.channel;
        });
    }
    /**
     * Unset lobby channel
     * @returns 100 - Success
     * @returns 101 - Lobby channel never set
     * @returns 102 - Not a lobby channel
     */
    unset(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.channel)
                return 101;
            if (this.channel.id !== channel.id)
                return 102;
            this.enabled = false;
            this.channel = undefined;
            if (this.message && !this.message.deleted)
                this.message.delete();
            yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").save();
            return 100;
        });
    }
    /**
     * @returns 101 - Lobby closed
     * @returns 404 - Lobby fetch failed
     */
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const lobby = this.cache.get(id);
            if (lobby && lobby.state === 'OPEN') {
                return lobby;
            }
            else if (lobby && lobby.state === 'CLOSED') {
                return 101;
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
                return 404;
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
    create(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").get.members.fetch(id);
            for (let i = 0; i < this.permissions.length; i++) {
                if (member.roles.cache.has(this.permissions[i])) {
                    break;
                }
                else if (i === this.permissions.length - 1) {
                    return 101;
                }
            }
            const ownerPermission = {
                id: id,
                allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS']
            };
            const otherPermission = {
                id: __classPrivateFieldGet(this, _LobbyManager__guild, "f").get.roles.everyone,
                deny: ['VIEW_CHANNEL']
            };
            const category = yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").get.channels.create(member.displayName + '的房间', {
                type: 'GUILD_CATEGORY',
                permissionOverwrites: [ownerPermission, otherPermission]
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
                owner: id,
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
            yield lobby.save();
            yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").save();
            yield this.updateInitMessage();
            lobby.textChannel.send({ content: `${member}创建了房间` });
            __classPrivateFieldGet(this, _LobbyManager__guild, "f").log.send(`${yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").log.name(id)} 创建了房间`);
            if (lobby.owner.v)
                lobby.owner.v.sendInfoLobby(lobby);
            return lobby;
        });
    }
    toData() {
        const data = (0, terminal_1.cloneObj)(this, ['cache']);
        data.channel = this.channel ? this.channel.id : undefined;
        data.lobbies = Array.from(this.cache.keys());
        data.message = this.message ? this.message.id : undefined;
        data.threadMessage = this.threadMessage ? this.threadMessage.id : undefined;
        return data;
    }
    sendInitMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.channel)
                return 101;
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
            __classPrivateFieldGet(this, _LobbyManager_amateras, "f").messages.create(message, {
                lobby_create: 'lobby_create',
                lobby_close: 'lobby_close'
            });
        });
    }
    updateInitMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = this.initEmbed();
            if (this.message) {
                yield this.message.edit({ embeds: [embed] });
                if (!this.message.thread) {
                    if (this.message.channel.type !== 'GUILD_TEXT')
                        return;
                    yield this.message.channel.threads.create({ startMessage: this.message, name: '房间列表', autoArchiveDuration: 60 });
                }
                let list = ``;
                for (const lobby of this.cache) {
                    if (lobby[1].state === 'OPEN')
                        list += `\n${lobby[1].owner.mention()} - ${new Date(lobby[1].categoryChannel.createdTimestamp).toLocaleString('en-ZA')}`;
                }
                const listEmbed = {
                    description: list
                };
                if (this.message.thread) {
                    try {
                        yield this.message.thread.setArchived(false);
                        if (this.threadMessage) {
                            this.threadMessage.edit({ embeds: [listEmbed], allowedMentions: { parse: [] } });
                        }
                        else {
                            this.threadMessage = yield this.message.thread.send({ embeds: [listEmbed], allowedMentions: { parse: [] } });
                        }
                    }
                    catch (_a) {
                        new Err_1.Err(`Lobby thread message init error`);
                    }
                }
            }
            else
                yield this.sendInitMessage();
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
    /**
     * Remove user from permission list
     * @returns 100 - Success
     * @returns 101 - Already added
     */
    permissionAdd(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.permissions.includes(id))
                return 101;
            this.permissions.push(id);
            yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").save();
            return 100;
        });
    }
    /**
     * Remove user from permission list
     * @returns 100 - Success
     * @returns 101 - Already removed
     */
    permissionRemove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.permissions.includes(id))
                return 101;
            this.permissions = (0, terminal_1.removeArrayItem)(this.permissions, id);
            yield __classPrivateFieldGet(this, _LobbyManager__guild, "f").save();
            return 100;
        });
    }
}
exports.LobbyManager = LobbyManager;
_LobbyManager_amateras = new WeakMap(), _LobbyManager_collection = new WeakMap(), _LobbyManager__guild = new WeakMap(), _LobbyManager_data = new WeakMap(), _LobbyManager_resolve = new WeakMap();
//# sourceMappingURL=LobbyManager.js.map