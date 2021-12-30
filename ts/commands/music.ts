import { CommandInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';
import { Music } from '../lib/Music';

export default async function execute(interact: CommandInteraction, amateras: Amateras) {
    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return

    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return

    const member = await interact.guild.members.fetch(interact.user.id)
    if (!member) return

    const channel = member.voice.channel
    if (!channel) return
    for (const subcmd0 of interact.options.data) {
        switch (subcmd0.name) {
            case 'play':
                if (!subcmd0.options) return
                var url = undefined
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'url':
                            url = <string>subcmd1.value
                        break;
                    }
                }
                if (!url) return
                
                const music = await amateras.musics.add(url)
                if (!(music instanceof Music)) return
                await _guild.musicPlayer.addSong({
                    music: music,
                    channel: channel,
                    player: player
                })
                _guild.musicPlayer.play()
                interact.reply('play')
            break;
            case 'next':
                _guild.musicPlayer.next()
                interact.reply('next')
            break;
            case 'prev':
                _guild.musicPlayer.prev()
                interact.reply('prev')
            break;
            case 'stop':
                _guild.musicPlayer.stop()
                interact.reply('stop')
            break;
            case 'random':
                await _guild.musicPlayer.random(player, channel)
                _guild.musicPlayer.play()
                interact.reply('random')
            break;
        }
    }
}