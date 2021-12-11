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
var _Forum_amateras, _Forum_collection, _Forum__guild, _Forum_manager;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forum = void 0;
const terminal_1 = require("./terminal");
class Forum {
    constructor(data, _guild, manager, amateras) {
        _Forum_amateras.set(this, void 0);
        _Forum_collection.set(this, void 0);
        _Forum__guild.set(this, void 0);
        _Forum_manager.set(this, void 0);
        __classPrivateFieldSet(this, _Forum_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Forum_collection, amateras.db.collection('forums'), "f");
        __classPrivateFieldSet(this, _Forum__guild, _guild, "f");
        __classPrivateFieldSet(this, _Forum_manager, manager, "f");
        this.id = data.id;
        this.get = {};
        this.state = data.state;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.get = (yield __classPrivateFieldGet(this, _Forum__guild, "f").get.channels.fetch(this.id));
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = (0, terminal_1.cloneObj)(this, ['get']);
            // Check collection exist
            if (!__classPrivateFieldGet(this, _Forum_collection, "f")) {
                console.error(`Collection is ${__classPrivateFieldGet(this, _Forum_collection, "f")}`);
                return 101;
            }
            // Find from database
            const find = yield __classPrivateFieldGet(this, _Forum_collection, "f").findOne({ id: this.id });
            // Check if found
            if (find) {
                yield __classPrivateFieldGet(this, _Forum_collection, "f").replaceOne({ id: this.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, _Forum_collection, "f").insertOne(data);
            }
            return data;
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = "CLOSED";
            this.get.setRateLimitPerUser(0);
            yield this.save();
            __classPrivateFieldGet(this, _Forum_manager, "f").cache.delete(this.id);
        });
    }
    share(message) {
        return `Author: ${message.author} From: ${this.get} ${message.thread}\n\n${message.content}`;
    }
}
exports.Forum = Forum;
_Forum_amateras = new WeakMap(), _Forum_collection = new WeakMap(), _Forum__guild = new WeakMap(), _Forum_manager = new WeakMap();
//# sourceMappingURL=Forum.js.map