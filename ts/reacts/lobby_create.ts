import { ButtonInteraction } from "discord.js"
import Amateras from "../lib/Amateras"

export default async function lobby_create(interact: ButtonInteraction, amateras: Amateras) {
    try {
        interact.deferReply({ephemeral: true})
        if (!interact.guild) return
        const _guild = amateras.guilds.cache.get(interact.guild.id)
        if (!_guild) return console.error('_guild is' + _guild)
    
        if (!_guild.lobby.enabled) return interact.followUp({content: '房间系统尚未开启', ephemeral: true})
        const lobby = _guild.lobby.cache.get(interact.user.id)
        if (lobby && lobby.state === 'OPEN') {
            interact.followUp({content: '你只能创建一个房间！', ephemeral: true})
            return
        }
        const createLobby = await _guild.lobby.create(interact.user.id)
        if (createLobby === 101) {
            interact.followUp({content: '你需要权限', ephemeral: true})
        } else {
            interact.followUp({content: `房间已创建！点击这里跳转到你的房间：${createLobby.textChannel}`, ephemeral: true})
        }
    } catch (err) {
        console.error(err)
    }
}