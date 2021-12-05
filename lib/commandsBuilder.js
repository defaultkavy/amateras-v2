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
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandGlobalBuilder = exports.commandBuilder = void 0;
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
function commandBuilder(amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const rest = new rest_1.REST({ version: '9' }).setToken(amateras.client.token);
        try {
            for (const guild of amateras.client.guilds.cache) {
                yield rest.put(v9_1.Routes.applicationGuildCommands(amateras.id, guild[1].id), { body: amateras.commands });
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.commandBuilder = commandBuilder;
;
function commandGlobalBuilder(amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const rest = new rest_1.REST({ version: '9' }).setToken(amateras.client.token);
        try {
            yield rest.put(v9_1.Routes.applicationCommands(amateras.id), { body: [] });
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.commandGlobalBuilder = commandGlobalBuilder;
;
//# sourceMappingURL=commandsBuilder.js.map