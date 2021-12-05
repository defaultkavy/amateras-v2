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
const PlayerMissionManager_1 = require("./PlayerMissionManager");
const terminal_1 = require("./terminal");
const V_1 = require("./V");
class Player {
    /**
     * @namespace
     * @param player The player data object.
     * @param amateras The amateras object.
     */
    constructor(player, amateras) {
        _Player_amateras.set(this, void 0);
        _Player_walletsId.set(this, void 0);
        _Player_missions.set(this, void 0);
        _Player_rewards.set(this, void 0);
        __classPrivateFieldSet(this, _Player_amateras, amateras, "f");
        this.id = player.id;
        this.exp = player.exp ? player.exp : 0;
        this.description = player.description;
        this.color = player.color,
            this.youtube = player.youtube;
        this.twitter = player.twitter;
        this.level = this.levelCheck();
        this.aka = player.aka;
        this.gender = player.gender ? player.gender : 1;
        __classPrivateFieldSet(this, _Player_walletsId, player.wallets ? player.wallets : [], "f");
        this.wallets = [];
        __classPrivateFieldSet(this, _Player_missions, this.init_missions(player), "f");
        this.missions = {};
        this.class = player.class;
        this.v = undefined;
        this.joinedLobbies = new Map;
        __classPrivateFieldSet(this, _Player_rewards, player.rewards, "f");
        this.rewards = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
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
                if (!vData)
                    return console.error('vData is ' + vData);
                this.v = new V_1.V(vData, this, __classPrivateFieldGet(this, _Player_amateras, "f"));
                this.v.init();
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
        });
    }
    /**
     * Save player cache to Database
     * @param callback Callback when save is done.
     */
    save(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = __classPrivateFieldGet(this, _Player_amateras, "f").db.collection('player');
            const player = yield collection.findOne({ id: this.id });
            const data = (0, terminal_1.cloneObj)(this, ['wallets', 'v', 'joinedLobbies']);
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
            if (callback)
                callback();
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
            const embed = yield this.infoEmbed(interaction);
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
    infoEmbed(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const member = yield interaction.guild.members.fetch(this.id);
            const embed = {
                author: {
                    name: 'Player'
                },
                title: member ? member.displayName : undefined,
                description: this.description ? this.description : undefined,
                thumbnail: {
                    url: (yield interaction.client.users.fetch(this.id)).displayAvatarURL({ size: 512 })
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
                        name: this.aka ? `${this.aka}` : 'none',
                        value: `${(this.wallets)[0].balance}G`,
                        inline: true
                    },
                    {
                        name: 'Links',
                        value: (this.youtube ? `[YouTube](https://youtube.com/channel/${this.youtube}) ` : '')
                            + (this.twitter ? `[Twitter](https://twitter.com/${this.twitter}) ` : '-')
                    }
                ]
            };
            return embed;
        });
    }
    setVTuber() {
        return __awaiter(this, void 0, void 0, function* () {
            const vData = {
                id: this.id,
                name: undefined,
                avatar: undefined,
                description: undefined,
                imageFolders: undefined
            };
            this.v = new V_1.V(vData, this, __classPrivateFieldGet(this, _Player_amateras, "f"));
            if (this.class)
                this.class.push('VTUBER');
            yield this.v.init();
            yield this.v.save();
            yield this.save();
        });
    }
    unsetVTuber() {
        return __awaiter(this, void 0, void 0, function* () {
            this.v = undefined;
            if (this.class)
                this.class = (0, terminal_1.removeArrayItem)(this.class, 'VTUBER');
            yield this.save();
        });
    }
    joinLobby(lobby) {
        this.joinedLobbies.set(lobby.categoryChannel.id, lobby);
    }
    leaveLobby(lobby) {
        this.joinedLobbies.delete(lobby.categoryChannel.id);
    }
}
exports.Player = Player;
_Player_amateras = new WeakMap(), _Player_walletsId = new WeakMap(), _Player_missions = new WeakMap(), _Player_rewards = new WeakMap();
//# sourceMappingURL=Player.js.map