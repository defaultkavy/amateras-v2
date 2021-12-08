import { CommandInteraction } from "discord.js";
import Amateras from "../lib/Amateras";
import { Player } from "../lib/Player";
import Wallet from "../lib/Wallet";

export default async function execute(interact: CommandInteraction, amateras: Amateras) {
    const admin = interact.user
    for (const subcmd0 of interact.options.data) {
        switch (subcmd0.name) {
            case 'player':
                if (subcmd0.options) {
                    for (const subcmd1 of subcmd0.options) {
                        switch (subcmd1.name) {
                            case 'aka':
                                let player: Player | undefined, aka, reason: string;
                                for (const subcmd2 of subcmd1.options!) {
                                    switch (subcmd2.name) {
                                        case 'user':
                                            player = await amateras.players.fetch(<string>subcmd2.value)
                                            break;
                                        case 'content':
                                            aka = <string>subcmd2.value
                                            break;
                                        case 'reason':
                                            reason = <string>subcmd2.value
                                        break;
                                    }
                                }
                                if (!player) return
                                const lastAka = player.aka
                                player!.aka = aka ? aka : null
                                await player!.save()
                                const target = interact.guild?.members.cache.get(player!.id)
                                interact.reply({ content: `${admin} 修改了 ${target} 的称号：${lastAka ? lastAka : '无'} => ${aka}${reason! ? '\n> ' + reason! : ''}` })
                            break;
                        }
                    }
                } else {
                    interact.reply({ content: '请选择输入选项。', ephemeral: true })
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
                                            const fetch = await amateras.wallets.fetch((await amateras.players.fetch(subcmd2.value)).wallets[0].id)
                                            if (!fetch) {
                                                console.error(`Wallet not exist. `)
                                                interact.reply({ content: '命令无法使用：Wallet 不存在。', ephemeral: true })
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
                                interact.reply({ content: `请输入有效数字。`, ephemeral: true })
                                return
                            }
                            if (!wallet) return
                            wallet.balance = amount
                            wallet.save()
                            const target = interact.guild?.members.cache.get(wallet!.owner.id)
                            interact.reply({ content: `${admin} 修改了 ${target} 的资产：${lastBalance}G => ${wallet.balance}G${reason ? '\n' + reason : ''}`, ephemeral: false })
                        break;
                    }
                }
            break;
            }
        }
}