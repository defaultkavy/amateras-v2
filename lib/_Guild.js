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
var __Guild_amateras, __Guild_collection, __Guild_channels, __Guild_lobbies;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Guild = void 0;
const LobbyManager_1 = require("./LobbyManager");
const terminal_1 = require("./terminal");
const _ChannelManager_1 = require("./_ChannelManager");
class _Guild {
    constructor(data, guild, amateras) {
        __Guild_amateras.set(this, void 0);
        __Guild_collection.set(this, void 0);
        __Guild_channels.set(this, void 0);
        __Guild_lobbies.set(this, void 0);
        __classPrivateFieldSet(this, __Guild_amateras, amateras, "f");
        __classPrivateFieldSet(this, __Guild_collection, __classPrivateFieldGet(this, __Guild_amateras, "f").db.collection('guilds'), "f");
        this.get = guild;
        this.id = data.id;
        __classPrivateFieldSet(this, __Guild_channels, data.channels, "f");
        this.channels = {};
        __classPrivateFieldSet(this, __Guild_lobbies, data.lobbies, "f");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.channels = new _ChannelManager_1._ChannelManager(__classPrivateFieldGet(this, __Guild_channels, "f"), this.get, this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
            yield this.channels.init();
            if (__classPrivateFieldGet(this, __Guild_lobbies, "f")) {
                this.lobbies = new LobbyManager_1.LobbyManager(__classPrivateFieldGet(this, __Guild_lobbies, "f"), this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
                yield this.lobbies.init();
            }
        });
    }
    save() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this, ['get']);
            data.channels = {
                settings: (_a = this.channels.settings) === null || _a === void 0 ? void 0 : _a.data,
                notify: (_b = this.channels.notify) === null || _b === void 0 ? void 0 : _b.data
            };
            data.lobbies = this.lobbies ? this.lobbies.toData() : undefined;
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
            if (this.lobbies) {
                yield this.lobbies.setup(channel);
            }
            else {
                const data = {
                    channel: channel.id,
                    lobby: [],
                    message: undefined
                };
                this.lobbies = new LobbyManager_1.LobbyManager(data, this, __classPrivateFieldGet(this, __Guild_amateras, "f"));
                yield this.lobbies.init();
            }
        });
    }
}
exports._Guild = _Guild;
__Guild_amateras = new WeakMap(), __Guild_collection = new WeakMap(), __Guild_channels = new WeakMap(), __Guild_lobbies = new WeakMap();
//# sourceMappingURL=_Guild.js.map