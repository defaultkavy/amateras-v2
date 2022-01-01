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
var _PlayerMusic_amateras, _PlayerMusic_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerMusic = void 0;
const terminal_1 = require("./terminal");
class PlayerMusic {
    constructor(data, music, amateras) {
        _PlayerMusic_amateras.set(this, void 0);
        _PlayerMusic_collection.set(this, void 0);
        __classPrivateFieldSet(this, _PlayerMusic_amateras, amateras, "f");
        __classPrivateFieldSet(this, _PlayerMusic_collection, amateras.db.collection('player_music'), "f");
        this.id = data.id;
        this.player = data.player;
        this.music = music;
        this.counts = data.counts;
        this.like = data.like ? data.like : false;
        this.dislike = data.dislike ? data.dislike : false;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this, ['music']);
            data.player = this.player.id;
            const find = yield __classPrivateFieldGet(this, _PlayerMusic_collection, "f").findOne({ id: this.id, player: this.player.id });
            if (find) {
                yield __classPrivateFieldGet(this, _PlayerMusic_collection, "f").replaceOne({ id: this.id, player: this.player.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, _PlayerMusic_collection, "f").insertOne(data);
            }
        });
    }
    record() {
        return __awaiter(this, void 0, void 0, function* () {
            this.counts += 1;
            yield this.save();
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Already exist in music likes
     */
    setLike() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dislike = false;
            this.like = true;
            yield this.music.removeDislike(this.player.id);
            if ((yield this.music.addLike(this.player.id)) === 101)
                return 101;
            yield this.save();
            return 100;
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - No exist in music likes
     */
    unsetLike() {
        return __awaiter(this, void 0, void 0, function* () {
            this.like = false;
            if ((yield this.music.removeLike(this.player.id)) === 101)
                return 101;
            yield this.save();
            return 100;
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - Already exist in music likes
     */
    setDislike() {
        return __awaiter(this, void 0, void 0, function* () {
            this.like = false;
            this.dislike = true;
            yield this.music.removeLike(this.player.id);
            if ((yield this.music.addDislike(this.player.id)) === 101)
                return 101;
            yield this.save();
            return 100;
        });
    }
    /**
     * @returns 100 - Success
     * @returns 101 - No exist in music likes
     */
    unsetDislike() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dislike = false;
            if ((yield this.music.removeDislike(this.player.id)) === 101)
                return 101;
            yield this.save();
            return 100;
        });
    }
}
exports.PlayerMusic = PlayerMusic;
_PlayerMusic_amateras = new WeakMap(), _PlayerMusic_collection = new WeakMap();
//# sourceMappingURL=PlayerMusic.js.map