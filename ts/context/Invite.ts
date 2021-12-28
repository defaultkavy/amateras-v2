import { ContextMenuInteraction } from "discord.js";
import Amateras from "../lib/Amateras";

export default async function Invite(interact: ContextMenuInteraction, amateras: Amateras) {
    if (!interact.guild) return
    const _guild = amateras.guilds.cache.get(interact.guild.id)
    if (!_guild) return
    if (!_guild.lobby) {
        return
    }

    const lobby = await _guild.lobby.fetch(interact.user.id)
    if (lobby === 101 || lobby === 404) return interact.reply({ content: '你还没创建房间！', ephemeral: true})
    if (lobby.state === 'OPEN') {
        if (lobby.member.has(interact.targetId)) {
            lobby.removeMember(interact.targetId)
            interact.reply({ content: (await _guild.get.members.fetch(interact.targetId)).displayName + '从你的房间成员名单移除了。', ephemeral: true})
            return
        } else {
            lobby.addMember(interact.targetId)
            interact.reply({ content: (await _guild.get.members.fetch(interact.targetId)).displayName + '加入了你的房间成员名单。', ephemeral: true})
            return
        }
    }
}