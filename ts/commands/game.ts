import { CommandInteraction, GuildMember, MessageMentions, TextChannel } from "discord.js";
import Amateras from "../lib/Amateras";
import { Player } from "../lib/Player";
import { reply } from "../lib/terminal";
import { _TextChannel } from "../lib/_TextChannel";

export default async function game(interact: CommandInteraction, amateras: Amateras) {
    
    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return reply(interact, 'guild not found')

    if (!interact.channel) return
    const _channel = await _guild.channels.fetch(interact.channelId)
    if (_channel === 404) return reply(interact, 'channel not found')

    const player = await amateras.players.fetch(interact.user.id)
    if (!(player instanceof Player)) return reply(interact, 'player not found')

    const member = await _guild.member(interact.user.id)
    if (!(member instanceof GuildMember)) return

    for (const subcmd0 of interact.options.data) {
        switch (subcmd0.name) {
            case 'choose':
                if (!_channel.isText()) return reply(interact, '你不在文字频道中')
                
                if (subcmd0.value === 'blackjack') {
                    const newGame = await _guild.games.start('Blackjack', _channel, player, member)
                    if (!newGame) return
                    newGame.init(interact)
                }
            break;
        }
    }
}