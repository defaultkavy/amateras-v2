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
module.exports = {
    name: 'guildCreate',
    once: false,
    execute(guild, amateras) {
        return __awaiter(this, void 0, void 0, function* () {
            const _guild = amateras.guilds.cache.get(guild.id);
            if (_guild && _guild.available === true)
                return;
            console.debug(true, `- join ${guild.name}!`);
            amateras.guilds.create(guild);
        });
    }
};
//# sourceMappingURL=guildCreate.js.map