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
        interact.deferReply()
        await _guild.musicPlayer.random(player, member.voice.channel)
        _guild.musicPlayer.control.play()
        const reply = <Message>await interact.followUp({content: `随机播放`})
        setTimeout(() => {
            if (!reply.deleted) reply.delete()
        }, 3000);
    }
    if (_guild.musicPlayer.state === 'PAUSE') {
        await _guild.musicPlayer.control.resume()
        interact.deferUpdate()
    }
}