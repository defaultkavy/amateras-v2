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
process.env.TZ = 'Asia/Kuala_Lumpur';
// NodeJS module
const discord_js_1 = require("discord.js");
const mongodb_1 = require("mongodb");
// AMATERAS Library
const Amateras_1 = __importDefault(require("./lib/Amateras"));
const terminal_1 = require("./lib/terminal");
// Client config
let { bot } = require('./bot_config.json');
// Create Bot Client
// Client Options - Partials: Cache message and reaction.
const client = new discord_js_1.Client({
    intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.DIRECT_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_INTEGRATIONS],
    partials: ['MESSAGE', 'REACTION']
});
// Database Client
const mongo = new mongodb_1.MongoClient('mongodb://localhost:27017/');
let db;
// Connect to DB
databaseInit(init);
function databaseInit(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        terminal_1.cmd.sys('Connecting to MongoDB...');
        yield mongo.connect();
        terminal_1.cmd.sys('MongoDB Connected');
        db = mongo.db('Amateras');
        callback();
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create Bot info object
        terminal_1.cmd.sys('Amateras Starting up...');
        // Client login with token, edit token from bot_config.json
        client.login(bot.token);
        // Client Ready
        client.once('ready', () => __awaiter(this, void 0, void 0, function* () {
            terminal_1.cmd.sys('Ready');
            const { commands, global_commands } = require('./command_list.json');
            const amateras = new Amateras_1.default(client, { db: db, commands: commands, globalCommands: global_commands });
            yield amateras.init();
        }));
    });
}
//# sourceMappingURL=bot.js.map