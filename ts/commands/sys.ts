import { CommandInteraction } from "discord.js";
import Amateras from "../lib/Amateras";
import Wallet from "../lib/Wallet";

export default async function execute(interact: CommandInteraction, amateras: Amateras) {
    interact.deferReply({ephemeral: true})
    if (interact.user !== amateras.system.admin)
        return interact.followUp({content: '仅限系统管理员使用', ephemeral: true})
    const admin = interact.user
    for (const subcmd0 of interact.options.data) {
        switch (subcmd0.name) {
            case 'player':
                if (subcmd0.options) {
                    for (const subcmd1 of subcmd0.options) {
                        switch (subcmd1.name) {
                            case 'aka':
                                let user, aka, reason: string;
                                for (const subcmd2 of subcmd1.options!) {
                                    switch (subcmd2.name) {
                                        case 'user':
                                            user = <string>subcmd2.value
                                            break;
                                        case 'content':
                                            aka = <string>subcmd2.value
                                            break;
                                        case 'reason':
                                            reason = <string>subcmd2.value
                                        break;
                                    }
                                }
                                if (!user) return
                                const player = await amateras.players.fetch(user)
                                if (player === 404) return
                                const lastAka = player.aka
                                player!.aka = aka ? aka : null
                                await player!.save()
                                const target = interact.guild?.members.cache.get(player!.id)
                                interact.followUp({ content: `${admin} 修改了 ${target} 的称号：${lastAka ? lastAka : '无'} => ${aka}${reason! ? '\n> ' + reason! : ''}` })
                            break;
                        }
                    }
                } else {
                    interact.followUp({ content: '请选择输入选项。', ephemeral: true })
                }
                break;
            case 'coin': 
                for(const subcmd1 of subcmd0.options!) {
                    switch (subcmd1.name) {
                        case 'set':
                            let wallet: Wallet | undefined, amount: number | undefined, reason: string | undefined
                            for (const subcmd2 of subcmd1.options!) {
                                switch (subcmd2.name) {
                                    case 'user': 
                                        if (subcmd2.value && typeof subcmd2.value === 'string') {
                                            const receiver = await amateras.players.fetch(subcmd2.value)
                                            if (receiver === 404) return
                                            const fetch = await amateras.wallets.fetch(receiver.wallets[0].id)
                                            if (!fetch) {
                                                console.error(`Wallet not exist. `)
                                                interact.followUp({ content: '命令无法使用：Wallet 不存在。', ephemeral: true })
                                                return
                                            }
                                            wallet = fetch
                                        }
                                    break;
                                    case 'amount':
                                            amount = <number>subcmd2.value
                                    break;
                                    case 'reason':
                                            reason = <string>subcmd2.value
                                    break;
                                }
                            }
                            const lastBalance = wallet!.balance
                            if (!amount) {
                                amount! = 0
                            } else if (amount <= 0) {
                                interact.followUp({ content: `请输入有效数字。`, ephemeral: true })
                                return
                            }
                            if (!wallet) return
                            wallet.balance = amount
                            wallet.save()
                            const target = interact.guild?.members.cache.get(wallet!.owner.id)
                            interact.followUp({ content: `${admin} 修改了 ${target} 的资产：${lastBalance}G => ${wallet.balance}G${reason ? '\n' + reason : ''}`, ephemeral: false })
                        break;
                    }
                }
            break;

            case 'v':
                if (!subcmd0.options) return
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'set':
                            if (!subcmd1.options) return
                            let user: string | undefined, role: string | undefined, enable: boolean | undefined
                            for (const subcmd2 of subcmd1.options) {
                                switch (subcmd2.name) {
                                    case 'user':
                                        user = <string>subcmd2.value
                                    break;
                                    case 'role':
                                        role = <string>subcmd2.value
                                    break;
                                    case 'enable':
                                        enable = <boolean>subcmd2.value
                                    break;
                                }
                            }
                            if (user) {
                                // For user permission
                                const player = await amateras.players.fetch(user)
                                if (player === 404) return interact.followUp({content: `Error: Player fetch failed`})
                                // Check parameter Enable filled / No -> followUp permission status
                                if (enable === undefined) {
                                    return interact.followUp({content: `${player.mention()} V 状态为 ${ player.v ? '开' : '关'}`, ephemeral: true})
                                }
                                // Check if permission not change
                                if (enable) {
                                    const set = await player.setVTuber()
                                    if (set === 101) return interact.followUp({content: `${player.mention()} VTuber 状态保持为：${enable ? '开' : '关'}`, ephemeral: true})
                                    if (set === 102) return interact.followUp({content: `Error: Player fetch failed`, ephemeral: true})
                                } else if (enable === false && await player.unsetVTuber() === 101)
                                    return interact.followUp({content: `${player.mention()} V 状态保持为：${enable ? '开' : '关'}`, ephemeral: true})
                                // followUp permission change message
                                return interact.followUp({content: `${player.mention()} V 状态更改为：${enable ? '开' : '关'}`, ephemeral: true})
                            }
                            if (role) {
                                if (!interact.guildId) return interact.followUp({content: `\`role 参数只能在伺服器中使用\``, ephemeral: true})
                                const _guild = amateras.guilds.cache.get(interact.guildId)
                                if (!_guild) return interact.followUp({content: 'Error: Guild is not cached', ephemeral: true})
                                const _role = await _guild.roles.fetch(role)
                                if (_role === 404) return interact.followUp({content: `Error: Role fetch failed`})
                                if (enable === undefined) {
                                    return interact.followUp({content: `${ _role.mention() } V 状态为：${_guild.commands.cache.get('mod')?.hasPermission(role) ? '开' : '关'}`, ephemeral: true})
                                }
                                let status = { success: 0, failed: 0, preserve: 0}
                                if (enable) {
                                    const result = await _role.setVTuber()
                                    for (const id in result) {
                                        if (result[id] === 100) status.success += 1
                                        if (result[id] === 101) status.preserve += 1
                                        if (result[id] === 102) status.failed += 1
                                    }
                                } 
                                else if (enable === false) {
                                    const result = await _role.unsetVTuber()
                                    for (const id in result) {
                                        if (result[id] === 100) status.success += 1
                                        if (result[id] === 101) status.preserve += 1
                                    }
                                }
                                if (status.failed > 0 || status.preserve > 0) {
                                    return interact.followUp({ content: `${ _role.mention() } V 状态变更结果：\`\`\`py\n成功：${status.success}\n失败：${status.failed}\n保持：${status.preserve}\`\`\``, ephemeral: true})
                                }
                                return interact.followUp({content: `${ _role.mention() } V 状态更改为：${enable ? '开' : '关'}`, ephemeral: true})
                            }
                        // User and Role part is not filled
                        return interact.followUp({content: '请选择目标', ephemeral: true})
                            
                        break;
                    }
                }
            break;
    
            }
        }
}