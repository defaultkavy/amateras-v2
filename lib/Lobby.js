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
var _Lobby_amateras, _Lobby_collection, _Lobby__guild, _Lobby_categoryChannel, _Lobby_voiceChannel, _Lobby_textChannel, _Lobby_infoChannel, _Lobby_owner, _Lobby_member, _Lobby_vFolder, _Lobby_manager, _Lobby_messages;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
const terminal_1 = require("./terminal");
class Lobby {
    constructor(data, _guild, manager, amateras) {
        _Lobby_amateras.set(this, void 0);
        _Lobby_collection.set(this, void 0);
        _Lobby__guild.set(this, void 0);
        _Lobby_categoryChannel.set(this, void 0);
        _Lobby_voiceChannel.set(this, void 0);
        _Lobby_textChannel.set(this, void 0);
        _Lobby_infoChannel.set(this, void 0);
        _Lobby_owner.set(this, void 0);
        _Lobby_member.set(this, void 0);
        _Lobby_vFolder.set(this, void 0);
        _Lobby_manager.set(this, void 0);
        _Lobby_messages.set(this, void 0);
        __classPrivateFieldSet(this, _Lobby_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Lobby_collection, amateras.db.collection('lobbies'), "f");
        __classPrivateFieldSet(this, _Lobby__guild, _guild, "f");
        __classPrivateFieldSet(this, _Lobby_owner, data.owner, "f");
        this.owner = {};
        __classPrivateFieldSet(this, _Lobby_member, data.member, "f");
        this.member = new Map;
        __classPrivateFieldSet(this, _Lobby_vFolder, data.vFolder, "f");
        this.vFolder = new Map;
        __classPrivateFieldSet(this, _Lobby_categoryChannel, data.categoryChannel, "f");
        this.categoryChannel = {};
        __classPrivateFieldSet(this, _Lobby_voiceChannel, data.voiceChannel, "f");
        this.voiceChannel = {};
        __classPrivateFieldSet(this, _Lobby_textChannel, data.textChannel, "f");
        this.textChannel = {};
        __classPrivateFieldSet(this, _Lobby_infoChannel, data.infoChannel, "f");
        this.infoChannel = {};
        this.state = data.state;
        __classPrivateFieldSet(this, _Lobby_manager, manager, "f");
        __classPrivateFieldSet(this, _Lobby_messages, data.messages, "f");
        this.messages = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.categoryChannel = __classPrivateFieldGet(this, _Lobby__guild, "f").get.channels.cache.get(__classPrivateFieldGet(this, _Lobby_categoryChannel, "f"));
                this.voiceChannel = __classPrivateFieldGet(this, _Lobby__guild, "f").get.channels.cache.get(__classPrivateFieldGet(this, _Lobby_voiceChannel, "f"));
                this.textChannel = __classPrivateFieldGet(this, _Lobby__guild, "f").get.channels.cache.get(__classPrivateFieldGet(this, _Lobby_textChannel, "f"));
                this.infoChannel = __classPrivateFieldGet(this, _Lobby__guild, "f").get.channels.cache.get(__classPrivateFieldGet(this, _Lobby_infoChannel, "f"));
            }
            catch (_a) {
                console.error(`Channel is deleted.`);
                this.state = 'CLOSED';
                yield this.save();
                return false;
            }
            if (this.voiceChannel.deleted && this.textChannel.deleted) {
                this.state = 'CLOSED';
            }
            this.owner = yield __classPrivateFieldGet(this, _Lobby_amateras, "f").players.fetch(__classPrivateFieldGet(this, _Lobby_owner, "f"));
            this.owner.joinLobby(this);
            for (const memberId of __classPrivateFieldGet(this, _Lobby_member, "f")) {
                const member = yield __classPrivateFieldGet(this, _Lobby_amateras, "f").players.fetch(memberId);
                this.member.set(memberId, member);
                member.joinLobby(this);
            }
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
            return true;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this);
            data.categoryChannel = __classPrivateFieldGet(this, _Lobby_categoryChannel, "f");
            data.textChannel = __classPrivateFieldGet(this, _Lobby_textChannel, "f");
            data.voiceChannel = __classPrivateFieldGet(this, _Lobby_voiceChannel, "f");
            data.infoChannel = __classPrivateFieldGet(this, _Lobby_infoChannel, "f");
            data.owner = __classPrivateFieldGet(this, _Lobby_owner, "f");
            data.member = __classPrivateFieldGet(this, _Lobby_member, "f");
            data.vFolder = __classPrivateFieldGet(this, _Lobby_vFolder, "f");
            data.guild = __classPrivateFieldGet(this, _Lobby__guild, "f").id;
            data.messages = {};
            if (this.state !== 'CLOSED')
                for (const id of this.messages.keys()) {
                    data.messages[id] = this.messages.get(id).id;
                }
            const lobby = yield __classPrivateFieldGet(this, _Lobby_collection, "f").findOne({ owner: this.owner.id });
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
                if (!this.textChannel.deleted)
                    yield this.textChannel.delete();
                if (!this.voiceChannel.deleted)
                    yield this.voiceChannel.delete();
                if (!this.infoChannel.deleted)
                    yield this.infoChannel.delete();
                if (this.categoryChannel.children.size !== 0) {
                    for (const channel of this.categoryChannel.children.entries()) {
                        if (!channel[1].deleted)
                            yield channel[1].delete();
                    }
                }
                if (!this.categoryChannel.deleted)
                    yield this.categoryChannel.delete();
            }
            catch (_a) { }
            this.state = 'CLOSED';
            yield this.save();
            __classPrivateFieldGet(this, _Lobby_manager, "f").cache.delete(this.owner.id);
            yield __classPrivateFieldGet(this, _Lobby_manager, "f").updateInitMessage();
            __classPrivateFieldGet(this, _Lobby__guild, "f").log.send(`${yield __classPrivateFieldGet(this, _Lobby__guild, "f").log.name(this.owner.id)} 关闭了房间`);
        });
    }
    addMember(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield __classPrivateFieldGet(this, _Lobby_amateras, "f").players.fetch(id);
            this.member.set(player.id, player);
            __classPrivateFieldGet(this, _Lobby_member, "f").push(id);
            player.joinLobby(this);
            const member = yield this.textChannel.guild.members.fetch(id);
            this.textChannel.send({ content: `${member}加入了房间` });
            if (player.v)
                yield player.v.sendInfoLobby(this);
            this.categoryChannel.permissionOverwrites.create(yield __classPrivateFieldGet(this, _Lobby_amateras, "f").client.users.fetch(id), { VIEW_CHANNEL: true });
            yield this.save();
        });
    }
    removeMember(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield this.textChannel.guild.members.fetch(id);
            const player = this.member.get(id);
            if (member.voice.channel === this.voiceChannel) {
                member.voice.disconnect();
            }
            this.member.delete(id);
            if (player)
                player.leaveLobby(this);
            __classPrivateFieldSet(this, _Lobby_member, (0, terminal_1.removeArrayItem)(__classPrivateFieldGet(this, _Lobby_member, "f"), id), "f");
            this.categoryChannel.permissionOverwrites.create(yield __classPrivateFieldGet(this, _Lobby_amateras, "f").client.users.fetch(id), { VIEW_CHANNEL: false });
            this.deleteMessage(id);
            this.textChannel.send({ content: `${member}退出了房间` });
            yield this.save();
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
            if (_message && !_message.get.deleted)
                yield _message.get.delete();
            this.messages.delete(id);
        });
    }
}
exports.Lobby = Lobby;
_Lobby_amateras = new WeakMap(), _Lobby_collection = new WeakMap(), _Lobby__guild = new WeakMap(), _Lobby_categoryChannel = new WeakMap(), _Lobby_voiceChannel = new WeakMap(), _Lobby_textChannel = new WeakMap(), _Lobby_infoChannel = new WeakMap(), _Lobby_owner = new WeakMap(), _Lobby_member = new WeakMap(), _Lobby_vFolder = new WeakMap(), _Lobby_manager = new WeakMap(), _Lobby_messages = new WeakMap();
//# sourceMappingURL=Lobby.js.map