import { CommandInteraction, TextChannel } from "discord.js";
import Amateras from "../lib/Amateras";
import { Lobby } from "../lib/Lobby";

export default async function invite(interact: CommandInteraction, amateras: Amateras) {
    let lobby: Lobby | 101 | 404
    if (!interact.guild) return
    const guild = amateras.guilds.cache.get(interact.guild.id)
    if (!guild) return
    lobby = await guild.lobby?.fetch(interact.user.id)
    if (lobby === 101 || lobby === 404) return interact.reply({ content: '你没有创建房间', ephemeral: true })
    if (!interact.options.data) {
        interact.reply({ content: '请输入必要参数。', ephemeral: true })
        return
    }
    let userId = ''
    for (const subcmd1 of interact.options.data) {
        if (!subcmd1.value) return
        switch (subcmd1.name) {
            case 'user':
                userId = <string>subcmd1.value
                break;
        }
    }
    await lobby.addMember(userId)
    interact.reply({ content: '已邀请', ephemeral: true })
}