import { ButtonInteraction, Message } from "discord.js";
import Amateras from "../lib/Amateras";

export default async function music_play(interact: ButtonInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return

    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return

    const member = await interact.guild.members.fetch(interact.user.id)
    if (!member) return
    if (!member.voice.channel) return interact.reply({content: `你必须在一个语音频道内`, ephemeral: true})
    
    if (_guild.musicPlayer.state === 'PLAYING') return interact.reply({content: `正在播放中`, ephemeral: true})
    if (_guild.musicPlayer.state === 'STOPPED') {
        interact.deferUpdate()
        console.time('random')
        await _guild.musicPlayer.random(player, member.voice.channel)
        console.timeEnd('random')
        console.time('play')
        _guild.musicPlayer.control.play()
        console.timeEnd('play')
        _guild.musicPlayer.notify.push(player, `随机播放`, 3000)
        
    }
    if (_guild.musicPlayer.state === 'PAUSE') {
        interact.deferUpdate()
        await _guild.musicPlayer.control.resume()
        _guild.musicPlayer.notify.push(player, `继续播放`, 3000)
    }
}