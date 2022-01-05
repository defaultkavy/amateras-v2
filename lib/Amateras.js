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
const fs_1 = __importDefault(require("fs"));
const PlayerManager_1 = require("./PlayerManager");
const WalletManager_1 = __importDefault(require("./WalletManager"));
const MissionManager_1 = __importDefault(require("./MissionManager"));
const _MessageManager_1 = __importDefault(require("./_MessageManager"));
const _GuildManager_1 = require("./_GuildManager");
const ItemManager_1 = require("./ItemManager");
const RewardManager_1 = require("./RewardManager");
const TransactionManager_1 = require("./TransactionManager");
const _CharacterManager_1 = require("./_CharacterManager");
const cmd_1 = __importDefault(require("./cmd"));
const Log_1 = require("./Log");
const System_1 = require("./System");
const CommandManager_1 = require("./CommandManager");
const MusicManager_1 = require("./MusicManager");
const { system } = require('../bot_config.json');
// This is Bot Object, collect all the bot informations.
class Amateras {
    constructor(client, db, admin) {
        this.client = client;
        this.id = client.user.id;
        this.debug = system.debug;
        this.db = db;
        this.commands = new CommandManager_1.CommandManager(this);
        this.players = new PlayerManager_1.PlayerManager(this);
        this.wallets = new WalletManager_1.default(this);
        this.missions = new MissionManager_1.default(this);
        this.messages = new _MessageManager_1.default(this);
        this.items = new ItemManager_1.ItemManager(this);
        this.me = {};
        this.system = new System_1.System(admin, this);
        this.guilds = new _GuildManager_1._GuildManager(this);
        this.rewards = new RewardManager_1.RewardManager(this);
        this.transactions = new TransactionManager_1.TransactionManager(this);
        this.characters = new _CharacterManager_1._CharacterManager(this);
        this.log = new Log_1.Log(this);
        this.musics = new MusicManager_1.MusicManager(this);
        this.ready = false;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(cmd_1.default.Cyan, 'Amateras System Initializing...');
            const player = yield this.players.fetch(this.id);
            if (player === 404)
                throw new Error('Amateras Fatal Error: Amateras User fetch failed');
            this.me = player;
            console.time('| System Initialized');
            yield this.system.init();
            console.timeEnd('| System Initialized');
            console.time('| Guilds Initialized');
            yield this.guilds.init();
            console.timeEnd('| Guilds Initialized');
            console.time('| Global Command Deployed');
            yield this.commands.init();
            console.timeEnd('| Global Command Deployed');
            this.eventHandler();
            this.wake();
            console.log(cmd_1.default.Yellow, 'Amateras Ready.');
        });
    }
    sleep() {
        this.ready = false;
        for (const _guild of this.guilds.cache.values()) {
            _guild.musicPlayer.control.stop();
        }
        this.log.send('天照已休眠！', true);
    }
    wake() {
        this.ready = true;
        for (const _guild of this.guilds.cache.values()) {
            _guild.musicPlayer.update();
        }
        this.log.send('天照已上线！', true);
    }
    eventHandler() {
        const eventFiles = fs_1.default.readdirSync('./events').filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            const event = require(`../events/${file}`);
            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args, this));
            }
            else {
                this.client.on(event.name, (...args) => event.execute(...args, this));
            }
        }
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