import { ButtonInteraction } from "discord.js"
import Amateras from "../lib/Amateras"

export default async function lobby_close(interact: ButtonInteraction, amateras: Amateras) {
    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return console.error('_guild is' + _guild)

    const lobby = await _guild.lobby!.fetch(interact.user.id)
    if (lobby === 101 || lobby === 404) return interact.reply({content: '房间不存在。', ephemeral: true})
    await lobby.close()
    interact.reply({content: '房间已关闭~', ephemeral: true})
}