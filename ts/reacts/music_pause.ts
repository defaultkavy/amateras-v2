import { ButtonInteraction } from "discord.js";
import Amateras from "../lib/Amateras";

export default async function music_pause(interact: ButtonInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return

    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return

    const member = await interact.guild.members.fetch(interact.user.id)
    if (!member) return
    if (!member.voice.channel) return interact.reply({content: `你必须在一个语音频道内`, ephemeral: true})
    
    if (_guild.musicPlayer.state === 'STOPPED') return interact.reply({content: `停止状态无法使用暂停`, ephemeral: true})
    if (_guild.musicPlayer.state === 'PLAYING') {
        await _guild.musicPlayer.pause()
        interact.deferUpdate()
    }
}