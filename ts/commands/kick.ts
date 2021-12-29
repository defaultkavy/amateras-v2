import { CommandInteraction, TextChannel } from "discord.js";
import Amateras from "../lib/Amateras";

export default async function kick(interact: CommandInteraction, amateras: Amateras) {
    if (!interact.guild) return
    const guild = amateras.guilds.cache.get(interact.guild.id)
    if (!guild) return
    const lobby = await guild.lobby?.fetch(interact.user.id)
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
    const result = await lobby.removeMember(userId)
    if (result === 101) {
        interact.reply({ content: '对象不在你的房间中', ephemeral: true })
    } else {
        guild.log.send(`${await guild.log.name(interact.user.id)} 将 ${await guild.log.name(userId)} 移出房间`)
        interact.reply({ content: '已移除', ephemeral: true })
    }
}