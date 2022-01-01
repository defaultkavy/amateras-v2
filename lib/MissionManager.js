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
var _MissionManager_amateras, _MissionManager_collection, _MissionManager_missionDate;
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Mission_1 = require("./Mission");
const terminal_1 = require("./terminal");
class MissionManager {
    constructor(amateras) {
        var _a, _b;
        _MissionManager_amateras.set(this, void 0);
        _MissionManager_collection.set(this, void 0);
        _MissionManager_missionDate.set(this, void 0);
        __classPrivateFieldSet(this, _MissionManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _MissionManager_collection, (_a = amateras.db) === null || _a === void 0 ? void 0 : _a.collection('missions'), "f");
        __classPrivateFieldSet(this, _MissionManager_missionDate, (_b = amateras.db) === null || _b === void 0 ? void 0 : _b.collection('mission_date'), "f");
        this.cache = new Map;
    }
    /**
     * Get mission data from database.
     * @param missionId The target mission ID.
     */
    fetch(missionId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const missionData = yield ((_a = __classPrivateFieldGet(this, _MissionManager_collection, "f")) === null || _a === void 0 ? void 0 : _a.findOne({ id: missionId }));
            if (!missionData) {
                console.error(`Mission "${missionId}" fetch failed. (MissionManager.js)`);
                return;
            }
            if (this.cache.has(missionId)) {
                const mission = this.cache.get(missionId);
                yield mission.init();
                return mission;
            }
            const mission = new Mission_1.Mission(missionData, __classPrivateFieldGet(this, _MissionManager_amateras, "f"));
            this.cache.set(missionId, mission);
            yield mission.init();
            return mission;
        });
    }
    /**
     * Create new mission to cache and database.
     * @param missionObj Required MissionObj type Object.
     * @returns Return a Mission type dynamic object.
     */
    create(missionObj) {
        return __awaiter(this, void 0, void 0, function* () {
            // Clone missionObj become MissionData type
            const missionData = (0, terminal_1.cloneObj)(missionObj);
            // Create new mission ID for new mission
            const newId = yield Mission_1.Mission.createId(__classPrivateFieldGet(this, _MissionManager_amateras, "f"));
            // Check if new ID create failed.
            if (!newId) {
                console.error('Mission create failed: Mission ID undefined. (MissionManager.ts)');
                return undefined;
            }
            // Set MissionDat type needed properties
            missionData.id = newId;
            missionData.enable = true;
            const expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + missionData.expire);
            missionData.expire = expireDate.setHours(0, 0, 0, 0);
            missionData.agents = [];
            if (!missionData.persons) {
                missionData.persons = 1;
            }
            // Create Mission object
            const mission = new Mission_1.Mission(missionData, __classPrivateFieldGet(this, _MissionManager_amateras, "f"));
            this.cache.set(mission.id, mission);
            yield mission.init();
            // Assign mission to owner
            mission.owner.missions.requested.active.add(mission);
            // Save expire date to database
            this.saveMissionDate(mission);
            // Transfer coins to Amateras
            const wallets = mission.owner.wallets;
            if (!wallets) {
                console.error(`Transfer mission payment is failed. Owner "${missionObj.owner}" wallet is undefined. (MissionManager.js)`);
                return;
            }
            wallets[0].transfer(__classPrivateFieldGet(this, _MissionManager_amateras, "f").me.wallets[0].id, mission.pay * mission.persons, 'Mission Payment from Owner.', false);
            return mission;
        });
    }
    saveMissionDate(mission) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const find = yield ((_a = __classPrivateFieldGet(this, _MissionManager_missionDate, "f")) === null || _a === void 0 ? void 0 : _a.findOne({ expire_date: mission.expire }));
            if (!find) {
                (_b = __classPrivateFieldGet(this, _MissionManager_missionDate, "f")) === null || _b === void 0 ? void 0 : _b.insertOne({ expire_date: mission.expire, missions: [mission.id] });
            }
            else {
                const missions = find.missions;
                missions.push(mission.id);
                (_c = __classPrivateFieldGet(this, _MissionManager_missionDate, "f")) === null || _c === void 0 ? void 0 : _c.updateOne({ expire_date: mission.expire, }, { $set: { missions: missions } });
            }
        });
    }
    sendMissionChoices(interaction, type) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield ((_a = __classPrivateFieldGet(this, _MissionManager_amateras, "f").players) === null || _a === void 0 ? void 0 : _a.fetch(interaction.user.id));
            if (player === 404)
                return;
            //#region Message components create
            const selectmenu = new discord_js_1.MessageSelectMenu();
            let fields = [];
            selectmenu.customId = interaction.id + '_select';
            selectmenu.placeholder = type === 'MISSION_CLOSE' ? '请选择你要结算的委托（可多选）' : type === 'MISSION_CANCEL' ? '请选择你要取消的委托（可多选）' : '请选择你要放弃的委托（可多选）';
            selectmenu.minValues = 1;
            const missions = type === 'MISSION_CLOSE' || type === 'MISSION_CANCEL' ? player.missions.requested.active.cache : player.missions.accepted.active.cache;
            if (missions.size === 0) {
                interaction.reply({ content: type === 'MISSION_CLOSE' || type === 'MISSION_CANCEL' ? '你当前没有发布的委托。' : '你当前没有接受的委托', ephemeral: true });
                return;
            }
            missions.forEach((mission) => {
                selectmenu.addOptions({
                    label: `${mission.title}`,
                    description: `${mission.id}`,
                    value: `${mission.id}`,
                    default: false
                });
                fields.push({
                    name: mission.title,
                    value: `**接取人数：**${mission.agents.length}/${mission.persons}\n**期限：**${String(mission.expire.getFullYear())}年${String(mission.expire.getMonth() + 1)}月${String(mission.expire.getDate()).padStart(2, '0')}日\n**报酬金：**${mission.pay}G\n\`${mission.id}\` - [任务链接](${mission.message.url})`
                });
            });
            const embed = {
                title: '委托依赖列表',
                fields: fields,
            };
            const summit_button = new discord_js_1.MessageButton();
            summit_button.customId = interaction.id + '_mission_close_summit';
            summit_button.label = '提交';
            summit_button.style = 'PRIMARY';
            summit_button.disabled = true;
            const cancel_button = new discord_js_1.MessageButton();
            cancel_button.customId = interaction.id + '_mission_close_cancel';
            cancel_button.label = '取消';
            cancel_button.style = 'DANGER';
            const actionRow = new discord_js_1.MessageActionRow();
            const actionRow2 = new discord_js_1.MessageActionRow();
            actionRow.addComponents(selectmenu);
            actionRow2.addComponents(summit_button);
            actionRow2.addComponents(cancel_button);
            //#endregion
            interaction.reply({ embeds: [embed], components: [actionRow, actionRow2], ephemeral: true });
            if (!interaction.channel)
                return;
            const collector = interaction.channel.createMessageComponentCollector({
                filter: (compInteraction) => {
                    if (compInteraction.user.id === interaction.user.id) {
                        if (compInteraction.customId === summit_button.customId)
                            return true;
                        if (compInteraction.customId === cancel_button.customId)
                            return true;
                        if (compInteraction.customId === selectmenu.customId)
                            return true;
                    }
                    return false;
                },
                time: 1000 * 60
            });
            let status = 0, values = [];
            collector.on('collect', (interaction2) => __awaiter(this, void 0, void 0, function* () {
                var _b, _c, _d;
                if (interaction2.customId === summit_button.customId && interaction2.isButton() === true) {
                    // Summit button interact
                    if (type === 'MISSION_CLOSE') {
                        for (const missionId of values) {
                            const check = missions.get(missionId).checkComplete();
                            if (!check.pass) {
                                interaction.editReply({ content: `\`\`\`diff\n- ${check.note}\`\`\`` });
                                interaction2.deferUpdate();
                                return;
                            }
                        }
                        for (const missionId of values)
                            yield ((_b = missions.get(missionId)) === null || _b === void 0 ? void 0 : _b.complete());
                    }
                    else if (type === 'MISSION_CANCEL') {
                        for (const missionId of values)
                            yield ((_c = missions.get(missionId)) === null || _c === void 0 ? void 0 : _c.cancel());
                    }
                    else if (type === 'MISSION_QUIT') {
                        for (const missionId of values)
                            yield ((_d = missions.get(missionId)) === null || _d === void 0 ? void 0 : _d.quit(player));
                    }
                    interaction.editReply({ content: type === 'MISSION_CLOSE' ? '委托已结算。' : type === 'MISSION_CANCEL' ? '委托已取消' : '委托已放弃', embeds: [], components: [] });
                    interaction2.deferUpdate();
                    status = 1;
                }
                else if (interaction2.customId === cancel_button.customId) {
                    // Close button interact
                    interaction.editReply({ content: '你取消了请求。', embeds: [], components: [] });
                    interaction2.deferUpdate();
                    status = 2;
                }
                else if (interaction2.customId === selectmenu.customId && interaction2.isSelectMenu()) {
                    // Select menu interact
                    values = interaction2.values;
                    const newButton = interaction2.message.components[1].components[0];
                    const newSelect = interaction2.message.components[0].components[0];
                    const newComps = interaction2.message.components;
                    newComps[1].components[0] = newButton;
                    newComps[0].components[0] = newSelect;
                    for (const option of newSelect.options) {
                        for (const value of interaction2.values) {
                            if (value === option.value)
                                option.default = true;
                        }
                    }
                    if (interaction2.values.length > 0) {
                        newButton.disabled = false;
                        interaction.editReply({ components: newComps });
                    }
                    else {
                        newButton.disabled = true;
                        interaction.editReply({ components: newComps });
                    }
                    interaction2.deferUpdate();
                    status = 0;
                }
            }));
            collector.on('end', (collection) => {
                if (status === 0)
                    interaction.editReply({ content: '请求已过期。', embeds: [], components: [] });
            });
        });
    }
    sendMissionList(interact) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const player = yield ((_a = __classPrivateFieldGet(this, _MissionManager_amateras, "f").players) === null || _a === void 0 ? void 0 : _a.fetch(interact.user.id));
            if (player === 404)
                return;
            if (!player) {
                console.error(`Player "${interact.user.id}(${interact.user.username}) fetch failed. (MsgManager.js)`);
                return;
            }
            const acceptedMissions = player.missions.accepted.active.cache;
            const fields = [];
            acceptedMissions.forEach((mission) => {
                fields.push({
                    name: mission.title,
                    value: `**接取人数：**${mission.agents.length}/${mission.persons}\n**期限：**${String(mission.expire.getFullYear())}年${String(mission.expire.getMonth() + 1)}月${String(mission.expire.getDate()).padStart(2, '0')}日\n**报酬金：**${mission.pay}G\n\`${mission.id}\` - [任务链接](${mission.message.url})`
                });
            });
            const requestedMissions = player.missions.requested.active.cache;
            const embed = {
                title: '委托接受列表',
                fields: fields,
            };
            if (acceptedMissions.size === 0)
                embed.description = '当前没有接受的委托';
            const fields2 = [];
            requestedMissions.forEach((mission) => {
                fields2.push({
                    name: mission.title,
                    value: `**接取人数：**${mission.agents.length}/${mission.persons}\n**期限：**${String(mission.expire.getFullYear())}年${String(mission.expire.getMonth() + 1)}月${String(mission.expire.getDate()).padStart(2, '0')}日\n**报酬金：**${mission.pay}G\n\`${mission.id}\` - [任务链接](${mission.message.url})`
                });
            });
            const embed2 = {
                title: '委托依赖列表',
                fields: fields2,
            };
            if (requestedMissions.size === 0)
                embed2.description = '当前没有发布的委托';
            interact.reply({ embeds: [embed, embed2], ephemeral: true });
        });
    }
}
exports.default = MissionManager;
_MissionManager_amateras = new WeakMap(), _MissionManager_collection = new WeakMap(), _MissionManager_missionDate = new WeakMap();
//# sourceMappingURL=MissionManager.js.map