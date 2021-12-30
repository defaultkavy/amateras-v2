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
var _MusicManager_amateras, _MusicManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicManager = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const Music_1 = require("./Music");
class MusicManager {
    constructor(amateras) {
        _MusicManager_amateras.set(this, void 0);
        _MusicManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, _MusicManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _MusicManager_collection, amateras.db.collection('music'), "f");
        this.cache = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * @returns 404 - Music fetch failed
     */
    fetch(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const get = this.cache.get(id);
            if (get)
                return get;
            const data = yield __classPrivateFieldGet(this, _MusicManager_collection, "f").findOne({ id: id });
            if (data) {
                const music = new Music_1.Music(data, __classPrivateFieldGet(this, _MusicManager_amateras, "f"));
                this.cache.set(id, music);
                yield music.init();
                return music;
            }
            else {
                return 404;
            }
        });
    }
    /**
     * @returns 101 - Already in database
     * @returns 102 - Not a valid url
     */
    create(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = ytdl_core_1.default.getVideoID(url);
            if (!id)
                return 102;
            const musicData = {
                url: url,
                id: id,
                plays: 0,
                players: 0
            };
            if (yield __classPrivateFieldGet(this, _MusicManager_collection, "f").findOne({ id: musicData.id }))
                return 101;
            const music = new Music_1.Music(musicData, __classPrivateFieldGet(this, _MusicManager_amateras, "f"));
            this.cache.set(musicData.id, music);
            yield music.init();
            return music;
        });
    }
    /**
     * @returns 101 - Already in database
     * @returns 102 - Not a vaild url
     */
    add(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = ytdl_core_1.default.getVideoID(url);
            if (!id)
                return 102;
            const fetch = yield this.fetch(id);
            if (fetch instanceof Music_1.Music)
                return fetch;
            const create = yield this.create(url);
            return create;
        });
    }
}
exports.MusicManager = MusicManager;
_MusicManager_amateras = new WeakMap(), _MusicManager_collection = new WeakMap();
//# sourceMappingURL=MusicManager.js.map