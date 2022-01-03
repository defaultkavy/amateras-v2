import { ButtonInteraction } from "discord.js"
import Amateras from "../lib/Amateras"

export default async function lobby_close(interact: ButtonInteraction, amateras: Amateras) {
    try {
        interact.deferReply({ephemeral: true})
        if (!interact.guild) return
        const _guild = amateras.guilds.cache.get(interact.guild.id)
        if (!_guild) return console.error('_guild is' + _guild)
        if (!_guild.lobby.enabled) return interact.followUp({content: '房间系统尚未开启', ephemeral: true})

        const lobby = await _guild.lobby.fetch(interact.user.id)
        if (lobby === 101 || lobby === 404) return interact.followUp({content: '房间不存在。', ephemeral: true})
        await lobby.close()
        interact.followUp({content: '房间已关闭~', ephemeral: true})
        _guild.log.send(`${await _guild.log.name(interact.user.id)} 关闭了房间`)
        
    } catch (err) {
        console.debug(err)
    }
}