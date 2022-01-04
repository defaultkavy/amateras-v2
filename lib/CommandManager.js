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
var _CommandManager_amateras, _CommandManager_commandsList, _CommandManager_commands, _CommandManager_collection;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandManager = void 0;
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const Command_1 = require("./Command");
const { global_commands } = require('../command_list.json');
class CommandManager {
    constructor(amateras) {
        _CommandManager_amateras.set(this, void 0);
        _CommandManager_commandsList.set(this, void 0);
        _CommandManager_commands.set(this, void 0);
        _CommandManager_collection.set(this, void 0);
        __classPrivateFieldSet(this, _CommandManager_amateras, amateras, "f");
        __classPrivateFieldSet(this, _CommandManager_collection, amateras.db.collection('commands'), "f");
        __classPrivateFieldSet(this, _CommandManager_commandsList, global_commands, "f");
        this.cache = new Map;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!__classPrivateFieldGet(this, _CommandManager_commandsList, "f"))
                return console.log('| Global Command Disabled');
            const admin = __classPrivateFieldGet(this, _CommandManager_amateras, "f").system.admin;
            if (!admin)
                throw new Error('Amateras Fatal Error: System Admin User fetch failed');
            __classPrivateFieldGet(this, _CommandManager_collection, "f").findOne({ id: admin.id });
            yield this.deploy(); // Deploy command setup 
            const appCommands = yield __classPrivateFieldGet(this, _CommandManager_amateras, "f").client.application.commands.fetch();
            if (__classPrivateFieldGet(this, _CommandManager_commands, "f")) {
                for (const appCommand of appCommands) {
                    const data = yield __classPrivateFieldGet(this, _CommandManager_collection, "f").findOne({ id: appCommand[0] });
                    const command = new Command_1.Command(data, appCommand[1], __classPrivateFieldGet(this, _CommandManager_amateras, "f"));
                    this.cache.set(appCommand[1].name, command);
                    yield command.init();
                }
            }
            else {
                for (const appCommand of appCommands) {
                    const command = new Command_1.Command(null, appCommand[1], __classPrivateFieldGet(this, _CommandManager_amateras, "f"));
                    this.cache.set(appCommand[1].name, command);
                    yield command.init();
                }
            }
        });
    }
    edited() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = __classPrivateFieldGet(this, _CommandManager_amateras, "f").db.collection('sys');
            const data = yield collection.findOne({ name: 'commands' });
            // Check if database no record OR record different with commandsList
            if (!data || (data && JSON.stringify(data.commands) !== JSON.stringify(__classPrivateFieldGet(this, _CommandManager_commandsList, "f")))) {
                // [] reset guild list
                yield this.record();
                return true;
            }
            yield this.record(data);
            return true;
        });
    }
    record(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = __classPrivateFieldGet(this, _CommandManager_amateras, "f").db.collection('sys');
            const newData = {
                name: 'commands',
                commands: __classPrivateFieldGet(this, _CommandManager_commandsList, "f")
            };
            if (data) {
                yield collection.replaceOne({ name: 'commands' }, newData);
            }
            else {
                yield collection.insertOne(newData);
            }
        });
    }
    removeRecord() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = __classPrivateFieldGet(this, _CommandManager_amateras, "f").db.collection('sys');
            const data = yield collection.findOne({ name: 'commands' });
            if (data) {
                yield collection.replaceOne({ name: 'commands' }, data);
            }
            else {
                return;
            }
        });
    }
    deploy() {
        return __awaiter(this, void 0, void 0, function* () {
            const rest = new rest_1.REST({ version: '9' }).setToken(__classPrivateFieldGet(this, _CommandManager_amateras, "f").client.token);
            try {
                yield rest.put(v9_1.Routes.applicationCommands(__classPrivateFieldGet(this, _CommandManager_amateras, "f").id), { body: __classPrivateFieldGet(this, _CommandManager_commandsList, "f") });
            }
            catch (err) {
                yield this.removeRecord();
                console.error(err);
            }
        });
    }
}
exports.CommandManager = CommandManager;
_CommandManager_amateras = new WeakMap(), _CommandManager_commandsList = new WeakMap(), _CommandManager_commands = new WeakMap(), _CommandManager_collection = new WeakMap();
//# sourceMappingURL=CommandManager.js.map