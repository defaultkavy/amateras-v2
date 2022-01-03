import { Guild, GuildMember, TextChannel } from "discord.js";
import Amateras from "../lib/Amateras";
import { Player } from "../lib/Player";
import { _TextChannel } from "../lib/_TextChannel";

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member: GuildMember, amateras: Amateras) {
        console.debug(1)
        const _guild = amateras.guilds.cache.get(member.guild.id)
        const player = await amateras.players.fetch(member.id)
        
        if (_guild) {
            if (_guild.roles.defaultRoles.size > 0) {
                for (const _role of _guild.roles.defaultRoles.values()) {
                    try {
                        if (!_role.get.deleted) member.roles.add(_role.get)
                    } catch(err) {
                        console.error('Error: Member join set default role failed: \n' + err)
                    }
                }
            }
            console.debug(2)

            if (player instanceof Player) {
                const member = await _guild.member(player.id)
                const _channel = _guild.channels.welcomeChannel
                console.debug(member, _channel)
                if (_channel instanceof _TextChannel && member instanceof GuildMember) {
                console.debug(4)
                _channel.get.send({content: `${player.mention()} 欢迎加入`, embeds: [await player.infoEmbed(member)]})
                }
            }
        }
    }
}