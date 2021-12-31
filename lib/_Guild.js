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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __Guild_amateras, __Guild_collection, __Guild_manager, __Guild_forums;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Guild = void 0;
const ForumManager_1 = require("./ForumManager");
const LobbyManager_1 = require("./LobbyManager");
const GuildLog_1 = require("./GuildLog");
const terminal_1 = require("./terminal");
const _ChannelManager_1 = require("./_ChannelManager");
const GuildCommandManager_1 = require("./GuildCommandManager");
const _RoleManager_1 = require("./_RoleManager");
const Err_1 = require("./Err");
const MusicPlayer_1 = require("./MusicPlayer");
const cmd_1 = __importDefault(require("./cmd"));
class _Guild {
    constructor(data, guild, manager, amateras) {
        __Guild_amateras.set(this, void 0);
        __Guild_collection.set(this, void 0);
        __Guild_manager.set(this, void 0);
        __Guild_forums.set(this, void 0);
        __classPrivateFieldSet(this, __Guild_amateras, amateras, "f");
        __classPrivateFieldSet(this, __Guild_collection, __classPrivateFieldGet(this, __Guild_amateras, "f").db.collection('guilds'), "f");
        __classPrivateFieldSet(this, __Guild_manager, manager, "f");
        this.get = guild;
        this.id = data.id;
        this.commands = new GuildCommandManager_1.GuildCommandManager(data.commands, this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
        this.log = new GuildLog_1.GuildLog(data.log, this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
        this.lobby = new LobbyManager_1.LobbyManager(data.lobby, this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
        __classPrivateFieldSet(this, __Guild_forums, data.forums, "f");
        this.forums = {};
        this.roles = new _RoleManager_1._RoleManager(this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
        this.channels = new _ChannelManager_1._ChannelManager(this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
        this.moderators = data.moderators ? data.moderators : [guild.ownerId];
        this.musicPlayer = new MusicPlayer_1.MusicPlayer(this, amateras);
        this.available = data.available ? data.available : true;
        this.ready = false;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(cmd_1.default.Green, `Guild Initializing: ${this.id}`);
            console.time('| Guild Command deployed');
            yield this.commands.init();
            console.timeEnd('| Guild Command deployed');
            console.time('| Guild Log Channel loaded');
            yield this.log.init();
            console.timeEnd('| Guild Log Channel loaded');
            console.time('| Lobby loaded');
            yield this.lobby.init();
            console.timeEnd('| Lobby loaded');
            this.forums = new ForumManager_1.ForumManager(__classPrivateFieldGet(this, __Guild_forums, "f"), this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
            console.time('| Forum loaded');
            yield this.forums.init();
            console.timeEnd('| Forum loaded');
            console.time('| Role loaded');
            yield this.roles.init();
            console.timeEnd('| Role loaded');
            console.time('| Music loaded');
            yield this.musicPlayer.init();
            console.timeEnd('| Music loaded');
            yield this.save();
            console.log(cmd_1.default.Green, `Guild Initialized: ${this.id}`);
            this.ready = true;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this, ['get', 'roles', 'channels', 'musicPlayer', 'ready']);
            data.commands = this.commands.toData();
            data.log = this.log ? this.log.toData() : undefined;
            data.lobby = this.lobby ? this.lobby.toData() : undefined;
            data.forums = this.forums ? this.forums.toData() : undefined;
            const guild = yield __classPrivateFieldGet(this, __Guild_collection, "f").findOne({ id: this.id });
            if (guild) {
                yield __classPrivateFieldGet(this, __Guild_collection, "f").replaceOne({ id: this.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, __Guild_collection, "f").insertOne(data);
            }
        });
    }
    member(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.get.members.fetch(id);
            }
            catch (err) {
                new Err_1.Err(`Member fetch failed. (User)${id}`);
                return 404;
            }
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Mod command get failed
     * @returns 102 - Command permission change failed
     * @returns 105 - Already set
     * @returns 404 - Player fetch failed
     * @returns 405 - Role fetch failed
     */
    setModerator(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = this.commands.cache.get('mod');
            if (!command)
                return 101;
            if (type === 'USER') {
                const player = yield __classPrivateFieldGet(this, __Guild_amateras, "f").players.fetch(id);
                if (player === 404)
                    return 404;
                const enable = yield command.permissionEnable(id, 'USER');
                if (enable === 105)
                    return 105;
                if (enable === 101)
                    return 102;
                this.moderators.push(id);
                yield this.save();
                return 100;
            }
            else {
                const role = yield this.roles.fetch(id);
                if (role === 404)
                    return 405;
                const enable = yield command.permissionEnable(id, 'ROLE');
                if (enable === 105)
                    return 105;
                if (enable === 101)
                    return 102;
                for (const member of role.get.members) {
                    this.moderators.push(member[1].id);
                }
                yield this.save();
                return 100;
            }
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Mod command get failed
     * @returns 102 - Command permission change failed
     * @returns 105 - Already set
     * @returns 405 - Role fetch failed
     */
    removeModerator(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = this.commands.cache.get('mod');
            if (!command)
                return 101;
            if (!this.moderators.includes(id))
                return 102;
            if (type === 'USER') {
                const disable = yield command.permissionDisable(id, 'USER');
                if (disable === 105)
                    return 105;
                if (disable === 101)
                    return 102;
                this.moderators = (0, terminal_1.removeArrayItem)(this.moderators, id);
                yield this.save();
                return 100;
            }
            else {
                const role = yield this.roles.fetch(id);
                if (role === 404)
                    return 405;
                const disable = yield command.permissionDisable(id, 'ROLE');
                if (disable === 105)
                    return 105;
                if (disable === 101)
                    return 102;
                for (const member of role.get.members) {
                    this.moderators.push(member[1].id);
                }
                yield this.save();
                return 100;
            }
        });
    }
    leave() {
        return __awaiter(this, void 0, void 0, function* () {
            this.available = false;
            yield this.save();
            __classPrivateFieldGet(this, __Guild_manager, "f").cache.delete(this.id);
        });
    }
}
exports._Guild = _Guild;
__Guild_amateras = new WeakMap(), __Guild_collection = new WeakMap(), __Guild_manager = new WeakMap(), __Guild_forums = new WeakMap();
//# sourceMappingURL=_Guild.js.map