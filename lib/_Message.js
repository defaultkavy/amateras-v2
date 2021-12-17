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
var __Message_amateras, __Message_collection, __Message_guild, __Message_channel;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Message = void 0;
const Err_1 = require("./Err");
const terminal_1 = require("./terminal");
class _Message {
    constructor(msg, amateras) {
        var _a;
        __Message_amateras.set(this, void 0);
        __Message_collection.set(this, void 0);
        __Message_guild.set(this, void 0);
        __Message_channel.set(this, void 0);
        __classPrivateFieldSet(this, __Message_amateras, amateras, "f");
        __classPrivateFieldSet(this, __Message_collection, (_a = amateras.db) === null || _a === void 0 ? void 0 : _a.collection('messages'), "f");
        this.id = msg.id;
        __classPrivateFieldSet(this, __Message_guild, msg.guild, "f");
        this.guild = {};
        __classPrivateFieldSet(this, __Message_channel, msg.channel, "f");
        this.channel = {};
        this.actions = msg.actions;
        this.get = {};
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const _guild = __classPrivateFieldGet(this, __Message_amateras, "f").guilds.cache.get(__classPrivateFieldGet(this, __Message_guild, "f"));
            if (!_guild) {
                return false;
            }
            this.guild = _guild.get;
            this.channel = (yield this.guild.channels.fetch(__classPrivateFieldGet(this, __Message_channel, "f")));
            if (this.channel && this.channel.type === 'GUILD_TEXT') {
                this.get = yield this.channel.messages.fetch(this.id);
            }
            return true;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this, ['get']);
            data.guild = __classPrivateFieldGet(this, __Message_guild, "f");
            data.channel = __classPrivateFieldGet(this, __Message_channel, "f");
            // Check collection 'missions' exist
            if (!__classPrivateFieldGet(this, __Message_collection, "f")) {
                console.error(`Collection "messages" undefined.(Msg.js)`);
                return { status: { success: false, message: 'Save Message failed.' }, msg: this };
            }
            // Find mission from database
            const find = yield __classPrivateFieldGet(this, __Message_collection, "f").findOne({ id: this.id });
            // Check if mission found
            if (find) {
                yield __classPrivateFieldGet(this, __Message_collection, "f").replaceOne({ id: this.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, __Message_collection, "f").insertOne(data);
            }
            return { status: { success: true, message: 'Message saved.' }, msg: this };
        });
    }
    updateVInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield __classPrivateFieldGet(this, __Message_amateras, "f").players.fetch(this.get.embeds[0].footer.text);
            if (player === 404)
                return;
            const defaultFolder = player.v.imageFolders.default;
            if (defaultFolder)
                this.get.edit({ embeds: [] });
        });
    }
    /**
     *
     * @returns 100 - Success
     * @returns 101 - Message delete failed
     */
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const message = this.get.fetch();
                if (!message)
                    return 102;
                yield this.get.delete();
                return 100;
            }
            catch (_a) {
                new Err_1.Err(`Message delete failed. (Message)${this.id}`);
                return 101;
            }
        });
    }
}
exports._Message = _Message;
__Message_amateras = new WeakMap(), __Message_collection = new WeakMap(), __Message_guild = new WeakMap(), __Message_channel = new WeakMap();
//# sourceMappingURL=_Message.js.map