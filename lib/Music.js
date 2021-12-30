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
var _Music_amateras, _Music_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Music = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const terminal_1 = require("./terminal");
class Music {
    constructor(data, amateras) {
        _Music_amateras.set(this, void 0);
        _Music_collection.set(this, void 0);
        __classPrivateFieldSet(this, _Music_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Music_collection, amateras.db.collection('music'), "f");
        this.id = data.id;
        this.url = data.url;
        this.plays = data.plays ? data.plays : 0;
        this.players = data.players ? data.players : 0;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.update();
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this);
            const find = yield __classPrivateFieldGet(this, _Music_collection, "f").findOne({ id: this.id });
            if (find) {
                yield __classPrivateFieldGet(this, _Music_collection, "f").replaceOne({ id: this.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, _Music_collection, "f").insertOne(data);
            }
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield ytdl_core_1.default.getBasicInfo(this.id);
            if (!info)
                return;
            const details = info.videoDetails;
            this.title = details.title;
            this.url = details.video_url;
            this.thumbnail = details.thumbnails[details.thumbnails.length - 1];
            this.author = {
                name: details.author.name,
                avatar: details.author.thumbnails ? details.author.thumbnails[0].url : details.author.avatar,
                url: details.author.channel_url
            };
            const collection = __classPrivateFieldGet(this, _Music_amateras, "f").db.collection('player_music');
            const cursor = collection.find({ id: this.id });
            const arr = yield cursor.toArray();
            this.players = arr.length;
            yield this.save();
        });
    }
    record() {
        return __awaiter(this, void 0, void 0, function* () {
            this.plays += 1;
            yield this.save();
        });
    }
}
exports.Music = Music;
_Music_amateras = new WeakMap(), _Music_collection = new WeakMap();
//# sourceMappingURL=Music.js.map