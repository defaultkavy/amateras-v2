import { ButtonInteraction } from "discord.js";
import Amateras from "../lib/Amateras";
import { _music_button_ } from '../lang.json'

export default async function music_dislike(interact: ButtonInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return

    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return
    const lang = _guild.lang
    
    const current = _guild.musicPlayer.queue[0]
    if (!current) return

    const playerMusic = await player.musics.add(current.music)
    const result = await playerMusic.setDislike()
    interact.deferUpdate()
    if (result === 100) {
        _guild.musicPlayer.notify.push(player, _music_button_.add_dislike[lang], 3000)
        return 
    } else {
        playerMusic.unsetDislike()
        _guild.musicPlayer.notify.push(player, _music_button_.remove_dislike[lang], 3000)
    }
}