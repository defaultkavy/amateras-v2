import { CommandInteraction, GuildMember, MessageMentions, TextChannel } from "discord.js";
import Amateras from "../lib/Amateras";
import { Player } from "../lib/Player";
import { reply } from "../lib/terminal";
import { _TextChannel } from "../lib/_TextChannel";

export default async function blackjack(interact: CommandInteraction, amateras: Amateras) {
    
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

    if (!interact.channel || !interact.channel.isThread()) return reply(interact, '你不在游戏频道中')
    const gameChannel = _guild.games.channels.get(interact.channelId)
    if (!gameChannel) return reply(interact, '你不在游戏频道中')
    const game = gameChannel.game
    if (!game.isBlackjack()) return reply(interact, '这不是游戏21点的频道')

    for (const subcmd0 of interact.options.data) {
        switch (subcmd0.name) {
            
            case 'join': {
                if (game.guests.get(player.id)) return reply(interact, '你已入局')
                const bet = interact.options.data[0].options![0].value as number
                const gamePlayer = game.addGuest(player, member, bet)
                if (gamePlayer === 101) return reply(interact, '人数已满')
                else if (gamePlayer === 102) return reply(interact, '你已入局')
                interact.reply({content: `${member} 入局，赌注 ${bet}G`, allowedMentions: {parse: ['users']}})
                break;
            }
            case 'seek': {
                const gamePlayer = game.owner ? game.owner : game.guests.get(player.id)
                if (!gamePlayer) return reply(interact, '你未加入游戏')
                if (!game.started) return reply(interact, '庄主尚未发牌')
                interact.reply({embeds: [gamePlayer.cardsEmbed(false)], ephemeral: true})
                break;
            }
            case 'start': {
                if (game.owner.me !== player) return reply(interact, '你不是庄主')
                if (game.started) return reply(interact, '游戏已开局')
                game.start()
                interact.reply({content: `庄主已发牌，输入 \`/bj seek\` 看牌\n${game.guestList}`, allowedMentions: {parse: ['users']}})
                break;
            }
            case 'hit': {
                const gamePlayer = game.owner.me.id === player.id ? game.owner : game.guests.get(player.id)
                if (!gamePlayer) return reply(interact, '你未加入游戏')
                if (!game.started) return reply(interact, '游戏尚未开始')
                if (gamePlayer !== game.thisTurn) {
                    const nowMember = await _guild.member(interact.user.id)
                    return reply(interact, `现在是 ${nowMember} 的抽卡回合`)
                }
                const card = gamePlayer.getCard()
                if (card === 101) return reply(interact, '最多只能拥有5张牌')
                if (game._thread) game._thread.get.send({embeds: [gamePlayer.cardsEmbed(true)]})
                interact.reply({content: `${card.emoji}`, ephemeral: true})

                break;
            }
            case 'stand': {
                const gamePlayer = game.owner.me.id === player.id ? game.owner : game.guests.get(player.id)
                if (gamePlayer !== game.thisTurn && gamePlayer !== game.owner) return reply(interact, `只有庄主和当前抽卡回合的玩家可使用`)
                const skip = game.skip()
                if (skip === 101) return reply(interact, `游戏尚未开始`)
                else if (skip === 201) return interact.reply({content: ''})
                interact.reply({content: `轮到 ${game.thisTurn.member} 的抽卡回合`})
            }
        }
    }
}