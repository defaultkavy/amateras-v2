import { ButtonInteraction, Message } from "discord.js";
import Amateras from "../lib/Amateras";
import { _music_button_ } from '../lang.json'

export default async function music_play(interact: ButtonInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return

    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return
    const lang = _guild.lang
    const member = await interact.guild.members.fetch(interact.user.id)
    if (!member) return
    if (!member.voice.channel) return interact.reply({content: _music_button_.not_in_voice[lang], ephemeral: true})
    
    if (_guild.musicPlayer.state === 'PLAYING') return interact.reply({content: _music_button_.is_playing[lang], ephemeral: true})
    if (_guild.musicPlayer.state === 'STOPPED') {
        interact.deferUpdate()
        console.time('random')
        await _guild.musicPlayer.random(player, member.voice.channel)
        console.timeEnd('random')
        console.time('play')
        _guild.musicPlayer.control.play()
        console.timeEnd('play')
        _guild.musicPlayer.notify.push(player, _music_button_.shuffle[lang], 3000)
        
    }
    if (_guild.musicPlayer.state === 'PAUSE') {
        interact.deferUpdate()
        await _guild.musicPlayer.control.resume()
        _guild.musicPlayer.notify.push(player, _music_button_.resume[lang], 3000)
    }
    console.debug(_guild.musicPlayer.state)
}