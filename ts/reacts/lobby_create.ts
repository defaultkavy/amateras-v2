import { ButtonInteraction } from "discord.js"
import Amateras from "../lib/Amateras"

export default async function lobby_create(interact: ButtonInteraction, amateras: Amateras) {
    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return console.error('_guild is' + _guild)

    const lobby = _guild.lobby!.cache.get(interact.user.id)
    if (lobby && lobby.state === 'OPEN') {
        interact.reply({content: '你只能创建一个房间！', ephemeral: true})
        return
    }
    if (await _guild!.lobby!.create(interact.user.id) === 101) {
        interact.reply({content: '你需要权限', ephemeral: true})
    } else {
        interact.reply({content: '房间已创建！找找频道列表中有没有你的名字~', ephemeral: true})
    }
}