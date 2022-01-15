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
var _Lobby_amateras, _Lobby_collection, _Lobby_data, _Lobby__guild, _Lobby_owner, _Lobby_member, _Lobby_vFolder, _Lobby_manager, _Lobby_messages;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
const Err_1 = require("./Err");
const terminal_1 = require("./terminal");
class Lobby {
    constructor(data, _guild, manager, amateras) {
        _Lobby_amateras.set(this, void 0);
        _Lobby_collection.set(this, void 0);
        _Lobby_data.set(this, void 0);
        _Lobby__guild.set(this, void 0);
        _Lobby_owner.set(this, void 0);
        _Lobby_member.set(this, void 0);
        _Lobby_vFolder.set(this, void 0);
        _Lobby_manager.set(this, void 0);
        _Lobby_messages.set(this, void 0);
        __classPrivateFieldSet(this, _Lobby_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Lobby_collection, amateras.db.collection('lobbies'), "f");
        __classPrivateFieldSet(this, _Lobby_data, data, "f");
        __classPrivateFieldSet(this, _Lobby__guild, _guild, "f");
        __classPrivateFieldSet(this, _Lobby_owner, data.owner, "f");
        this.owner = {};
        __classPrivateFieldSet(this, _Lobby_member, data.member, "f");
        this.member = new Map;
        __classPrivateFieldSet(this, _Lobby_vFolder, data.vFolder, "f");
        this.vFolder = new Map;
        this.state = data.state;
        __classPrivateFieldSet(this, _Lobby_manager, manager, "f");
        __classPrivateFieldSet(this, _Lobby_messages, data.messages, "f");
        this.messages = new Map;
    }
    /**
     * @returns 100 - Success
     * @returns 404 - Channel fetch failed
     * @returns 405 - Player fetch failed
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.categoryChannel = __classPrivateFieldGet(this, _Lobby__guild, "f").get.channels.cache.get(__classPrivateFieldGet(this, _Lobby_data, "f").categoryChannel);
                this.voiceChannel = __classPrivateFieldGet(this, _Lobby__guild, "f").get.channels.cache.get(__classPrivateFieldGet(this, _Lobby_data, "f").voiceChannel);
                this.textChannel = __classPrivateFieldGet(this, _Lobby__guild, "f").get.channels.cache.get(__classPrivateFieldGet(this, _Lobby_data, "f").textChannel);
                this.infoChannel = __classPrivateFieldGet(this, _Lobby__guild, "f").get.channels.cache.get(__classPrivateFieldGet(this, _Lobby_data, "f").infoChannel);
                if ((yield this.voiceChannel.fetch().catch()) && (yield this.textChannel.fetch().catch(() => undefined))) {
                    this.state = 'CLOSED';
                }
            }
            catch (_a) {
                console.error(`Channel is deleted.`);
                this.state = 'CLOSED';
                yield this.save();
                return 404;
            }
            const player = yield __classPrivateFieldGet(this, _Lobby_amateras, "f").players.fetch(__classPrivateFieldGet(this, _Lobby_owner, "f"));
            if (player === 404)
                return 405;
            this.owner = player;
            this.owner.joinLobby(this);
            for (const memberId of __classPrivateFieldGet(this, _Lobby_member, "f")) {
                const member = yield __classPrivateFieldGet(this, _Lobby_amateras, "f").players.fetch(memberId);
                if (member === 404)
                    continue;
                this.member.set(memberId, member);
                member.joinLobby(this);
            }
            try {
                this.categoryChannel.permissionOverwrites.edit(yield this.categoryChannel.guild.members.fetch(this.owner.id), {
                    VIEW_CHANNEL: true,
                    MANAGE_CHANNELS: true
                });
                this.infoChannel.permissionOverwrites.edit(yield this.categoryChannel.guild.members.fetch(this.owner.id), {
                    VIEW_CHANNEL: true,
                    MANAGE_CHANNELS: false
                });
                this.textChannel.permissionOverwrites.edit(yield this.categoryChannel.guild.members.fetch(this.owner.id), {
                    VIEW_CHANNEL: true,
                    MANAGE_CHANNELS: false
                });
                this.voiceChannel.permissionOverwrites.edit(yield this.categoryChannel.guild.members.fetch(this.owner.id), {
                    VIEW_CHANNEL: true,
                    MANAGE_CHANNELS: false
                });
            }
            catch (err) {
                new Err_1.Err(`${err}`);
            }
            //VImage
            if (__classPrivateFieldGet(this, _Lobby_vFolder, "f") && Object.entries(__classPrivateFieldGet(this, _Lobby_vFolder, "f")).length !== 0) {
                for (const folderOwner in __classPrivateFieldGet(this, _Lobby_vFolder, "f")) {
                    const player = this.member.get(folderOwner);
                    if (player && player.v) {
                        const folder = player.v.imageFolders.folders.get(__classPrivateFieldGet(this, _Lobby_vFolder, "f")[folderOwner]);
                        if (folder) {
                            this.vFolder.set(folderOwner, folder);
                        }
                    }
                }
            }
            else {
                __classPrivateFieldSet(this, _Lobby_vFolder, {}, "f");
            }
            for (const v in __classPrivateFieldGet(this, _Lobby_messages, "f")) {
                const _message = yield __classPrivateFieldGet(this, _Lobby_amateras, "f").messages.fetch(__classPrivateFieldGet(this, _Lobby_messages, "f")[v]);
                if (_message) {
                    this.messages.set(v, _message);
                }
            }
            yield this.initLobbyMessage();
            return 100;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this);
            data.categoryChannel = this.categoryChannel ? this.categoryChannel.id : undefined;
            data.textChannel = this.textChannel ? this.textChannel.id : undefined;
            data.voiceChannel = this.voiceChannel ? this.voiceChannel.id : undefined;
            data.infoChannel = this.infoChannel ? this.infoChannel.id : undefined;
            data.owner = __classPrivateFieldGet(this, _Lobby_owner, "f");
            data.member = [...this.member.keys()];
            data.vFolder = __classPrivateFieldGet(this, _Lobby_vFolder, "f");
            data.guild = __classPrivateFieldGet(this, _Lobby__guild, "f").id;
            data.messages = {};
            data.lobbyMessage = this.lobbyMessage ? this.lobbyMessage.id : undefined;
            if (this.state !== 'CLOSED')
                for (const id of this.messages.keys()) {
                    data.messages[id] = this.messages.get(id).id;
                }
            const lobby = yield __classPrivateFieldGet(this, _Lobby_collection, "f").findOne({ owner: this.owner.id, guild: __classPrivateFieldGet(this, _Lobby__guild, "f").id });
            if (lobby) {
                yield __classPrivateFieldGet(this, _Lobby_collection, "f").replaceOne({ owner: this.owner.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, _Lobby_collection, "f").insertOne(data);
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.textChannel)
                    yield this.textChannel.delete().catch();
                if (this.voiceChannel)
                    yield this.voiceChannel.delete().catch();
                if (this.infoChannel)
                    yield this.infoChannel.delete().catch();
                if (this.categoryChannel) {
                    if (this.categoryChannel.children.size !== 0) {
                        for (const channel of this.categoryChannel.children.values()) {
                            yield channel.delete().catch();
                        }
                    }
                    yield this.categoryChannel.delete().catch();
                }
            }
            catch (err) {
                console.error('Lobby delete channel failed. Retry. \n' + err);
                if (this.categoryChannel)
                    yield this.categoryChannel.delete().catch();
            }
            this.state = 'CLOSED';
            if (this.lobbyMessage)
                this.lobbyMessage.delete().catch();
            yield this.save();
            __classPrivateFieldGet(this, _Lobby_manager, "f").cache.delete(this.owner.id);
            yield __classPrivateFieldGet(this, _Lobby_manager, "f").updateInitMessage();
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Member already in lobby
     * @returns 102 - Missing channel
     * @returns 404 - Player fetch failed
     */
    addMember(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.member.get(id))
                return 101;
            const player = yield __classPrivateFieldGet(this, _Lobby_amateras, "f").players.fetch(id);
            if (player === 404)
                return 404;
            this.member.set(player.id, player);
            player.joinLobby(this);
            if (!this.textChannel || !this.categoryChannel || !this.voiceChannel || !this.infoChannel)
                return 102;
            const member = yield this.textChannel.guild.members.fetch(id);
            this.textChannel.send({ content: `${member}加入了房间` });
            if (player.v)
                yield player.v.sendInfoLobby(this);
            this.categoryChannel.permissionOverwrites.create(yield __classPrivateFieldGet(this, _Lobby_amateras, "f").client.users.fetch(id), { VIEW_CHANNEL: true });
            this.textChannel.permissionOverwrites.create(yield __classPrivateFieldGet(this, _Lobby_amateras, "f").client.users.fetch(id), { VIEW_CHANNEL: true });
            this.voiceChannel.permissionOverwrites.create(yield __classPrivateFieldGet(this, _Lobby_amateras, "f").client.users.fetch(id), { VIEW_CHANNEL: true });
            this.infoChannel.permissionOverwrites.create(yield __classPrivateFieldGet(this, _Lobby_amateras, "f").client.users.fetch(id), { VIEW_CHANNEL: true });
            yield this.initLobbyMessage();
            yield this.save();
            return 100;
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Member not in lobby
     * @returns 102 - Missing channel
     */
    removeMember(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.member.get(id))
                return 101;
            if (!this.textChannel || !this.categoryChannel || !this.voiceChannel || !this.infoChannel)
                return 102;
            const member = yield this.textChannel.guild.members.fetch(id);
            const player = this.member.get(id);
            if (member.voice.channel === this.voiceChannel) {
                member.voice.disconnect();
            }
            this.member.delete(id);
            if (player)
                player.leaveLobby(this);
            this.categoryChannel.permissionOverwrites.create(yield __classPrivateFieldGet(this, _Lobby_amateras, "f").client.users.fetch(id), { VIEW_CHANNEL: false });
            this.textChannel.permissionOverwrites.create(yield __classPrivateFieldGet(this, _Lobby_amateras, "f").client.users.fetch(id), { VIEW_CHANNEL: false });
            this.voiceChannel.permissionOverwrites.create(yield __classPrivateFieldGet(this, _Lobby_amateras, "f").client.users.fetch(id), { VIEW_CHANNEL: false });
            this.infoChannel.permissionOverwrites.create(yield __classPrivateFieldGet(this, _Lobby_amateras, "f").client.users.fetch(id), { VIEW_CHANNEL: false });
            this.deleteMessage(id);
            this.textChannel.send({ content: `${member}退出了房间` });
            yield this.initLobbyMessage();
            yield this.save();
            return 100;
        });
    }
    setFolder(id, folderId) {
        return __awaiter(this, void 0, void 0, function* () {
            let player;
            if (this.owner.id === id) {
                player = this.owner;
            }
            else {
                player = this.member.get(id);
            }
            if (player && player.v) {
                const folder = player.v.imageFolders.folders.get(folderId);
                if (folder) {
                    this.vFolder.set(id, folder);
                    __classPrivateFieldGet(this, _Lobby_vFolder, "f")[id] = folderId;
                    yield this.save();
                    return folder;
                }
            }
            else
                console.error('player is' + player);
            return;
        });
    }
    setMessage(id, _message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.messages.set(id, _message);
            yield this.save();
        });
    }
    deleteMessage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const _message = this.messages.get(id);
            if (_message)
                yield _message.get.delete().catch();
            this.messages.delete(id);
        });
    }
    initLobbyMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const unsetThreadArchived = () => __classPrivateFieldGet(this, _Lobby_manager, "f").thread ? __classPrivateFieldGet(this, _Lobby_manager, "f").thread.archived ? __classPrivateFieldGet(this, _Lobby_manager, "f").thread.edit({ archived: false }).catch(() => undefined) : __classPrivateFieldGet(this, _Lobby_manager, "f").thread : undefined;
            if (__classPrivateFieldGet(this, _Lobby_manager, "f").thread) {
                if (!(yield unsetThreadArchived()))
                    return;
                if (this.lobbyMessage) {
                    if (yield this.lobbyMessage.fetch().catch(() => undefined)) {
                        this.lobbyMessage = yield __classPrivateFieldGet(this, _Lobby_manager, "f").thread.send({ embeds: [this.lobbyMessageEmbed()] });
                        yield this.save();
                    }
                    else {
                        yield this.lobbyMessage.edit({ embeds: [this.lobbyMessageEmbed()] });
                    }
                }
                else {
                    if (__classPrivateFieldGet(this, _Lobby_data, "f").lobbyMessage) {
                        this.lobbyMessage = yield __classPrivateFieldGet(this, _Lobby_manager, "f").thread.messages.fetch(__classPrivateFieldGet(this, _Lobby_data, "f").lobbyMessage);
                    }
                    else {
                        this.lobbyMessage = yield __classPrivateFieldGet(this, _Lobby_manager, "f").thread.send({ embeds: [this.lobbyMessageEmbed()] });
                        yield this.save();
                    }
                }
            }
        });
    }
    lobbyMessageEmbed() {
        const embed = {
            description: `${this.owner.mention()} 的房间`,
            thumbnail: {
                url: this.owner.get ? this.owner.get.displayAvatarURL({ format: "jpg", size: 512 }) : undefined
            },
            fields: [
                {
                    name: `人数`,
                    value: `${this.member.size + 1}人`
                }
            ],
            timestamp: this.infoChannel ? new Date(this.infoChannel.createdTimestamp) : undefined
        };
        return embed;
    }
}
exports.Lobby = Lobby;
_Lobby_amateras = new WeakMap(), _Lobby_collection = new WeakMap(), _Lobby_data = new WeakMap(), _Lobby__guild = new WeakMap(), _Lobby_owner = new WeakMap(), _Lobby_member = new WeakMap(), _Lobby_vFolder = new WeakMap(), _Lobby_manager = new WeakMap(), _Lobby_messages = new WeakMap();
//# sourceMappingURL=Lobby.js.map