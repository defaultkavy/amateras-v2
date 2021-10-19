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
var _Mission_amateras, _Mission_collection, _Mission_owner, _Mission_agents, _Mission_message, _Mission_thread, _Mission_infoMessage;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mission = void 0;
const discord_js_1 = require("discord.js");
const terminal_1 = require("./terminal");
class Mission {
    constructor(mission, amateras) {
        var _a;
        _Mission_amateras.set(this, void 0);
        _Mission_collection.set(this, void 0);
        _Mission_owner.set(this, void 0);
        _Mission_agents.set(this, void 0);
        _Mission_message.set(this, void 0);
        _Mission_thread.set(this, void 0);
        _Mission_infoMessage.set(this, void 0);
        __classPrivateFieldSet(this, _Mission_amateras, amateras, "f");
        __classPrivateFieldSet(this, _Mission_collection, (_a = amateras.db) === null || _a === void 0 ? void 0 : _a.collection('missions'), "f");
        this.id = mission.id;
        this.title = mission.title;
        this.description = mission.description;
        this.reward = mission.reward;
        this.persons = mission.persons;
        this.expire = new Date(mission.expire);
        this.enable = mission.enable;
        __classPrivateFieldSet(this, _Mission_owner, mission.owner, "f");
        this.owner = {};
        this.pay = mission.pay;
        __classPrivateFieldSet(this, _Mission_agents, mission.agents, "f");
        this.agents = [];
        __classPrivateFieldSet(this, _Mission_message, mission.message, "f");
        this.message = {};
        __classPrivateFieldSet(this, _Mission_thread, mission.thread, "f");
        this.thread = undefined;
        __classPrivateFieldSet(this, _Mission_infoMessage, mission.infoMessage, "f");
        this.infoMessage = undefined;
        this.status = mission.status;
    }
    init() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const owner = yield ((_a = __classPrivateFieldGet(this, _Mission_amateras, "f").players) === null || _a === void 0 ? void 0 : _a.fetch(__classPrivateFieldGet(this, _Mission_owner, "f")));
            if (!owner) {
                console.error(`Mission Owner "${__classPrivateFieldGet(this, _Mission_owner, "f")}" fetch failed.`);
                return;
            }
            this.owner = owner;
            let agents = [];
            for (const agent of __classPrivateFieldGet(this, _Mission_agents, "f")) {
                if (agent) {
                    const player = yield __classPrivateFieldGet(this, _Mission_amateras, "f").players.fetch(agent);
                    if (!player) {
                        console.error(`Player "${agent}" fetch failed.`);
                        return;
                    }
                    agents.push(player);
                }
                else {
                    console.error(`Mission agents "${agent}" fetch failed.`);
                }
            }
            this.agents = agents;
            const fetch = yield __classPrivateFieldGet(this, _Mission_amateras, "f").messages.fetch(__classPrivateFieldGet(this, _Mission_message, "f"));
            const message = fetch ? fetch.get : undefined;
            if (!message)
                return;
            this.message = message;
        });
    }
    setMessage(message) {
        this.message = message;
        __classPrivateFieldSet(this, _Mission_message, message.id, "f");
    }
    static createId(amateras) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!amateras.db) {
                console.error(`Database undefined.`);
                return undefined;
            }
            let found = false;
            let newId = '';
            const collection = amateras.db.collection('missions');
            while (!found) {
                newId = '0x' + (0, terminal_1.idGenerator)(20);
                const result = yield collection.findOne({ id: newId });
                result ? found = false : found = true;
            }
            return newId;
        });
    }
    static checkPublish(player, mission) {
        const balance = player.wallets[0].balance;
        if (balance < (mission.pay * mission.persons)) {
            return { pass: false, note: `你的资产余额不足。余额：${balance}G，发布需求：${mission.pay * mission.persons}G` };
        }
        else if (!mission.pay || mission.pay <= 0) {
            return { pass: false, note: '委托报酬金错误：请输入有效数字' };
        }
        else if (!mission.expire || mission.expire <= 0) {
            return { pass: false, note: '委托期限错误：期限必须大过且不等于0' };
        }
        else if (!mission.persons || mission.persons <= 0) {
            return { pass: false, note: '委托接取人数错误：人数必须大过且不等于0' };
        }
        else if (!mission.expire || mission.expire <= 0) {
            return { pass: false, note: '委托期限必须大于或等于1天' };
        }
        else if (player.missions.requested.active.cache.size >= 5) {
            return { pass: false, note: '你不能再发布更多的委托了，请先结算或取消你当前正在进行的委托。' };
        }
        else {
            return { pass: true, note: '' };
        }
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (0, terminal_1.cloneObj)(this);
            data.owner = __classPrivateFieldGet(this, _Mission_owner, "f");
            data.agents = __classPrivateFieldGet(this, _Mission_agents, "f");
            data.message = __classPrivateFieldGet(this, _Mission_message, "f");
            data.thread = __classPrivateFieldGet(this, _Mission_thread, "f");
            data.infoMessage = __classPrivateFieldGet(this, _Mission_infoMessage, "f");
            // Check collection 'missions' exist
            if (!__classPrivateFieldGet(this, _Mission_collection, "f")) {
                console.error(`Collection "missions" undefined.(Mission.js)`);
                return { status: { success: false, message: 'Save mission failed.' }, mission: this };
            }
            // Find mission from database
            const find = yield __classPrivateFieldGet(this, _Mission_collection, "f").findOne({ id: this.id });
            // Check if mission found
            if (find) {
                yield __classPrivateFieldGet(this, _Mission_collection, "f").replaceOne({ id: this.id }, data);
            }
            else {
                yield __classPrivateFieldGet(this, _Mission_collection, "f").insertOne(data);
            }
            return { status: { success: true, message: 'Mission saved.' }, mission: this };
        });
    }
    sendMission(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const embed = {
                title: this.title,
                description: this.description,
                color: '#5050FF',
                fields: [
                    {
                        name: '报酬金',
                        value: `${this.pay}G`,
                        inline: true
                    },
                    {
                        name: '接取人数',
                        value: `${this.agents.length}/${this.persons}`,
                        inline: true
                    },
                    {
                        name: '期限',
                        value: `${String(this.expire.getFullYear())}年${String(this.expire.getMonth() + 1)}月${String(this.expire.getDate()).padStart(2, '0')}日`
                    },
                    {
                        name: '状态',
                        value: `${this.enable ? '进行中' : '已结算'}`,
                        inline: true
                    }
                ],
                author: {
                    iconURL: interaction.user.displayAvatarURL({ size: 128 }),
                    name: `${(yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(interaction.user.id))).displayName}的委托`
                },
                footer: {
                    text: this.id
                }
            };
            const actionRow = new discord_js_1.MessageActionRow();
            const accept_button = new discord_js_1.MessageButton();
            accept_button.customId = '#mission_accept';
            accept_button.style = 'PRIMARY';
            accept_button.label = '接受';
            const info_button = new discord_js_1.MessageButton();
            info_button.customId = '#mission_info';
            info_button.style = 'SECONDARY';
            info_button.label = '详细';
            actionRow.addComponents(accept_button);
            actionRow.addComponents(info_button);
            yield interaction.reply({
                embeds: [embed],
                ephemeral: false,
                components: [actionRow]
            });
            const msg = yield __classPrivateFieldGet(this, _Mission_amateras, "f").messages.create(yield interaction.fetchReply(), {
                mission_accept: 'mission_accept',
                mission_info: 'mission_info'
            });
            this.setMessage(msg.get);
            yield this.save();
        });
    }
    complete() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const ownerMember = yield ((_a = this.message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(this.owner.id));
            if (!ownerMember) {
                console.error("Guild Member fetch failed: Mission owner (Mission.js)");
                return;
            }
            this.owner.missions.requested.active.remove(this);
            this.owner.missions.requested.achieve.add(this);
            this.status = 'COMPLETED';
            this.save();
            for (const agent of this.agents) {
                agent.missions.accepted.active.remove(this);
                agent.missions.accepted.achieve.add(this);
                yield __classPrivateFieldGet(this, _Mission_amateras, "f").me.wallets[0].transfer(agent.wallets[0].id, this.pay, `Mission payment.`, true);
                console.log(agent.id);
                const user = yield __classPrivateFieldGet(this, _Mission_amateras, "f").client.users.fetch(agent.id);
                user.send(`**通知**\n你完成了 ${ownerMember === null || ownerMember === void 0 ? void 0 : ownerMember.displayName} 的委托，得到了${this.pay}G的报酬金。`)
                    .catch(() => __awaiter(this, void 0, void 0, function* () {
                }));
            }
            this.missionMessageUpdate('COMPLETED');
        });
    }
    cancel() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const guild = this.message.guild;
            if (!guild) {
                console.error('guild = ' + guild);
                return;
            }
            const ownerMember = guild.members.cache.get(this.owner.id);
            if (!ownerMember) {
                console.error("Guild Member fetch failed: Mission owner (Mission.js)");
                return;
            }
            this.owner.missions.requested.active.remove(this);
            this.owner.missions.requested.achieve.add(this);
            this.status = 'CANCELED';
            this.save();
            (_a = __classPrivateFieldGet(this, _Mission_amateras, "f").me) === null || _a === void 0 ? void 0 : _a.wallets[0].transfer(this.owner.wallets[0].id, this.pay, 'Mission Cancel Refund.', false);
            const owner = yield __classPrivateFieldGet(this, _Mission_amateras, "f").client.users.fetch(this.owner.id);
            owner.send(`**通知**\n你取消了委托，${this.pay}G已退回到你的户口。`);
            for (const agent of this.agents) {
                agent.missions.accepted.active.remove(this);
                agent.missions.accepted.achieve.add(this);
                const user = yield __classPrivateFieldGet(this, _Mission_amateras, "f").client.users.fetch(agent.id);
                user.send(`**通知**\n${ownerMember === null || ownerMember === void 0 ? void 0 : ownerMember.displayName} 取消了委托。`);
            }
            this.missionMessageUpdate('CANCELED');
        });
    }
    quit(player) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.removeAgent(player);
            this.missionMessageUpdate(this.status);
        });
    }
    missionMessageUpdate(type) {
        // Mission message edit
        const embed = this.message.embeds[0];
        embed.color = type === 'COMPLETED' ? '#50FF50' : type === 'CANCELED' ? '#FF5050' : type === 'EXPIRED' ? '#505050' : '#5050FF';
        embed.fields[1].value = `${this.agents.length}/${this.persons}`;
        embed.fields[3].value = type === 'COMPLETED' ? '已结算' : type === 'CANCELED' ? '已取消' : type === 'EXPIRED' ? '已过期' : '进行中';
        const comp = this.message.components;
        const button = comp[0].components[0];
        button.disabled = type === 'COMPLETED' ? true : type === 'CANCELED' ? true : type === 'EXPIRED' ? true : false;
        if (__classPrivateFieldGet(this, _Mission_agents, "f").length >= this.persons && type === 'EXECUTE') {
            button.disabled = true;
            embed.color = "#50FFFF";
        }
        this.message.edit({ embeds: [embed], components: comp });
        if (type === 'EXECUTE')
            this.updateThread();
    }
    expired() {
        return __awaiter(this, void 0, void 0, function* () {
            this.status = 'EXPIRED';
            yield this.save();
        });
    }
    addAgent(player) {
        return __awaiter(this, void 0, void 0, function* () {
            this.agents.push(player);
            __classPrivateFieldGet(this, _Mission_agents, "f").push(player.id);
            yield this.save();
        });
    }
    removeAgent(player) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, terminal_1.removeArrayItem)(this.agents, player);
            (0, terminal_1.removeArrayItem)(__classPrivateFieldGet(this, _Mission_agents, "f"), player.id);
            yield this.save();
        });
    }
    setMessageButtonExpire() {
        // Get message data
        const embed = this.message.embeds[0];
        const components = this.message.components;
        // Set status field updated data
        embed.fields[3].value = `已过期`;
        // Check if agents reached limit
        components[0].components[0].disabled = true;
        // Update message
        this.message.edit({
            embeds: [embed],
            components: components
        });
    }
    checkComplete() {
        if (this.agents.length === 0) {
            return { pass: false, note: `无法结算：委托接受人数为0。` };
        }
        return { pass: true, note: `` };
    }
    createThread(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.thread) {
                return;
            }
            if (interaction.channel && interaction.channel.type === 'GUILD_TEXT') {
                try {
                    this.thread = yield interaction.channel.threads.create({
                        name: `委托详情：${this.title}`,
                        autoArchiveDuration: 60,
                        startMessage: this.message
                    });
                }
                catch (_a) {
                    console.error('Create thread failed.');
                    return;
                }
                const infoMessage = yield this.thread.send({ content: yield this.personInfo() });
                this.infoMessage = infoMessage;
                infoMessage.pin();
                // Message button disable
                const comp = this.message.components;
                const button = comp[0].components[1];
                button.disabled = true;
                this.message.edit({ components: comp });
            }
        });
    }
    updateThread() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.thread || !this.infoMessage)
                return;
            if (this.thread.archived)
                yield this.thread.setArchived(false);
            yield this.infoMessage.edit({ content: yield this.personInfo() });
        });
    }
    personInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let list = '```- 委托接取人\n';
            for (const agent of this.agents) {
                const member = yield this.message.guild.members.fetch(agent.id);
                list += `${member.displayName}\n`;
            }
            list += '```';
            return list;
        });
    }
}
exports.Mission = Mission;
_Mission_amateras = new WeakMap(), _Mission_collection = new WeakMap(), _Mission_owner = new WeakMap(), _Mission_agents = new WeakMap(), _Mission_message = new WeakMap(), _Mission_thread = new WeakMap(), _Mission_infoMessage = new WeakMap();
//# sourceMappingURL=Mission.js.map