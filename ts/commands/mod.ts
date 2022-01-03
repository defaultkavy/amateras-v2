import { CommandInteraction, TextChannel } from 'discord.js';
import Amateras from '../lib/Amateras';
import { equalOneOf } from '../lib/terminal';
import { _TextChannel } from '../lib/_TextChannel';

export default execute
async function execute(interaction: CommandInteraction, amateras: Amateras) {
    const subcmd0 = interaction.options.data[0]
    const _guild = amateras.guilds.cache.get(interaction.guild!.id)
    if (!_guild) return interaction.reply({ content: 'Unknown _Guild', ephemeral: true })
    // Get moderator player profile
    const moderator = await amateras.players.fetch(interaction.user.id)
    if (moderator === 404) return interaction.reply({content: `管理员不存在`, ephemeral: true})
    // Check is moderator
    if (!_guild.moderators.includes(moderator.id)) return interaction.reply({content: `你不是管理员`, ephemeral: true})
    switch (subcmd0.name) {
        case 'lobby':
            if (!subcmd0.options) return
            const lobbyChannel = interaction.channel
            if (!lobbyChannel || lobbyChannel.type !== 'GUILD_TEXT') return interaction.reply({ content: 'Error: Channel is not GUILD_TEXT'})
            if (!_guild) return
            for (const subcmd1 of subcmd0.options) {
                switch (subcmd1.name) {
                    case 'set':
                        // Check sub-command is filled
                        if (subcmd1.options) {
                            const value = {enable: false}
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'enable':
                                        value.enable = <boolean>subcmd2.value
                                    break;
                                }
                            }
                            if (value.enable === true) {
                                if (await _guild.lobby.setup(lobbyChannel) === 101) {
                                    interaction.reply({ content: `此频道房间模式保持为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                } else {
                                    interaction.reply({ content: `此频道房间模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                }
                            } else if (value.enable === false) {
                                const unset = await _guild.lobby.unset(lobbyChannel)
                                if (unset === 101) {
                                    interaction.reply({ content: `当前没有设立的房间频道`, ephemeral: true })
                                } else if (unset === 102) {
                                    interaction.reply({ content: `此频道不是房间频道`, ephemeral: true })
                                }else {
                                    interaction.reply({ content: `此频道房间模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                }
                            }
                        } else {
                            if (!_guild.lobby.channel) {
                                interaction.reply({ content: `房间模式：关`, ephemeral: true })
                            } else {
                                if (_guild.lobby.channel) return interaction.reply({ content: `房间模式：开，${_guild.lobby.channel}`, ephemeral: true })
                                interaction.reply({ content: `房间模式：开`, ephemeral: true })
                            }
                            
                        }
                        
                    break;
                    case 'permission':
                        if (!subcmd1.options) return
                        if (!_guild?.lobby) return
                        const value: {user?: string, role?: string, enable?: boolean} = {
                            user: undefined,
                            role: undefined,
                            enable: undefined
                        }
                        for (const subcmd2 of subcmd1.options) {
                            switch (subcmd2.name) {
                                case 'user':
                                    value.user = <string>subcmd2.value
                                break;
                                case 'role':
                                    value.role = <string>subcmd2.value
                                break;
                                case 'enable':
                                    value.enable = <boolean>subcmd2.value
                                break;
                            }
                        }
                        if (value.user) {
                            const player = await amateras.players.fetch(value.user)
                            if (player === 404) return interaction.reply({content: 'Error: Player fetch failed'})
                            if (value.enable === undefined) {
                                interaction.reply({ content: `${player.mention()}创建房间权限：${_guild.lobby.permissions.includes(value.user) ? '开' : '关'}`, ephemeral: true })
                            } else {
                                if (value.enable === true) {
                                    if (await _guild.lobby.permissionAdd(value.user) === 101)
                                        return interaction.reply({ content: `${player.mention()}创建房间权限保持为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                } else {
                                    if (await _guild.lobby.permissionRemove(value.user) === 101)
                                        return interaction.reply({ content: `${player.mention()}创建房间权限保持为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                }
                                interaction.reply({ content: `${player.mention()}创建房间权限更改为：${_guild.lobby.permissions.includes(value.user) ? '开' : '关'}`, ephemeral: true })
                            }
                        }
                        if (value.role) {
                            const _role = await _guild.roles.fetch(value.role)
                            if (_role === 404) return interaction.reply({content: 'Error: Role fetch failed'})
                            if (value.enable === undefined) {
                                interaction.reply({ content: `${_role.mention()}创建房间权限：${_guild.lobby.permissions.includes(value.role) ? '开' : '关'}`, ephemeral: true })
                            } else {
                                if (value.enable === true) {
                                    if (await _guild.lobby.permissionAdd(value.role) === 101)
                                        return interaction.reply({ content: `${_role.mention()}创建房间权限保持为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                } else {
                                    if (await _guild.lobby.permissionRemove(value.role) === 101)
                                        return interaction.reply({ content: `${_role.mention()}创建房间权限保持为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                }
                                interaction.reply({ content: `${_role.mention()}创建房间权限更改为：${_guild.lobby.permissions.includes(value.role) ? '开' : '关'}`, ephemeral: true })
                            }
                        }
                    break;

                    case "close":
                        if (!subcmd1.options) return interaction.reply({content: `请输入必要参数`, ephemeral: true})
                        const value3 = { user: '' }
                        for (const subcmd2 of subcmd1.options) {
                            switch (subcmd2.name) {
                                case "user":
                                    value3.user = <string>subcmd2.value
                                break;
                            }
                        }
                        if (!value3.user) return interaction.reply({content: `对象不存在`, ephemeral: true})
                        else {
                            const player = await amateras.players.fetch(value3.user)
                            if (player === 404) return interaction.reply({content: `Error: Player fetch failed`})
                            else {
                                const lobby = await _guild.lobby.fetch(value3.user)
                                if (lobby === 404 || lobby === 101) return interaction.reply({content: `房间不存在`, ephemeral: true})
                                else await lobby.close()
                                interaction.reply({content: `${player.mention()} 房间已关闭`, ephemeral: true})
                                _guild.log.send(`${await _guild.log.name(moderator.id)} 关闭了 ${await _guild.log.name(player.id)} 的房间`, true)
                            }
                        }
                    break;
                }
            }
        break;

        case 'forum':
            if (!subcmd0.options) return
            // Check channel is text channel
            const forumChannel = interaction.channel
            if (!forumChannel || forumChannel.type !== 'GUILD_TEXT') return interaction.reply({ content: 'Error: Channel is not GUILD_TEXT'})
            if (!_guild) return
            for (const subcmd1 of subcmd0.options) {
                switch (subcmd1.name) {
                    case 'set':
                        // Check sub-command is filled
                        if (subcmd1.options) {
                            const value = {enable: false}
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'enable':
                                        value.enable = <boolean>subcmd2.value
                                    break;
                                }
                            }
                            if (value.enable === true) {
                                if (await _guild.forums.create(forumChannel) === 101) {
                                    interaction.reply({ content: `此频道论坛模式保持为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                } else {
                                    interaction.reply({ content: `此频道论坛模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                }
                            } else if (value.enable === false) {
                                const forum = await _guild.forums.fetch(forumChannel.id)
                                if (forum === 404 || forum.state === 'CLOSED') {
                                    interaction.reply({ content: `此频道论坛模式保持为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                } else {
                                    await forum.close()
                                    interaction.reply({ content: `此频道论坛模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                }
                            }
                        } else {
                            const forum = await _guild.forums.fetch(forumChannel.id)
                            if (forum === 404 || forum.state === 'CLOSED') {
                                interaction.reply({ content: `此频道论坛模式：关`, ephemeral: true })
                            } else {
                                interaction.reply({ content: `此频道论坛模式：开`, ephemeral: true })
                            }
                            
                        }
                        
                    break;
                }
            }
        break;
        
        case 'music':
            if (!subcmd0.options) return
            const channel = interaction.channel
            if (!channel || channel.type !== 'GUILD_TEXT') return interaction.reply({ content: 'Error: Channel is not GUILD_TEXT'})
            if (!_guild) return
            for (const subcmd1 of subcmd0.options) {
                switch (subcmd1.name) {
                    case 'set':
                        // Check sub-command is filled
                        if (subcmd1.options) {
                            const value = {enable: false}
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'enable':
                                        value.enable = <boolean>subcmd2.value
                                    break;
                                }
                            }
                            if (value.enable === true) {
                                if (await _guild.musicPlayer.setup(channel) === 101) {
                                    interaction.reply({ content: `此频道音乐模式保持为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                } else {
                                    interaction.reply({ content: `此频道音乐模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                }
                            } else if (value.enable === false) {
                                const unset = await _guild.musicPlayer.unset(channel)
                                if (unset === 101) {
                                    interaction.reply({ content: `当前没有设立的音乐频道`, ephemeral: true })
                                } else if (unset === 102) {
                                    interaction.reply({ content: `此频道不是音乐频道`, ephemeral: true })
                                }else {
                                    interaction.reply({ content: `此频道音乐模式更改为：${value.enable ? '开' : '关'}`, ephemeral: true })
                                }
                            }
                        } else {
                            if (!_guild.musicPlayer.channel) {
                                interaction.reply({ content: `音乐模式：关`, ephemeral: true })
                            } else {
                                if (_guild.musicPlayer.channel) return interaction.reply({ content: `音乐模式：开，${_guild.musicPlayer.channel}`, ephemeral: true })
                                interaction.reply({ content: `音乐模式：开`, ephemeral: true })
                            }
                            
                        }
                        
                    break;
                }
            }
        break;
        case 'message':
            if (!subcmd0.options) return
            for (const subcmd1 of subcmd0.options) {
                switch (subcmd1.name) {
                    case 'delete':
                        if (!subcmd1.options) return;
                        let amount: number = 1
                        for (const subcmd2 of subcmd1.options) {
                            switch (subcmd2.name) {
                                case 'amount':
                                    amount = <number>subcmd2.value
                                break;
                            }
                        }
                        if (amount < 1 || amount > 100) {
                            interaction.reply({ content: '请输入大于1且小于100的数字', ephemeral: true })
                        } else {
                            (<TextChannel>interaction.channel).bulkDelete(amount)
                        }
                        interaction.reply({ content: '已删除完毕', ephemeral: true })
                        
                    break;
                }
            }
        break;
        
        case 'permission':
            if (!subcmd0.options) return
            var user: string | undefined, role: string | undefined, enable: boolean | undefined
            for (const subcmd1 of subcmd0.options) {
                switch (subcmd1.name) {
                    case 'user':
                        user = <string>subcmd1.value
                    break;
                    case 'role':
                        role = <string>subcmd1.value
                    break;
                    case 'enable':
                        enable = <boolean>subcmd1.value
                    break;
                }
            }
            if (user) {
                // For user permission
                const player = await amateras.players.fetch(user)
                if (player === 404) return 
                // Check parameter Enable filled / No -> Reply permission status
                if (enable === undefined) {
                    return interaction.reply({content: `${player.mention()} mod 权限：${_guild.commands.cache.get('mod')?.hasPermission(user) ? '开' : '关'}`, ephemeral: true})
                }
                // Block who are not guild owner to use change permission function
                if (interaction.user.id !== _guild.get.ownerId) return interaction.reply({content: `此功能仅限伺服器所有者使用`, ephemeral: true})
                // Check if permission not change
                if (enable) {
                    const set = await _guild.setModerator(user, 'USER')
                    if (equalOneOf(set, [101, 102, 405, 404])) return interaction.reply({content: `Error: Setting failed`, ephemeral: true})
                    // Check if nothing change
                    if (set === 105) return interaction.reply({content: `${player.mention()} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true})
                } else if (enable === false) {
                    const set = await _guild.removeModerator(user, 'USER')
                    if (equalOneOf(set, [101, 102, 405, 404])) return interaction.reply({content: `Error: Setting failed`, ephemeral: true})
                    if (set === 105) return interaction.reply({content: `${player.mention()} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true})
                }
                // Reply permission change message
                return interaction.reply({content: `${player.mention()} mod 权限更改为：${enable ? '开' : '关'}`, ephemeral: true})
            }
            if (role) {
                const _role = await _guild.roles.fetch(role)
                if (_role === 404) return interaction.reply({content: `Error: Role fetch failed`, ephemeral: true})
                if (enable === undefined) {
                    return interaction.reply({content: `${_role.mention} mod 权限更改为：${_guild.commands.cache.get('mod')?.hasPermission(role) ? '开' : '关'}`, ephemeral: true})
                }
                if (interaction.user.id !== _guild.get.ownerId) return interaction.reply({content: `此功能仅限伺服器所有者使用`, ephemeral: true})
                
                if (enable) {
                    const set = await _guild.setModerator(role, 'ROLE')
                    if (equalOneOf(set, [101, 102, 405, 404])) return interaction.reply({content: `Error: Setting failed`, ephemeral: true})
                    if (set === 105) return interaction.reply({content: `${_role.mention} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true})
                }
                else if (enable === false) {
                    const set = await _guild.removeModerator(role, 'ROLE')
                    if (equalOneOf(set, [101, 102, 405, 404])) return interaction.reply({content: `Error: Setting failed`})
                    if (set === 105) return interaction.reply({content: `${_role.mention} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true})
                }
                return interaction.reply({content: `${_role.mention} mod 权限更改为：${enable ? '开' : '关'}`, ephemeral: true})
            }
            // User and Role part is not filled
            return interaction.reply({content: '请选择目标', ephemeral: true})
        break;

        case 'role':
            if (!subcmd0.options) return
            for (const subcmd1 of subcmd0.options) {
                if (!subcmd1.options) return
                switch (subcmd1.name) {
                    case 'default_role':
                        var role: string | undefined, enable: boolean | undefined
                        for (const subcmd2 of subcmd1.options) {
                            switch (subcmd2.name) {
                                case 'role':
                                    role = <string>subcmd2.value
                                break;
                                case 'enable':
                                    enable = <boolean>subcmd2.value
                                break;
                            }
                        }
                        
                        if (role) {
                            const _role = await _guild.roles.fetch(role)
                            if (_role === 404) return interaction.reply({content: `Error: Role fetch failed`})
                            if (enable === undefined) {
                                console.debug(_role.isDefaultRole)
                                return interaction.reply({content: `${_role.mention()} 默认身分组设定为：${_role.isDefaultRole ? '开' : '关'}`, ephemeral: true})
                            }
                            
                            if (enable) {
                                const set = await _guild.roles.setDefaultRole(role)
                                if (set === 101) return interaction.reply({content: `${_role.mention()} 默认身分组设定更改保持为：${enable ? '开' : '关'}`, ephemeral: true})
                                else if (set === 404) return interaction.reply({content: `Error: Setting failed`, ephemeral: true})
                            }
                            else if (enable === false) {
                                const set = await _guild.roles.unsetDefaultRole(role)
                                if (set === 101) return interaction.reply({content: `${_role.mention()} 默认身分组设定更改保持为：${enable ? '开' : '关'}`, ephemeral: true})
                                else if (set === 404) return interaction.reply({content: `Error: Setting failed`, ephemeral: true})
                            }
                            return interaction.reply({content: `${_role.mention()} 默认身分组设定更改更改为：${enable ? '开' : '关'}`, ephemeral: true})
                        }
                        // User and Role part is not filled
                        return interaction.reply({content: '请选择目标', ephemeral: true})
                    break;
                }
            }
        break;
        
        case 'channel':
            if (!subcmd0.options) return
            for (const subcmd1 of subcmd0.options) {
                switch (subcmd1.name) {
                    case 'welcome_channel':
                        const _channel = await _guild.channels.fetch(interaction.channelId)
                        if (!(_channel instanceof _TextChannel)) return interaction.reply({content: `Error: Channel fetch failed`, ephemeral: true})
                        if (subcmd1.options) {
                            var enable: boolean | undefined
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'enable':
                                        enable = <boolean>subcmd2.value
                                    break;
                                }
                            }
                            if (enable) {
                                const set = await _guild.channels.setWelcome(_channel.id)
                                if (set === 101) return interaction.reply({content: `${_channel.get} 欢迎频道设定更改保持为：${enable ? '开' : '关'}`, ephemeral: true})
                                else if (set === 404) return interaction.reply({content: `Error: Setting failed`, ephemeral: true})
                            }
                            else if (enable === false) {
                                const set = await _guild.channels.unsetWelcome(_channel.id)
                                if (set === 101) return interaction.reply({content: `${_channel.mention()} 欢迎频道设定更改保持为：${enable ? '开' : '关'}`, ephemeral: true})
                                else if (set === 404) return interaction.reply({content: `Error: Setting failed`, ephemeral: true})
                            }
                            return interaction.reply({content: `${_channel.mention()} 欢迎频道设定更改更改为：${enable ? '开' : '关'}`, ephemeral: true})
                        } else {
                            return interaction.reply({content: `${_channel.mention()} 欢迎频道设定更改为：${_channel.isWelcomeChannel ? '开' : '关'}`, ephemeral: true})
                        }
                    break;
                }
            }
        break;
    }
    
}