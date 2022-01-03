import { CommandInteraction, TextChannel } from "discord.js";
import Amateras from "../lib/Amateras";
import { Lobby } from "../lib/Lobby";
import { _Guild } from "../lib/_Guild";

export default async function lobby(interact: CommandInteraction, amateras: Amateras) {
    let _guild: _Guild | undefined
    if (!interact.guild) return
    _guild = amateras.guilds.cache.get(interact.guild.id)

    if (!_guild) return
    const lobby = await _guild.lobby.fetch(interact.user.id)
    if (!(lobby instanceof Lobby)) return interact.reply({content: '你没有创建房间', ephemeral: true})
    const currentLobby = await _guild.lobby.fetchByCategory((<TextChannel>interact.channel).parent?.id!)

    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return interact.reply({content: `Error: Player fetch failed`, ephemeral: true})
    
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
                _guild.log.send(`${await _guild.log.name(interact.user.id)} 关闭了房间`)
                break;
            case 'invite':
                if (!subcmd0.options) {
                    interact.reply({content: '请输入必要参数。', ephemeral: true})
                    return
                }
                var userId = ''
                for (const subcmd1 of subcmd0.options) {
                    if (!subcmd1.value) return
                    switch (subcmd1.name) {
                        case 'user':
                            userId = <string>subcmd1.value
                        break;
                    }
                }
                var result = await lobby.addMember(userId) 
                if (result === 101) {
                    interact.reply({ content: '对象已在你的房间中', ephemeral: true })
                } else {
                    _guild.log.send(`${await _guild.log.name(interact.user.id)} 邀请 ${await _guild.log.name(userId)} 加入房间`)
                    if (lobby.textChannel && interact.channelId === lobby.textChannel.id) return interact.deferReply()
                    interact.reply({content: '已邀请', ephemeral: true})
                }
            break;
            case 'kick':
                if (!subcmd0.options) {
                    interact.reply({content: '请输入必要参数。', ephemeral: true})
                    return
                }
                var userId = ''
                for (const subcmd1 of subcmd0.options) {
                    if (!subcmd1.value) return
                    switch (subcmd1.name) {
                        case 'user':
                            userId = <string>subcmd1.value
                        break;
                    }
                }
                var result = await lobby.removeMember(userId)
                if (result === 101) {
                    interact.reply({ content: '对象不在你的房间中', ephemeral: true })
                } else {
                    _guild.log.send(`${await _guild.log.name(interact.user.id)} 将 ${await _guild.log.name(userId)} 移出房间`)
                    if (lobby.textChannel && interact.channelId === lobby.textChannel.id) return interact.deferReply()
                    interact.reply({ content: '已移除', ephemeral: true })
                }
            break;
            case 'exit':
                if (!currentLobby) return interact.reply({content: '你不在房间频道内', ephemeral: true})
                if (currentLobby.owner.id === interact.user.id) return interact.reply({content: '你无法退出自己创建的房间，请使用关闭房间请求', ephemeral: true})
                interact.reply({content: '正在退出', ephemeral: true})
                await currentLobby.removeMember(interact.user.id)
                _guild.log.send(`${await _guild.log.name(interact.user.id)} 退出了 ${await _guild.log.name(currentLobby.owner.id)} 房间`)
        }
    }
}