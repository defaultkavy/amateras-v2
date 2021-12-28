import { CommandInteraction, TextChannel } from "discord.js";
import Amateras from "../lib/Amateras";
import { Lobby } from "../lib/Lobby";
import { _Guild } from "../lib/_Guild";

export default async function lobby(interact: CommandInteraction, amateras: Amateras) {
    let lobby: Lobby | 101 | 404
    let currentLobby: Lobby | undefined
    let _guild: _Guild | undefined
    if (!interact.guild) return
    _guild = amateras.guilds.cache.get(interact.guild.id)

    if (!_guild) return
    lobby = await _guild.lobby?.fetch(interact.user.id)

    if (lobby === 101 || lobby === 404) return interact.reply({content: '你没有创建房间', ephemeral: true})
    currentLobby = await _guild.lobby?.fetchByCategory((<TextChannel>interact.channel).parent?.id!)
    
    for (const subcmd0 of interact.options.data) {
        switch (subcmd0.name) {
            case 'create':
                if (lobby && lobby.state === 'OPEN') {
                    interact.reply({content: '你只能创建一个房间！', ephemeral: true})
                    return
                }
                if (await _guild!.lobby!.create(interact.user.id) === 101) {
                    interact.reply({content: '你需要权限', ephemeral: true})
                } else {
                    interact.reply({content: '房间已创建！找找频道列表中有没有你的名字~', ephemeral: true})
                }
            break;
            case 'close':
                await lobby?.close()
                interact.reply({content: '房间已关闭', ephemeral: true})
                break;
            case 'invite':
                if (!subcmd0.options) {
                    interact.reply({content: '请输入必要参数。', ephemeral: true})
                    return
                }
                let userId = ''
                for (const subcmd1 of subcmd0.options) {
                    if (!subcmd1.value) return
                    switch (subcmd1.name) {
                        case 'user':
                            userId = <string>subcmd1.value
                        break;
                    }
                }
                await lobby.addMember(userId)
                interact.reply({content: '已邀请', ephemeral: true})
            break;
            case 'exit':
                if (!currentLobby) return interact.reply({content: '你不在房间频道内', ephemeral: true})
                interact.reply({content: '正在退出', ephemeral: true})
                await currentLobby.removeMember(interact.user.id)
        }
    }
}