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
var _PlayerMusicManager_amateras, _PlayerMusicManager_collection, _PlayerMusicManager_data;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerMusicManager = void 0;
const PlayerMusic_1 = require("./PlayerMusic");
class PlayerMusicManager {
    constructor(player, amateras) {
        _PlayerMusicManager_amateras.set(this, void 0);
        _PlayerMusicManager_collection.set(this, void 0);
        _PlayerMusicManager_data.set(this, void 0);
        __classPrivateFieldSet(this, _PlayerMusicManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _PlayerMusicManager_collection, amateras.db.collection('player_music'), "f");
        this.player = player;
        this.history = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = __classPrivateFieldGet(this, _PlayerMusicManager_collection, "f").find({ player: this.player.id });
            const data = yield cursor.toArray();
            if (data) {
                __classPrivateFieldSet(this, _PlayerMusicManager_data, data, "f");
            }
        });
    }
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const get = this.history.get(id);
            if (get)
                return get;
            const music = yield __classPrivateFieldGet(this, _PlayerMusicManager_amateras, "f").musics.fetch(id);
            if (music === 404)
                return 404;
            const data = yield __classPrivateFieldGet(this, _PlayerMusicManager_collection, "f").findOne({ id: id, player: this.player.id });
            if (data) {
                const playerMusic = new PlayerMusic_1.PlayerMusic(data, music, __classPrivateFieldGet(this, _PlayerMusicManager_amateras, "f"));
                this.history.set(id, playerMusic);
                yield playerMusic.init();
                return playerMusic;
            }
            else {
                return 404;
            }
        });
    }
    /**
     * @returns 101 - Already exist
     */
    create(music) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.history.has(music.id))
                return 101;
            const data = {
                id: music.id,
                counts: 0,
                player: this.player
            };
            const playerMusic = new PlayerMusic_1.PlayerMusic(data, music, __classPrivateFieldGet(this, _PlayerMusicManager_amateras, "f"));
            this.history.set(music.id, playerMusic);
            yield playerMusic.init();
            yield playerMusic.save();
            return playerMusic;
        });
    }
    /**
     * @returns 101 - Already exist
     */
    add(music) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetch = yield this.fetch(music.id);
            if (fetch instanceof PlayerMusic_1.PlayerMusic)
                return fetch;
            const create = yield this.create(music);
            return create;
        });
    }
    fetchAll() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _PlayerMusicManager_data, "f")) {
                for (const data of __classPrivateFieldGet(this, _PlayerMusicManager_data, "f")) {
                    yield this.fetch(data.id);
                }
            }
        });
    }
    getTop() {
        const list = [...this.history.values()];
        return list.sort((a, b) => {
            return a.counts - b.counts;
        });
    }
}
exports.PlayerMusicManager = PlayerMusicManager;
_PlayerMusicManager_amateras = new WeakMap(), _PlayerMusicManager_collection = new WeakMap(), _PlayerMusicManager_data = new WeakMap();
//# sourceMappingURL=PlayerMusicManager.js.map