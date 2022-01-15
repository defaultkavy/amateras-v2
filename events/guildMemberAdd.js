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
const discord_js_1 = require("discord.js");
const Player_1 = require("../lib/Player");
const _TextChannel_1 = require("../lib/_TextChannel");
module.exports = {
    name: 'guildMemberAdd',
    once: false,
    execute(member, amateras) {
        return __awaiter(this, void 0, void 0, function* () {
            const _guild = amateras.guilds.cache.get(member.guild.id);
            const player = yield amateras.players.fetch(member.id);
            if (_guild) {
                if (_guild.roles.defaultRoles.size > 0) {
                    for (const _role of _guild.roles.defaultRoles.values()) {
                        try {
                            if (yield _role.fetch())
                                member.roles.add(_role.get);
                        }
                        catch (err) {
                            console.error('Error: Member join set default role failed: \n' + err);
                        }
                    }
                }
                if (player instanceof Player_1.Player) {
                    const member = yield _guild.member(player.id);
                    const _channel = _guild.channels.welcomeChannel;
                    if (_channel instanceof _TextChannel_1._TextChannel && member instanceof discord_js_1.GuildMember) {
                        _channel.get.send({ content: `${player.mention()} 欢迎加入`, embeds: [yield player.infoEmbed(member)] });
                    }
                }
            }
        });
    }
};
//# sourceMappingURL=guildMemberAdd.js.map