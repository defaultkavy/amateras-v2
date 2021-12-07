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
var __Guild_amateras, __Guild_collection, __Guild_log, __Guild_lobby, __Guild_forums;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Guild = void 0;
const ForumManager_1 = require("./ForumManager");
const LobbyManager_1 = require("./LobbyManager");
const GuildLog_1 = require("./GuildLog");
const terminal_1 = require("./terminal");
class _Guild {
    constructor(data, guild, amateras) {
        __Guild_amateras.set(this, void 0);
        __Guild_collection.set(this, void 0);
        __Guild_log.set(this, void 0);
        __Guild_lobby.set(this, void 0);
        __Guild_forums.set(this, void 0);
        __classPrivateFieldSet(this, __Guild_amateras, amateras, "f");
        __classPrivateFieldSet(this, __Guild_collection, __classPrivateFieldGet(this, __Guild_amateras, "f").db.collection('guilds'), "f");
        this.get = guild;
        this.id = data.id;
        __classPrivateFieldSet(this, __Guild_log, data.log, "f");
        this.log = {};
        __classPrivateFieldSet(this, __Guild_lobby, data.lobby, "f");
        __classPrivateFieldSet(this, __Guild_forums, data.forums, "f");
        this.forums = {};
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log = new GuildLog_1.GuildLog(__classPrivateFieldGet(this, __Guild_log, "f"), this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
            yield this.log.init();
            if (__classPrivateFieldGet(this, __Guild_lobby, "f")) {
                this.lobby = new LobbyManager_1.LobbyManager(__classPrivateFieldGet(this, __Guild_lobby, "f"), this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
                console.time('| Lobby loaded');
                yield this.lobby.init();
                console.timeEnd('| Lobby loaded');
            }
            this.forums = new ForumManager_1.ForumManager(__classPrivateFieldGet(this, __Guild_forums, "f"), this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
            console.time('| Forum loaded');
            yield this.forums.init();
            console.timeEnd('| Forum loaded');
            yield this.save();
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this, ['get']);
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
    setupLobbyManager(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.lobby) {
                yield this.lobby.setup(channel);
            }
            else {
                const data = {
                    channel: channel.id,
                    lobbies: [],
                    message: undefined,
                    permissions: []
                };
                this.lobby = new LobbyManager_1.LobbyManager(data, this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
                yield this.lobby.init();
            }
            console.log(`Guild ${this.id} Lobby Function is on.`);
        });
    }
    closeLobbyManager() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.lobby) {
                if (this.lobby.cache.size !== 0) {
                    for (const lobby of this.lobby.cache.values()) {
                        yield lobby.close();
                    }
                }
                if (this.lobby.message) {
                    try {
                        this.lobby.message.delete();
                    }
                    catch (_a) { }
                }
            }
            else
                return 101;
            this.lobby = undefined;
            __classPrivateFieldSet(this, __Guild_lobby, undefined, "f");
            yield this.save();
            console.log(`Guild ${this.id} Lobby Function is off.`);
            return 100;
        });
    }
}
exports._Guild = _Guild;
__Guild_amateras = new WeakMap(), __Guild_collection = new WeakMap(), __Guild_log = new WeakMap(), __Guild_lobby = new WeakMap(), __Guild_forums = new WeakMap();
//# sourceMappingURL=_Guild.js.map