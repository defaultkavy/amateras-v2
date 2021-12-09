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
var _GuildCommandManager_amateras, _GuildCommandManager_commandsList, _GuildCommandManager__guild, _GuildCommandManager_commands, _GuildCommandManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildCommandManager = void 0;
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const GuildCommand_1 = require("./GuildCommand");
const terminal_1 = require("./terminal");
const { commands } = require('../command_list.json');
class GuildCommandManager {
    constructor(data, _guild, amateras) {
        _GuildCommandManager_amateras.set(this, void 0);
        _GuildCommandManager_commandsList.set(this, void 0);
        _GuildCommandManager__guild.set(this, void 0);
        _GuildCommandManager_commands.set(this, void 0);
        _GuildCommandManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, _GuildCommandManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _GuildCommandManager_collection, amateras.db.collection('commands'), "f");
        __classPrivateFieldSet(this, _GuildCommandManager_commandsList, commands, "f");
        __classPrivateFieldSet(this, _GuildCommandManager_commands, data ? data.commands : undefined, "f");
        __classPrivateFieldSet(this, _GuildCommandManager__guild, _guild, "f");
        this.cache = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _GuildCommandManager_commandsList, "f"))
                return console.log('| Guild Command Disabled');
            yield this.deploy(); // Deploy command setup to Guild
            const appCommands = yield __classPrivateFieldGet(this, _GuildCommandManager__guild, "f").get.commands.fetch();
            if (__classPrivateFieldGet(this, _GuildCommandManager_commands, "f")) {
                for (const appCommand of appCommands) {
                    const data = yield __classPrivateFieldGet(this, _GuildCommandManager_collection, "f").findOne({ id: appCommand[0] });
                    const command = new GuildCommand_1.GuildCommand(data, appCommand[1], __classPrivateFieldGet(this, _GuildCommandManager__guild, "f"), __classPrivateFieldGet(this, _GuildCommandManager_amateras, "f"));
                    this.cache.set(appCommand[1].name, command);
                    yield command.init();
                }
            }
            else {
                for (const appCommand of appCommands) {
                    const command = new GuildCommand_1.GuildCommand(null, appCommand[1], __classPrivateFieldGet(this, _GuildCommandManager__guild, "f"), __classPrivateFieldGet(this, _GuildCommandManager_amateras, "f"));
                    this.cache.set(appCommand[1].name, command);
                    yield command.init();
                }
            }
        });
    }
    deploy() {
        return __awaiter(this, void 0, void 0, function* () {
            const rest = new rest_1.REST({ version: '9' }).setToken(__classPrivateFieldGet(this, _GuildCommandManager_amateras, "f").client.token);
            try {
                yield rest.put(v9_1.Routes.applicationGuildCommands(__classPrivateFieldGet(this, _GuildCommandManager_amateras, "f").id, __classPrivateFieldGet(this, _GuildCommandManager__guild, "f").id), { body: __classPrivateFieldGet(this, _GuildCommandManager_commandsList, "f") });
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    toData() {
        const data = (0, terminal_1.cloneObj)(this, ['cache']);
        data.commands = {};
        for (const command of this.cache.values()) {
            data.commands[command.name] = command.id;
        }
        return data;
    }
}
exports.GuildCommandManager = GuildCommandManager;
_GuildCommandManager_amateras = new WeakMap(), _GuildCommandManager_commandsList = new WeakMap(), _GuildCommandManager__guild = new WeakMap(), _GuildCommandManager_commands = new WeakMap(), _GuildCommandManager_collection = new WeakMap();
//# sourceMappingURL=GuildCommandManager.js.map