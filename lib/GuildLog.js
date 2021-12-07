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
var _GuildLog_amateras, _GuildLog_channelId, _GuildLog__guild, _GuildLog_messageId;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildLog = void 0;
const terminal_1 = require("./terminal");
class GuildLog {
    constructor(data, _guild, amateras) {
        _GuildLog_amateras.set(this, void 0);
        _GuildLog_channelId.set(this, void 0);
        _GuildLog__guild.set(this, void 0);
        _GuildLog_messageId.set(this, void 0);
        __classPrivateFieldSet(this, _GuildLog_amateras, amateras, "f");
        __classPrivateFieldSet(this, _GuildLog_channelId, data ? data.channel : undefined, "f");
        __classPrivateFieldSet(this, _GuildLog__guild, _guild, "f");
        this.channel = {};
        __classPrivateFieldSet(this, _GuildLog_messageId, data ? data.message : undefined, "f");
        this.message = undefined;
        this.messageCount = data ? data.messageCount ? data.messageCount : 1 : 1;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchChannel();
            yield this.fetchMessage();
        });
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __classPrivateFieldGet(this, _GuildLog__guild, "f").get.channels.create('消息频道', {
                type: 'GUILD_TEXT',
                permissionOverwrites: [{
                        id: __classPrivateFieldGet(this, _GuildLog__guild, "f").get.roles.everyone,
                        deny: 'SEND_MESSAGES'
                    }]
            });
        });
    }
    send(content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchChannel();
            const fetch = yield this.fetchMessage();
            if (fetch === 101 || fetch === 404) {
                yield this.newMessage();
            }
            const date = new Date;
            const time = `# ${date.toLocaleString('en-ZA')}\n`;
            const prevContent = this.message.content.slice(3, this.message.content.length - 3);
            let resultContent = '```' + prevContent + `\n` + time + content + `\`\`\``;
            //Check message word count
            if (resultContent.length > 2000) {
                this.messageCount += 1;
                yield this.newMessage();
                resultContent = '```' + time + this.message.content.slice(3, this.message.content.length - 3) + `\n` + time + content + `\`\`\``;
            }
            this.message.edit({
                content: resultContent
            });
        });
    }
    name(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield __classPrivateFieldGet(this, _GuildLog_amateras, "f").client.users.fetch(id);
            return `${user.username}(${user.id})`;
        });
    }
    newMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const format = 'py\n';
            this.message = yield this.channel.send({
                content: `\`\`\`${format}${this.messageCount}\`\`\``
            });
            __classPrivateFieldSet(this, _GuildLog_messageId, this.message.id, "f");
            __classPrivateFieldGet(this, _GuildLog__guild, "f").save();
        });
    }
    fetchMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _GuildLog_messageId, "f")) {
                try {
                    const message = yield this.channel.messages.fetch(__classPrivateFieldGet(this, _GuildLog_messageId, "f"));
                    this.message = message;
                    __classPrivateFieldSet(this, _GuildLog_messageId, message.id, "f");
                    return message;
                }
                catch (_a) {
                    return 404;
                }
            }
            else
                return 101;
        });
    }
    fetchChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _GuildLog_channelId, "f")) {
                try {
                    const channel = yield __classPrivateFieldGet(this, _GuildLog__guild, "f").get.channels.fetch(__classPrivateFieldGet(this, _GuildLog_channelId, "f"));
                    if (channel && channel.type === 'GUILD_TEXT') {
                        this.channel = channel;
                    }
                    else
                        yield this.channelCreate();
                }
                catch (_a) {
                    yield this.channelCreate();
                }
            }
            else
                yield this.channelCreate();
        });
    }
    channelCreate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.channel = yield this.create();
            __classPrivateFieldSet(this, _GuildLog_channelId, this.channel.id, "f");
        });
    }
    toData() {
        let data = (0, terminal_1.cloneObj)(this);
        data.channel = this.channel.id;
        data.message = this.message ? this.message.id : undefined;
        return data;
    }
}
exports.GuildLog = GuildLog;
_GuildLog_amateras = new WeakMap(), _GuildLog_channelId = new WeakMap(), _GuildLog__guild = new WeakMap(), _GuildLog_messageId = new WeakMap();
//# sourceMappingURL=GuildLog.js.map