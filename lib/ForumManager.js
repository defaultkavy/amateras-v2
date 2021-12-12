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
var _ForumManager_amateras, _ForumManager_collection, _ForumManager_forums, _ForumManager__guild;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumManager = void 0;
const Forum_1 = require("./Forum");
const terminal_1 = require("./terminal");
class ForumManager {
    constructor(data, _guild, amateras) {
        _ForumManager_amateras.set(this, void 0);
        _ForumManager_collection.set(this, void 0);
        _ForumManager_forums.set(this, void 0);
        _ForumManager__guild.set(this, void 0);
        __classPrivateFieldSet(this, _ForumManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _ForumManager_collection, amateras.db.collection('forums'), "f");
        __classPrivateFieldSet(this, _ForumManager__guild, _guild, "f");
        __classPrivateFieldSet(this, _ForumManager_forums, data ? data.list : undefined, "f");
        this.cache = new Map();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _ForumManager_forums, "f") && __classPrivateFieldGet(this, _ForumManager_forums, "f").length > 0) {
                for (const forumId of __classPrivateFieldGet(this, _ForumManager_forums, "f")) {
                    const forumData = yield __classPrivateFieldGet(this, _ForumManager_collection, "f").findOne({ id: forumId });
                    if (forumData) {
                        const forum = new Forum_1.Forum(forumData, __classPrivateFieldGet(this, _ForumManager__guild, "f"), this, __classPrivateFieldGet(this, _ForumManager_amateras, "f"));
                        this.cache.set(forumId, forum);
                        yield forum.init();
                    }
                }
            }
        });
    }
    fetch(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield ((_a = __classPrivateFieldGet(this, _ForumManager_collection, "f")) === null || _a === void 0 ? void 0 : _a.findOne({ id: id }));
            if (!data) {
                return 404; // Forum not found
            }
            else {
                const forum = new Forum_1.Forum(data, __classPrivateFieldGet(this, _ForumManager__guild, "f"), this, __classPrivateFieldGet(this, _ForumManager_amateras, "f"));
                this.cache.set(id, forum);
                yield forum.init();
                return forum;
            }
        });
    }
    create(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cache.has(channel.id))
                return 101; // Forum exist already
            const forum = new Forum_1.Forum({ id: channel.id, state: "OPEN" }, __classPrivateFieldGet(this, _ForumManager__guild, "f"), this, __classPrivateFieldGet(this, _ForumManager_amateras, "f"));
            this.cache.set(channel.id, forum);
            yield forum.init();
            channel.setRateLimitPerUser(300);
            yield forum.save();
            yield __classPrivateFieldGet(this, _ForumManager__guild, "f").save();
            return forum;
        });
    }
    toData() {
        const data = (0, terminal_1.cloneObj)(this, ['cache']);
        data.list = Array.from(this.cache.keys());
        return data;
    }
}
exports.ForumManager = ForumManager;
_ForumManager_amateras = new WeakMap(), _ForumManager_collection = new WeakMap(), _ForumManager_forums = new WeakMap(), _ForumManager__guild = new WeakMap();
//# sourceMappingURL=ForumManager.js.map