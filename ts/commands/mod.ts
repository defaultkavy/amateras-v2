import { CommandInteraction, TextChannel } from 'discord.js';
import Amateras from '../lib/Amateras';

export default execute
async function execute(interaction: CommandInteraction, amateras: Amateras) {
    const subcmd0 = interaction.options.data[0]
    const _guild = amateras.guilds.cache.get(interaction.guild!.id)
    if (!_guild) return interaction.reply({ content: 'Unknown _Guild', ephemeral: true })

    switch (subcmd0.name) {
        case 'lobby':
            if (!subcmd0.options) return
            const lobbyChannel = interaction.channel
            if (!_guild) return
            for (const subcmd1 of subcmd0.options) {
                switch (subcmd1.name) {
                    case 'setup':
                        if (lobbyChannel && lobbyChannel.type === 'GUILD_TEXT') {
                            _guild.setupLobbyManager(lobbyChannel)
                            interaction.reply({ content: '房间频道设定完成', ephemeral: true })
                        } else {
                            interaction.reply({ content: '错误：必须是文字频道', ephemeral: true })
                        }
                    break;
                    case 'unset':
                        if (await _guild.closeLobbyManager() === 100) {
                            interaction.reply({ content: '房间系统已关闭', ephemeral: true })
                        } else {
                            interaction.reply({ content: '错误：房间系统未开启', ephemeral: true })
                        }
                    break;
                    case 'permission':
                        if (!subcmd1.options) return
                        if (!_guild?.lobby) return
                        let role = ''
                        let boolean = null
                        for (const subcmd2 of subcmd1.options) {
                            switch (subcmd2.name) {
                                case 'role':
                                    role = <string>subcmd2.value
                                break;
                                case 'switch':
                                    boolean = <boolean>subcmd2.value
                                break;
                            }
                        }
                        if (boolean === null) {
                            interaction.reply({ content: `${_guild.get.roles.cache.get(role)}创建房间权限：${_guild?.lobby.permissions.includes(role) ? '开' : '关'}`, ephemeral: true })
                        } else if (boolean === true) {
                            await _guild?.lobby.permissionAdd(role)
                            interaction.reply({ content: `${_guild.get.roles.cache.get(role)}开启创建房间权限`, ephemeral: true })
                        } else if (boolean === false) {
                            await _guild?.lobby.permissionRemove(role)
                            interaction.reply({ content: `${_guild.get.roles.cache.get(role)}关闭创建房间权限`, ephemeral: true })
                        }
                    break;
                }
            }
        break;

        case 'forum':
            if (!subcmd0.options) return
            const forumChannel = interaction.channel
            if (!_guild) return
            for (const subcmd1 of subcmd0.options) {
                switch (subcmd1.name) {
                    case 'setup':
                        if (forumChannel && forumChannel.type === 'GUILD_TEXT') {
                            if (await _guild.forums?.create(forumChannel) === 101) {
                                interaction.reply({ content: '错误：此频道论坛模式未关闭', ephemeral: true })
                            } else {
                                interaction.reply({ content: '论坛模式已开启', ephemeral: true })
                            }
                        } else {
                            interaction.reply({ content: '错误：必须是文字频道', ephemeral: true })
                        }
                    break;
                    case 'unset':
                        if (forumChannel && forumChannel.type === 'GUILD_TEXT') {
                            if (await _guild.forums?.closeForum(forumChannel) === 101) {
                                interaction.reply({ content: '错误：此频道论坛模式未开启', ephemeral: true })
                            } else {
                                interaction.reply({ content: '论坛模式已关闭', ephemeral: true })
                            }
                        } else {
                            interaction.reply({ content: '错误：必须是文字频道', ephemeral: true })
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
            let user: string | undefined, role: string | undefined, enable: boolean | undefined
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
                if (enable && await _guild?.commands.cache.get('mod')?.permissionEnable(user, 'USER') === 105) {
                    return interaction.reply({content: `${player.mention()} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true})
                } else if (enable === false && await _guild?.commands.cache.get('mod')?.permissionDisable(user, 'USER') === 105)
                    return interaction.reply({content: `${player.mention()} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true})
                // Reply permission change message
                return interaction.reply({content: `${player.mention()} mod 权限更改为：${enable ? '开' : '关'}`, ephemeral: true})
            }
            if (role) {
                const _role = await _guild?.roles.fetch(role)
                if (_role === 404) return interaction.reply({content: `Error: Role fetch failed`})
                if (enable === undefined) {
                    return interaction.reply({content: `${_role.mention} mod 权限更改为：${_guild.commands.cache.get('mod')?.hasPermission(role) ? '开' : '关'}`, ephemeral: true})
                }
                if (interaction.user.id !== _guild.get.ownerId) return interaction.reply({content: `此功能仅限伺服器所有者使用`, ephemeral: true})
                if (enable && await _guild?.commands.cache.get('mod')?.permissionEnable(role, 'ROLE') === 105) 
                    return interaction.reply({content: `${_role.mention} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true})
                else if (enable === false && await _guild?.commands.cache.get('mod')?.permissionDisable(role, 'ROLE') === 105)
                    return interaction.reply({content: `${_role.mention} mod 权限保持为：${enable ? '开' : '关'}`, ephemeral: true})
                return interaction.reply({content: `${_role.mention} mod 权限更改为：${enable ? '开' : '关'}`, ephemeral: true})
            }
            // User and Role part is not filled
            return interaction.reply({content: '请选择目标', ephemeral: true})
        break;

    }
    
}