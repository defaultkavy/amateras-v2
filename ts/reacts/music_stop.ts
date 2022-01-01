import { ButtonInteraction } from "discord.js";
import Amateras from "../lib/Amateras";

export default async function music_stop(interact: ButtonInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return

    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return

    const member = await interact.guild.members.fetch(interact.user.id)
    if (!member) return
    if (!member.voice.channel) return interact.reply({content: `你必须在一个语音频道内`, ephemeral: true})
    
    if (_guild.musicPlayer.state === 'STOPPED') return interact.reply({content: `已停止`, ephemeral: true})
    interact.deferUpdate()
    await _guild.musicPlayer.control.stop()
    _guild.musicPlayer.notify.push(player, `停止播放`, 3000)
}