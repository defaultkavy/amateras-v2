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
var _GuildLog_amateras, _GuildLog_collection, _GuildLog__guild, _GuildLog_data;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildLog = void 0;
const terminal_1 = require("./terminal");
const lang_json_1 = require("../lang.json");
class GuildLog {
    constructor(data, _guild, amateras) {
        _GuildLog_amateras.set(this, void 0);
        _GuildLog_collection.set(this, void 0);
        _GuildLog__guild.set(this, void 0);
        _GuildLog_data.set(this, void 0);
        __classPrivateFieldSet(this, _GuildLog_amateras, amateras, "f");
        __classPrivateFieldSet(this, _GuildLog_collection, amateras.db.collection('guilds'), "f");
        __classPrivateFieldSet(this, _GuildLog__guild, _guild, "f");
        __classPrivateFieldSet(this, _GuildLog_data, data, "f");
        this.messageCount = data ? data.messageCount ? data.messageCount : 0 : 0;
        this.lastLog = data ? data.lastLog : '';
        this.isValid = () => { return !!this.channel && !!this.message && !!this.thread; };
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield __classPrivateFieldGet(this, _GuildLog_collection, "f").findOne({ id: __classPrivateFieldGet(this, _GuildLog__guild, "f").id });
            if (data)
                __classPrivateFieldSet(this, _GuildLog_data, data.log, "f");
            this.channel = yield this.fetchChannel();
            this.message = yield this.fetchMessage();
            this.message = yield this.initMessage();
            this.thread = yield this.fetchThread();
            this.logMessage = yield this.fetchLog();
            yield __classPrivateFieldGet(this, _GuildLog__guild, "f").save();
        });
    }
    initMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.channel)
                return undefined;
            if (!this.message)
                return this.channel.send({ embeds: [yield embed.call(this)] }).catch();
            else
                return this.message.edit({ embeds: [yield embed.call(this)] }).catch();
            function embed() {
                return __awaiter(this, void 0, void 0, function* () {
                    const member = yield __classPrivateFieldGet(this, _GuildLog__guild, "f").get.members.fetch(__classPrivateFieldGet(this, _GuildLog_amateras, "f").id).catch(() => undefined);
                    const lang = __classPrivateFieldGet(this, _GuildLog__guild, "f").lang;
                    const embed = {
                        title: __classPrivateFieldGet(this, _GuildLog_amateras, "f").ready ? lang_json_1._system_.sleeping[lang] : lang_json_1._system_.sleeping[lang],
                        description: lang_json_1._log_init_.description[lang],
                        color: __classPrivateFieldGet(this, _GuildLog_amateras, "f").ready ? 'GREEN' : 'GREY',
                        fields: [
                            {
                                name: lang_json_1._log_init_.join_date[lang],
                                value: member ? member.joinedTimestamp ? (0, terminal_1.timestampDate)(member.joinedTimestamp) : '-' : '-',
                                inline: true
                            },
                            {
                                name: lang_json_1._log_init_.start_time[lang],
                                value: `${(0, terminal_1.timestampDate)(__classPrivateFieldGet(this, _GuildLog_amateras, "f").system.uptime)}`,
                                inline: true
                            },
                            {
                                name: lang_json_1._log_init_.logs[lang],
                                value: `\`\`\`py\n${this.lastLog ? this.lastLog : '-'}\`\`\``
                            }
                        ]
                    };
                    return embed;
                });
            }
        });
    }
    fetchMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = __classPrivateFieldGet(this, _GuildLog_data, "f") ? __classPrivateFieldGet(this, _GuildLog_data, "f").message : undefined;
            const messageFetch = () => __awaiter(this, void 0, void 0, function* () { return data ? this.channel ? yield this.channel.messages.fetch(data).catch(() => undefined) : undefined : undefined; });
            return data ? yield messageFetch() : undefined;
        });
    }
    fetchChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = __classPrivateFieldGet(this, _GuildLog_data, "f") ? __classPrivateFieldGet(this, _GuildLog_data, "f").channel : undefined;
            const createChannel = () => __awaiter(this, void 0, void 0, function* () {
                return __classPrivateFieldGet(this, _GuildLog__guild, "f").get.channels.create('消息频道', {
                    type: 'GUILD_TEXT',
                    permissionOverwrites: [{
                            id: __classPrivateFieldGet(this, _GuildLog__guild, "f").get.roles.everyone,
                            deny: 'SEND_MESSAGES'
                        }]
                }).catch(() => undefined);
            });
            const channelFetch = () => data ? __classPrivateFieldGet(this, _GuildLog__guild, "f").get.channels.fetch(data).catch(() => createChannel()) : undefined;
            const channel = yield channelFetch();
            const checkText = () => channel ? channel.isText() ? channel : createChannel() : createChannel();
            return data ? checkText() : createChannel();
        });
    }
    fetchThread() {
        return __awaiter(this, void 0, void 0, function* () {
            const thread = this.message ? this.message.thread : undefined;
            const unsetArchived = () => { return thread ? thread.archived ? thread.edit({ archived: false }).catch(() => { return undefined; }) : thread : undefined; };
            const startThread = () => { return this.message ? this.message.startThread({ name: '消息记录', autoArchiveDuration: 'MAX' }).catch(() => { return undefined; }) : undefined; };
            return thread ? unsetArchived() : startThread();
        });
    }
    fetchLog() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = __classPrivateFieldGet(this, _GuildLog_data, "f") ? __classPrivateFieldGet(this, _GuildLog_data, "f").logMessage : undefined;
            const messageFetch = () => __awaiter(this, void 0, void 0, function* () { return data && this.thread ? yield this.thread.messages.fetch(data).catch(() => this.newMessage()) : undefined; });
            const messageCheck = () => __awaiter(this, void 0, void 0, function* () { return this.logMessage ? yield this.logMessage.fetch().catch(() => this.newMessage()) : yield messageFetch(); });
            return this.thread ? yield messageCheck() : undefined;
        });
    }
    /**
     * @returns 101 - Message fetch failed
     */
    send(content, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date;
            const time = `# ${date.toLocaleString('en-ZA')}\n`;
            this.lastLog = (type === 'MOD' ? '@MOD ' : type === 'SYS' ? '@SYS ' : '') + time + content;
            yield this.init();
            if (!this.isValid())
                return 101;
            if (!this.logMessage)
                return 101;
            const embed = this.logMessage.embeds[0];
            const field = embed.fields[embed.fields.length - 1];
            const prevContent = field.value.slice(3, this.logMessage.content.length - 3);
            let resultContent = '```' + prevContent + `\n` + (type === 'MOD' ? '@MOD ' : type === 'SYS' ? '@SYS ' : '') + time + content + `\`\`\``;
            //Check message word count
            const newMessage = () => __awaiter(this, void 0, void 0, function* () {
                this.logMessage = yield this.newMessage();
                if (!this.logMessage)
                    return;
                resultContent = '```' + `py\n` + (type === 'MOD' ? '@MOD ' : type === 'SYS' ? '@SYS ' : '') + time + content + `\`\`\``;
            });
            if (resultContent.length > 1000) {
                if (embed.fields.length >= 6) {
                    yield newMessage();
                }
                else {
                    this.messageCount += 1;
                    resultContent = '```' + `py\n` + (type === 'MOD' ? '@MOD ' : type === 'SYS' ? '@SYS ' : '') + time + content + `\`\`\``;
                    embed.addField(`${this.messageCount}`, resultContent);
                }
            }
            else {
                if (embed.fields.length >= 6) {
                    yield newMessage();
                }
                else
                    field.value = resultContent;
            }
            return yield this.logMessage.edit({ embeds: [embed] });
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
            if (!this.isValid())
                return;
            this.messageCount += 1;
            const format = 'py\n';
            const embed = {
                color: 'DARK_BUT_NOT_BLACK',
                fields: [
                    {
                        name: `${this.messageCount}`,
                        value: `\`\`\`${format}${this.lastLog ? this.lastLog : '-'}\`\`\``
                    }
                ]
            };
            return yield this.thread.send({ embeds: [embed] }).catch(() => undefined);
        });
    }
    toData() {
        let data = (0, terminal_1.cloneObj)(this, ['thread']);
        data.channel = this.channel ? this.channel.id : undefined;
        data.message = this.message ? this.message.id : undefined;
        data.logMessage = this.logMessage ? this.logMessage.id : undefined;
        return data;
    }
}
exports.GuildLog = GuildLog;
_GuildLog_amateras = new WeakMap(), _GuildLog_collection = new WeakMap(), _GuildLog__guild = new WeakMap(), _GuildLog_data = new WeakMap();
//# sourceMappingURL=GuildLog.js.map