import { CommandInteraction, TextChannel } from "discord.js";
import Amateras from "../lib/Amateras";
import { Lobby } from "../lib/Lobby";

export default async function invite(interact: CommandInteraction, amateras: Amateras) {
    let lobby: Lobby | undefined
    if (interact.guild) {
        const guild = amateras.guilds.cache.get(interact.guild.id)
        if (guild) {
            lobby = await guild.lobby?.fetch(interact.user.id)
        } else return
    }
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
    if (!lobby) return interact.reply({ content: '你没有创建房间', ephemeral: true })
    await lobby.addMember(userId)
    interact.reply({ content: '已邀请', ephemeral: true })
}