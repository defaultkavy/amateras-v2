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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandsBuilder_1 = require("./commandsBuilder");
const fs_1 = __importDefault(require("fs"));
const PlayerManager_1 = require("./PlayerManager");
const WalletManager_1 = __importDefault(require("./WalletManager"));
const MissionManager_1 = __importDefault(require("./MissionManager"));
const _MessageManager_1 = __importDefault(require("./_MessageManager"));
const _GuildManager_1 = require("./_GuildManager");
const ItemManager_1 = require("./ItemManager");
const RewardManager_1 = require("./RewardManager");
const TransactionManager_1 = require("./TransactionManager");
// This is Bot Object, collect all the bot informations.
class Amateras {
    constructor(client, options) {
        this.client = client;
        this.id = client.user.id;
        this.commands = options.commands;
        this.globalCommands = options.globalCommands;
        this.db = options.db;
        this.players = new PlayerManager_1.PlayerManager(this);
        this.wallets = new WalletManager_1.default(this);
        this.missions = new MissionManager_1.default(this);
        this.messages = new _MessageManager_1.default(this);
        this.items = new ItemManager_1.ItemManager(this);
        this.me = {};
        this.guilds = new _GuildManager_1._GuildManager(this);
        this.rewards = new RewardManager_1.RewardManager(this);
        this.transactions = new TransactionManager_1.TransactionManager(this);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setCommands();
            yield this.guilds.init();
            this.interactionCreate();
            this.messageCreate();
            this.messageReactionAdd();
            this.setTimer();
            this.me = yield this.players.fetch(this.id);
        });
    }
    setCommands() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.commands)
                yield (0, commandsBuilder_1.commandBuilder)(this);
            //if (this.globalCommands) await commandGlobalBuilder(this)
            yield ((_a = this.client.application) === null || _a === void 0 ? void 0 : _a.fetch());
            const guild = yield this.client.guilds.fetch('744127668064092160');
            const appCmds = yield guild.commands.fetch();
            appCmds === null || appCmds === void 0 ? void 0 : appCmds.forEach(appcmd => {
                if (appcmd.name === 'Angry' ||
                    appcmd.name === 'Toggle') {
                    appcmd.permissions.add({
                        permissions: [
                            {
                                id: guild === null || guild === void 0 ? void 0 : guild.ownerId,
                                type: 2,
                                permission: true
                            }
                        ]
                    });
                }
                else if (appcmd.name === 'mod') {
                    appcmd.permissions.add({
                        permissions: [
                            {
                                id: '744160642994274376',
                                type: 1,
                                permission: true
                            },
                            {
                                id: '877863354809585704',
                                type: 1,
                                permission: true
                            }
                        ]
                    });
                }
            });
        });
    }
    interactionCreate() {
        // Client Interaction Command
        this.client.on('interactionCreate', (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let consoleText = `command received: ${interaction.user.username} - `;
            if (interaction.isCommand()) { // If slash command message sent
                // Check command file exist
                if (fs_1.default.existsSync(`./commands/${interaction.commandName}.js`)) {
                    // Import command function
                    const commandFn = require(`../commands/${interaction.commandName}.js`);
                    // Call command Function
                    commandFn.default(interaction, this);
                    consoleText += `${interaction.commandName}\n${interaction.options.data}`;
                }
                else {
                    // If command file not exist
                    console.error('Command not exist. Function file not found. (Amateras.js)');
                    return;
                }
            }
            else if (interaction.isSelectMenu()) { // If menu selected
                const flags = interaction.message.flags;
                if (flags.toArray().includes('EPHEMERAL'))
                    return;
                const msg = (yield ((_a = this.messages) === null || _a === void 0 ? void 0 : _a.fetch(interaction.message.id)));
                if (!msg) {
                    console.error(`Msg "${interaction.id}" not found. (Amateras.js)`);
                    return;
                }
                let SelectFn = '';
                if (!msg.actions) {
                    console.error(`Msg "${interaction.id}" actions is ${msg.actions}. (Amateras.js)`);
                    return;
                }
                for (const action of msg.actions) {
                    for (const element of action) {
                        if (element.type === 'SELECT_MENU' && Object.keys(element.options).includes(interaction.values[0])) {
                            if (!element.options[interaction.values[0]]) {
                                console.error(`Msg "${msg.id}" Select menu "${element.customId}" function is ${element.options[interaction.values[0]]} (Amateras.js)`);
                                return;
                            }
                            SelectFn = element.options[interaction.values[0]];
                        }
                    }
                }
                if (!SelectFn) {
                    //console.error(`Select menu "${interaction.customId}" not found in msg "${msg.id}" or type is uncorrect. (Amateras.js)`)
                    return;
                }
                consoleText += `${interaction.customId}\n${interaction.values}`;
                // Check function file exist
                if (fs_1.default.existsSync(`./reacts/${SelectFn}.js`)) {
                    // Import function
                    const fn = require(`../reacts/${SelectFn}.js`);
                    // Call Function
                    fn.default(interaction, this, msg.get);
                }
                else {
                    // If Function not exist
                    console.error(`Select menu "${interaction.customId}" function file not found. (Amateras.js)`);
                    return;
                }
            }
            else if (interaction.isContextMenu()) { // If context menu clicked
                if (fs_1.default.existsSync(`./context/${interaction.commandName}.js`)) {
                    // Import command function
                    const contextFn = require(`../context/${interaction.commandName}.js`);
                    // Call command Function
                    contextFn.default(interaction, this);
                    consoleText += `${interaction.commandName}`;
                }
            }
            else if (interaction.isButton()) { // If button clicked
                const flags = interaction.message.flags;
                if (flags.toArray().includes('EPHEMERAL'))
                    return;
                const msg = (yield ((_b = this.messages) === null || _b === void 0 ? void 0 : _b.fetch(interaction.message.id)));
                if (!msg) {
                    console.error(`Msg "${interaction.id}" not found. (Amateras.js)`);
                    return;
                }
                let buttonFn = '';
                if (!msg.actions) {
                    console.error(`Msg "${interaction.id}" actions is ${msg.actions}. (Amateras.js)`);
                    return;
                }
                const customId = interaction.customId.split('#')[1];
                for (const action of msg.actions) {
                    for (const element of action) {
                        if (element.customId === customId && element.type === 'BUTTON') {
                            if (!element.fn) {
                                console.error(`Msg "${msg.id}" button "${element.customId}" function is ${element.fn} (Amateras.js)`);
                                return;
                            }
                            buttonFn = element.fn;
                        }
                    }
                }
                if (!buttonFn) {
                    console.error(`Button "${customId}" not found in msg "${msg.id}" or type is uncorrect. (Amateras.js)`);
                    return;
                }
                consoleText += `${customId}`;
                // Check function file exist
                if (fs_1.default.existsSync(`./reacts/${buttonFn}.js`)) {
                    // Import function
                    const fn = require(`../reacts/${buttonFn}.js`);
                    // Call Function
                    fn.default(interaction, this);
                }
                else {
                    // If Function not exist
                    console.error(`Button "${interaction.customId}" function file not found. (Amateras.js)`);
                    return;
                }
            }
            else
                return;
            console.log(true, consoleText);
        }));
    }
    messageCreate() {
        this.client.on('messageCreate', (message) => __awaiter(this, void 0, void 0, function* () {
            console.log(true, `message received: ${message.author.username} - ${message.content}`);
            if (!message.guild || message.system)
                return;
            const player = yield this.players.fetch(message.author.id);
            const reward = player.rewards.get('message');
            if (reward)
                reward.add();
            if (message.type === 'REPLY') {
                const repliedMessage = yield message.channel.messages.fetch(message.reference.messageId);
                if (message.author.id === repliedMessage.author.id)
                    return;
                const repliedPlayer = yield this.players.fetch(repliedMessage.author.id);
                const repliedReward = repliedPlayer.rewards.get('replied');
                if (repliedReward)
                    repliedReward.add();
            }
        }));
    }
    messageReactionAdd() {
        this.client.on('messageReactionAdd', (reaction, user) => __awaiter(this, void 0, void 0, function* () {
            yield reaction.message.fetch();
            if (!reaction.message.guild || !reaction.message.author || user.bot)
                return;
            const reactedPlayer = yield this.players.fetch(reaction.message.author.id);
            const reactPlayer = yield this.players.fetch(user.id);
            const reward = reactedPlayer.rewards.get('reacted');
            const reward2 = reactPlayer.rewards.get('react');
            if (reward)
                reward.add();
            if (reward2)
                reward2.add();
        }));
    }
    setTimer() {
        const time = new Date();
        const now = new Date();
        time.setDate(time.getDate() + 1);
        time.setHours(0, 0, 0, 0);
        const expiredMission = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.db)
                return;
            const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection('mission_expire');
            const doc = (yield collection.find({ expire_date: time }).toArray())[0];
            if (!doc)
                return;
            for (const missionId of doc.missions) {
                const mission = yield ((_b = this.missions) === null || _b === void 0 ? void 0 : _b.fetch(missionId));
                if (mission) {
                    if (mission.enable)
                        mission.setMessageButtonExpire();
                }
                else {
                    console.error(`Mission "${missionId}" fetch failed. (Amateras.js)`);
                    return;
                }
            }
        });
        setTimeout(expiredMission.bind(this), time.getTime() - now.getTime());
    }
}
exports.default = Amateras;
//# sourceMappingURL=Amateras.js.map