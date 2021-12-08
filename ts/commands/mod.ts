import { Channel, CommandInteraction, TextChannel } from 'discord.js';
import Amateras from '../lib/Amateras';
import { Player } from '../lib/Player';
import Wallet from '../lib/Wallet';

export default execute
async function execute(interaction: CommandInteraction, amateras: Amateras) {
    const options = interaction.options.data
    const _guild = amateras.guilds.cache.get(interaction.guild!.id)
    const moder = interaction.guild?.members.cache.get(interaction.user.id)
    switch (options[0].name) {
        case 'lobby':
            if (!options[0].options) return
            const lobbyChannel = interaction.channel
            if (!_guild) return
            for (const subcmd1 of options[0].options) {
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
            if (!options[0].options) return
            const forumChannel = interaction.channel
            if (!_guild) return
            for (const subcmd1 of options[0].options) {
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

        case 'vtuber':
            if (!options[0].options) return
            for (const subcmd1 of options[0].options) {
                switch (subcmd1.name) {
                    case 'set':
                        if (!subcmd1.options) return;
                        let userId: string = ''
                        for (const subcmd2 of subcmd1.options) {
                            switch (subcmd2.name) {
                                case 'user':
                                    if (typeof subcmd2.value === 'string') {
                                        userId = subcmd2.value
                                    }
                                break;
                            }
                        }
                        const player = await amateras.players.fetch(userId)
                        await player.setVTuber()
                        interaction.reply({ content: '设定完成', ephemeral: true })
                        
                    break;
                    case 'unset':
                        if (!subcmd1.options) return;
                        let userId_v: string = ''
                        for (const subcmd2 of subcmd1.options) {
                            switch (subcmd2.name) {
                                case 'user':
                                    if (typeof subcmd2.value === 'string') {
                                        userId_v = subcmd2.value
                                    }
                                break;
                            }
                        }
                        const player_v = await amateras.players.fetch(userId_v)
                        await player_v.unsetVTuber()
                        interaction.reply({ content: '设定完成', ephemeral: true })
                        
                    break;
                }
            }
        break;

        case 'message':
            if (!options[0].options) return
            for (const subcmd1 of options[0].options) {
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
    }
}