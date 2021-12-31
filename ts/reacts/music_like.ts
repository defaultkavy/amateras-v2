import { ButtonInteraction } from "discord.js";
import Amateras from "../lib/Amateras";

export default async function music_like(interact: ButtonInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return

    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return
    
    const current = _guild.musicPlayer.queue[0]
    if (!current) return interact.reply({content: `操作无效`, ephemeral: true})

    const playerMusic = await player.musics.add(current.music)
    const result = await playerMusic.setLike()
    interact.deferUpdate()
    if (result === 100) {
        _guild.musicPlayer.notify.add(player, '加入了收藏')
        return 
    } else {
        playerMusic.unsetLike()
        _guild.musicPlayer.notify.add(player, '从收藏中移除')
    }
}