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
var __Channel_amateras, __Channel_collection, __Channel_channel;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Channel = void 0;
const terminal_1 = require("./terminal");
class _Channel {
    constructor(data, type, _guild, guild, amateras) {
        __Channel_amateras.set(this, void 0);
        __Channel_collection.set(this, void 0);
        __Channel_channel.set(this, void 0);
        __classPrivateFieldSet(this, __Channel_amateras, amateras, "f");
        __classPrivateFieldSet(this, __Channel_collection, amateras.db.collection('guilds'), "f");
        __classPrivateFieldSet(this, __Channel_channel, data, "f");
        this._guild = _guild;
        this.guild = guild;
        this.id = data.id;
        this.channel = {};
        this.type = type;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let channel;
            try {
                channel = (yield __classPrivateFieldGet(this, __Channel_amateras, "f").client.channels.fetch(this.id));
            }
            catch (err) {
                console.error('Channel fetch from discord failed - User may delete the channel.');
                return false;
            }
            __classPrivateFieldGet(this, __Channel_channel, "f").id = channel.id;
            this.channel = channel;
            return true;
        });
    }
    // async save() {
    //     const data = cloneObj(this, ['type', 'channel'])
    //     const guild = await this.#collection.findOne({ id: this.#guild.id })
    //     console.debug(guild)
    //     if (guild) {
    //         if (!guild.channels) {
    //             guild.channels = {
    //                 [this.type]: data
    //             }
    //         } else {
    //             guild.channels[this.type] = data
    //         }
    //         console.log(guild)
    //         await this.#collection.replaceOne({ id: this.#guild.id }, guild)
    //     } else {
    //         const _guild = this.#amateras.guilds.cache.get(this.#guild.id)
    //         if (!_guild) {
    //             console.error('Missing Guild Object!')
    //             return
    //         }
    //         await _guild.save()
    //     }
    // }
    get data() {
        return (0, terminal_1.cloneObj)(this, ['type', 'channel', 'guild', '_guild']);
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._guild.save();
        });
    }
}
exports._Channel = _Channel;
__Channel_amateras = new WeakMap(), __Channel_collection = new WeakMap(), __Channel_channel = new WeakMap();
//# sourceMappingURL=_Channel.js.map