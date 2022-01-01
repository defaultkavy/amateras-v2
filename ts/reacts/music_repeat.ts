import { ButtonInteraction, Message } from "discord.js";
import Amateras from "../lib/Amateras";

export default async function music_repeat(interact: ButtonInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return

    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return

    const member = await interact.guild.members.fetch(interact.user.id)
    if (!member) return
    if (!member.voice.channel) return interact.reply({content: `你必须在一个语音频道内`, ephemeral: true})
    
    const result = _guild.musicPlayer.control.repeat()
    interact.deferUpdate()
    if (result === 'ALL') {
        _guild.musicPlayer.notify.push(player, `曲列循环`, 3000)
    } else if (result === 'ONE') {
        _guild.musicPlayer.notify.push(player, `单曲循环`, 3000)
    } else {
        _guild.musicPlayer.notify.push(player, `关闭循环`, 3000)
    }
}