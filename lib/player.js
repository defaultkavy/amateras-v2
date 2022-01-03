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
var _Player_amateras, _Player_walletsId, _Player_missions, _Player_rewards;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const discord_js_1 = require("discord.js");
const Err_1 = require("./Err");
const PlayerMissionManager_1 = require("./PlayerMissionManager");
const PlayerMusicManager_1 = require("./PlayerMusicManager");
const terminal_1 = require("./terminal");
const V_1 = require("./V");
class Player {
    /**
     * @namespace
     * @param player The player data object.
     * @param amateras The amateras object.
     */
    constructor(data, amateras) {
        _Player_amateras.set(this, void 0);
        _Player_walletsId.set(this, void 0);
        _Player_missions.set(this, void 0);
        _Player_rewards.set(this, void 0);
        __classPrivateFieldSet(this, _Player_amateras, amateras, "f");
        this.id = data.id;
        this.exp = data.exp ? data.exp : 0;
        this.description = data.description;
        this.color = data.color,
            this.youtube = data.youtube;
        this.twitter = data.twitter;
        this.level = this.levelCheck();
        this.aka = data.aka;
        this.gender = data.gender ? data.gender : 1;
        __classPrivateFieldSet(this, _Player_walletsId, data.wallets ? data.wallets : [], "f");
        this.wallets = [];
        __classPrivateFieldSet(this, _Player_missions, this.init_missions(data), "f");
        this.missions = {};
        this.class = data.class;
        this.v = undefined;
        this.joinedLobbies = new Map;
        __classPrivateFieldSet(this, _Player_rewards, data.rewards, "f");
        this.rewards = new Map;
        this.musics = new PlayerMusicManager_1.PlayerMusicManager(this, amateras);
        this.bot = data.bot ? data.bot : false;
        this.joinedDate = data.joinedDate ? data.joinedDate : +new Date;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.get = yield __classPrivateFieldGet(this, _Player_amateras, "f").client.users.fetch(this.id);
                if (this.get) {
                    this.bot = this.get.bot;
                    this.name = this.get.username;
                }
            }
            catch (err) {
                new Err_1.Err(`Player fetch failed: (User)${this.id}`);
                return 404;
            }
            // Init wallet
            this.wallets = yield this.walletInit();
            this.missions = {
                accepted: {
                    active: {},
                    achieve: {}
                },
                requested: {
                    active: {},
                    achieve: {}
                }
            };
            if (!this.class)
                this.class = ['PLAYER'];
            if (this.class.includes('VTUBER')) {
                const vData = yield __classPrivateFieldGet(this, _Player_amateras, "f").db.collection('v').findOne({ id: this.id });
                if (vData) {
                    const v = yield __classPrivateFieldGet(this, _Player_amateras, "f").players.v.fetch(this.id);
                    if (v instanceof V_1.V) {
                        this.v = v;
                        yield this.v.init();
                    }
                    else {
                        new Err_1.Err(`V Object create failed. (User)${this.id}`);
                    }
                }
                else {
                    new Err_1.Err(`V Data is not found. (User)${this.id}`);
                }
            }
            for (const type in __classPrivateFieldGet(this, _Player_missions, "f")) {
                for (const status in __classPrivateFieldGet(this, _Player_missions, "f")[type]) {
                    const manager = new PlayerMissionManager_1.PlayerMissionManager(__classPrivateFieldGet(this, _Player_missions, "f")[type][status], this, __classPrivateFieldGet(this, _Player_amateras, "f"));
                    this.missions[type][status] = manager;
                    if (status === 'active') {
                        yield manager.fetch();
                    }
                }
            }
            if (!__classPrivateFieldGet(this, _Player_rewards, "f")) {
                const rewardObjs = yield this.init_rewards();
                for (const rewardObj of rewardObjs) {
                    const reward = yield __classPrivateFieldGet(this, _Player_amateras, "f").rewards.create(rewardObj);
                    this.rewards.set(reward.name, reward);
                }
                yield this.save();
            }
            else {
                for (const rewardId of __classPrivateFieldGet(this, _Player_rewards, "f")) {
                    const reward = yield __classPrivateFieldGet(this, _Player_amateras, "f").rewards.fetch(rewardId);
                    if (reward)
                        this.rewards.set(reward.name, reward);
                }
            }
            yield this.musics.init();
            return 100;
        });
    }
    /**
     * Save player cache to Database
     * @param callback Callback when save is done.
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = __classPrivateFieldGet(this, _Player_amateras, "f").db.collection('player');
            const player = yield collection.findOne({ id: this.id });
            const data = (0, terminal_1.cloneObj)(this, ['wallets', 'v', 'joinedLobbies', 'get', 'musics']);
            data.wallets = __classPrivateFieldGet(this, _Player_walletsId, "f");
            data.missions = __classPrivateFieldGet(this, _Player_missions, "f");
            data.rewards = [];
            for (const reward of this.rewards.values()) {
                data.rewards.push(reward.id);
            }
            if (!player) {
                yield collection.insertOne(data);
            }
            else {
                yield collection.replaceOne({ id: this.id }, data);
            }
        });
    }
    expUp(amount) {
        this.exp += amount;
        this.level = this.levelCheck();
        this.save();
    }
    levelCheck() {
        return Math.round(this.exp / 10);
    }
    walletInit() {
        return __awaiter(this, void 0, void 0, function* () {
            let wallets = [];
            if (!__classPrivateFieldGet(this, _Player_walletsId, "f") || Object.entries(__classPrivateFieldGet(this, _Player_walletsId, "f")).length === 0) {
                const create = (yield __classPrivateFieldGet(this, _Player_amateras, "f").wallets.create(this.id)).wallet;
                if (!create) {
                    const user = yield __classPrivateFieldGet(this, _Player_amateras, "f").client.users.fetch(this.id);
                    console.error(`User: ${user ? user.username : this.id} wallet init failed.`);
                    return [];
                }
                wallets.push(create);
                __classPrivateFieldSet(this, _Player_walletsId, [create.id], "f");
                yield this.save();
            }
            else {
                if (!Array.isArray(__classPrivateFieldGet(this, _Player_walletsId, "f"))) {
                    console.log(`this.#walletsId: ${__classPrivateFieldGet(this, _Player_walletsId, "f")}`);
                    return [];
                }
                for (const walletId of __classPrivateFieldGet(this, _Player_walletsId, "f")) {
                    const fetch = yield __classPrivateFieldGet(this, _Player_amateras, "f").wallets.fetch(walletId);
                    if (!fetch) {
                        const user = yield __classPrivateFieldGet(this, _Player_amateras, "f").client.users.fetch(this.id);
                        console.error(`User: ${user ? user.username : this.id} wallet "${walletId}" fetch failed.`);
                        return [];
                    }
                    wallets.push(fetch);
                }
            }
            return wallets;
        });
    }
    init_missions(player) {
        if (!player.missions) {
            player.missions = {
                accepted: {
                    active: [],
                    achieve: []
                },
                requested: {
                    active: [],
                    achieve: []
                }
            };
        }
        return {
            accepted: {
                active: player.missions.accepted.active ? player.missions.accepted.active : [],
                achieve: player.missions.accepted.achieve ? player.missions.accepted.achieve : []
            },
            requested: {
                active: player.missions.requested.active ? player.missions.requested.active : [],
                achieve: player.missions.requested.achieve ? player.missions.requested.achieve : []
            }
        };
    }
    init_rewards() {
        return __awaiter(this, void 0, void 0, function* () {
            return [
                {
                    name: 'message',
                    title: '发送消息',
                    description: '在公会内发送消息',
                    owner: this.id,
                    pay: 1,
                    reach: 10
                },
                {
                    name: 'replied',
                    title: '被回复消息',
                    description: '在公会内被他人回复消息',
                    owner: this.id,
                    pay: 1,
                    reach: 5
                },
                {
                    name: 'react',
                    title: '回应表情',
                    description: '在公会内对他人回应表情',
                    owner: this.id,
                    pay: 1,
                    reach: 20
                },
                {
                    name: 'reacted',
                    title: '被回应表情',
                    description: '在公会内被他人回应表情',
                    owner: this.id,
                    pay: 1,
                    reach: 10
                }
            ];
        });
    }
    sendInfo(interaction, share) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(interaction.member instanceof discord_js_1.GuildMember))
                return;
            const embed = yield this.infoEmbed(interaction.member);
            // Create Button
            const comp = [];
            if (this.v && share) {
                const action = new discord_js_1.MessageActionRow;
                const button = new discord_js_1.MessageButton;
                button.label = '切换到 VTuber';
                button.style = 'PRIMARY';
                button.customId = '#profile_change_button';
                action.addComponents(button);
                comp.push(action);
            }
            interaction.reply({ embeds: [embed], components: comp, ephemeral: !share });
            if (comp.length !== 0) {
                const message = yield interaction.fetchReply();
                __classPrivateFieldGet(this, _Player_amateras, "f").messages.create(message, {
                    profile_change_button: 'profile_change_button'
                });
            }
        });
    }
    infoEmbed(member) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.get)
                return {};
            let joinedSystemDate, joinedGuildDate;
            if (member.joinedTimestamp) {
                const date = new Date(member.joinedTimestamp);
                joinedGuildDate = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
                const date2 = new Date(this.joinedDate);
                joinedSystemDate = `${date2.getFullYear()} 年 ${date2.getMonth() + 1} 月 ${date2.getDate()} 日`;
            }
            if (this.bot) {
                if (this.id === __classPrivateFieldGet(this, _Player_amateras, "f").id) {
                    const time = __classPrivateFieldGet(this, _Player_amateras, "f").client.uptime ? (0, terminal_1.msTime)(__classPrivateFieldGet(this, _Player_amateras, "f").client.uptime) : undefined;
                    let display = '';
                    if (time) {
                        if (time.year > 0)
                            display += `${time.year} 年 `;
                        if (time.day > 0)
                            display += `${time.day} 天 `;
                        if (time.hour > 0)
                            display += `${time.hour} 时 `;
                        if (time.minute > 0)
                            display += `${time.minute} 分 `;
                        if (time.second > 0)
                            display += `${time.second} 秒 `;
                    }
                    const embed = {
                        author: {
                            name: 'AMATERAS'
                        },
                        title: `天照`,
                        description: `来自异世界公会的天照全天聆听你的请求！`,
                        thumbnail: {
                            url: this.get.displayAvatarURL({ format: 'webp', size: 1024 })
                        },
                        color: 'DARK_BUT_NOT_BLACK',
                        fields: [
                            {
                                name: `天照已运行超过 ${display}`,
                                value: `目前在 ${(yield __classPrivateFieldGet(this, _Player_amateras, "f").client.guilds.fetch()).size} 个伺服器中待机`,
                                inline: true
                            },
                            {
                                name: `系统剩余金额`,
                                value: `${this.wallets[0].balance}G`,
                                inline: false
                            },
                            {
                                name: `生日`,
                                value: `1 月 1 日`,
                                inline: true
                            },
                            {
                                name: `${joinedGuildDate} 加入伺服器`,
                                value: `${joinedSystemDate} 正式启动`,
                                inline: false
                            },
                        ],
                        footer: {
                            text: this.id
                        }
                    };
                    return embed;
                }
                else {
                    const embed = {
                        author: {
                            name: 'Bot'
                        },
                        title: member ? member.displayName : undefined,
                        description: this.description ? this.description : undefined,
                        thumbnail: {
                            url: this.get.displayAvatarURL({ size: 512 })
                        },
                        color: `DARK_BUT_NOT_BLACK`,
                        footer: {
                            text: this.id
                        },
                    };
                    return embed;
                }
            }
            else {
                const embed = {
                    author: {
                        name: 'Player'
                    },
                    title: member ? member.displayName : undefined,
                    description: this.description ? this.description : undefined,
                    thumbnail: {
                        url: (this.get.displayAvatarURL({ size: 512 }))
                    },
                    color: this.color ? this.color : undefined,
                    footer: {
                        text: this.id
                    },
                    fields: [
                        {
                            name: `LV.${this.level}`,
                            value: `Exp.${this.exp}`,
                            inline: true
                        },
                        {
                            name: this.aka ? `${this.aka}` : '-',
                            value: `${(this.wallets)[0].balance}G`,
                            inline: true
                        },
                        {
                            name: `${joinedGuildDate} 加入伺服器`,
                            value: `${joinedSystemDate} 成为玩家`,
                            inline: false
                        }
                    ]
                };
                return embed;
            }
        });
    }
    /**
     * Add V class to this player
     * @returns 101 - Already set
     * @returns 102 - Player fetch failed
     */
    setVTuber() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check class
            if ((_a = this.class) === null || _a === void 0 ? void 0 : _a.includes('VTUBER')) {
                return 101; // Already set
            }
            const v = yield __classPrivateFieldGet(this, _Player_amateras, "f").players.v.fetch(this.id);
            if (v instanceof V_1.V) {
                if (this.class)
                    this.class.push('VTUBER');
                this.v = v;
                yield this.save();
                return this.v; // Fetch old data from database and set this player to V
            }
            else if (v === 404) {
                const newV = yield __classPrivateFieldGet(this, _Player_amateras, "f").players.v.create(this.id);
                if (newV instanceof V_1.V) {
                    this.v = newV;
                    if (this.class)
                        this.class.push('VTUBER');
                    yield this.v.init();
                    yield this.v.save();
                    yield this.save();
                    return this.v;
                }
                else {
                    return 102; // Player fetch failed
                }
            }
            else {
                return 102; // Player fetch failed
            }
        });
    }
    /**
     * Remove V class from this player
     * @returns 100 - Success
     * @returns 101 - Already removed
     */
    unsetVTuber() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_a = this.class) === null || _a === void 0 ? void 0 : _a.includes('VTUBER'))) {
                this.v = undefined;
                return 101; // Already removed
            }
            this.v = undefined;
            if (this.class)
                this.class = (0, terminal_1.removeArrayItem)(this.class, 'VTUBER');
            yield this.save();
            return 100;
        });
    }
    joinLobby(lobby) {
        this.joinedLobbies.set(lobby.categoryChannel.id, lobby);
        this.save();
    }
    leaveLobby(lobby) {
        this.joinedLobbies.delete(lobby.categoryChannel.id);
        this.save();
    }
    mention() {
        if (!this.get)
            return this.id;
        let result = this.get;
        if (!result) {
            result = this.get.username;
        }
        return result;
    }
}
exports.Player = Player;
_Player_amateras = new WeakMap(), _Player_walletsId = new WeakMap(), _Player_missions = new WeakMap(), _Player_rewards = new WeakMap();
//# sourceMappingURL=Player.js.map