import { ButtonInteraction } from "discord.js";
import Amateras from "../lib/Amateras";
import { _music_button_ } from '../lang.json'

export default async function music_stop(interact: ButtonInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return

    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return
    const lang = _guild.lang

    const member = await interact.guild.members.fetch(interact.user.id)
    if (!member) return
    if (!member.voice.channel) return interact.reply({content: _music_button_.not_in_voice[lang], ephemeral: true})
    
    if (_guild.musicPlayer.state === 'STOPPED') return interact.reply({content: _music_button_.is_stoped[lang], ephemeral: true})
    interact.deferUpdate()
    await _guild.musicPlayer.control.stop()
    _guild.musicPlayer.notify.push(player, _music_button_.stop[lang], 3000)
}