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
var __GuildManager_amateras, __GuildManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports._GuildManager = void 0;
const _Guild_1 = require("./_Guild");
class _GuildManager {
    constructor(amateras) {
        __GuildManager_amateras.set(this, void 0);
        __GuildManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, __GuildManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, __GuildManager_collection, amateras.db.collection('guilds'), "f");
        this.cache = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const guilds = __classPrivateFieldGet(this, __GuildManager_amateras, "f").client.guilds.cache;
            for (const guild of guilds.values()) {
                yield this.create(guild);
            }
            yield this.checkAvailable();
        });
    }
    create(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const _guildData = yield __classPrivateFieldGet(this, __GuildManager_collection, "f").findOne({ id: guild.id });
            if (_guildData) {
                // Guild data exist
                const _guild = new _Guild_1._Guild(_guildData, guild, this, __classPrivateFieldGet(this, __GuildManager_amateras, "f"));
                this.cache.set(_guild.id, _guild);
                yield _guild.init();
                yield _guild.save();
            }
            else {
                // Guild data not exist, create one to database
                const _newGuildData = {
                    id: guild.id,
                    moderators: [guild.ownerId]
                };
                const _guild = new _Guild_1._Guild(_newGuildData, guild, this, __classPrivateFieldGet(this, __GuildManager_amateras, "f"));
                yield _guild.init();
                yield _guild.save();
            }
        });
    }
    checkAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            const guilds = __classPrivateFieldGet(this, __GuildManager_amateras, "f").client.guilds.cache;
            const list = yield __classPrivateFieldGet(this, __GuildManager_collection, "f").find({ available: true }).toArray();
            for (const guildData of list) {
                if (!guilds.has(guildData.id)) {
                    guildData.available = false;
                    yield __classPrivateFieldGet(this, __GuildManager_collection, "f").replaceOne({ id: guildData.id }, guildData);
                }
            }
        });
    }
}
exports._GuildManager = _GuildManager;
__GuildManager_amateras = new WeakMap(), __GuildManager_collection = new WeakMap();
//# sourceMappingURL=_GuildManager.js.map