import { CommandInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';
import Wallet from '../lib/Wallet';
import { _coin_, _command_err_ } from '../lang.json'

export default execute
async function execute(interaction: CommandInteraction, amateras: Amateras) {
    if (!amateras.players) {
        interaction.reply({ content: 'Error: Player fetch failed', ephemeral: true })
        return
    }
    const player = await amateras.players.fetch(interaction.user.id)
    if (player === 404) return

    if (!interaction.guild) return
    const _guild = amateras.guilds.cache.get(interaction.guild.id)
    if (!_guild) return
    const lang = _guild.lang
    for (const subcmd0 of interaction.options.data) {
        switch (subcmd0.name) {
            case 'give':
                if (!subcmd0.options) {
                    return
                }
                let receiverWallets: Wallet[] | undefined,
                    senderWallets = player.wallets,
                    amount: number, message: string
                for (const subcmd1 of subcmd0.options) {
                    switch (subcmd1.name) {
                        case 'user': 
                            if (subcmd1.value && typeof subcmd1.value === 'string') {
                                const receiver = await amateras.players.fetch(subcmd1.value)
                                if (receiver === 404) return
                                receiverWallets = receiver.wallets
                            }
                        break;
                        case 'amount':
                            if (subcmd1.value && typeof subcmd1.value === 'number') {
                                amount = subcmd1.value
                            }
                        break;
                        case 'message':
                            if (subcmd1.value && typeof subcmd1.value === 'string') {
                                message = subcmd1.value
                            }
                        break;
                    }
                }
                if (!receiverWallets || !senderWallets) {
                    interaction.reply({ content: 'Error: Wallet fetch failed', ephemeral: true })
                    return
                }
                if (receiverWallets[0].id === senderWallets[0].id) {
                    interaction.reply({ content: _coin_.err_same_acc[lang], ephemeral: true })
                    return
                }
                if (senderWallets[0].balance < amount! ) {
                    interaction.reply({ content: `${_coin_.err_balances_exceed[lang]} ${senderWallets[0].balance}G`, ephemeral: true })
                    return;
                } else if (!amount! || amount! <= 0) {
                    interaction.reply({ content: _coin_.err_number[lang], ephemeral: true })
                    return
                }
                await senderWallets[0].transfer(receiverWallets[0].id, amount, `/coin give: ${message!}`, false)
                const members = interaction.guild?.members.cache
                interaction.reply({ content: `${members?.get(senderWallets[0].owner.id)} ${_coin_.transfer[lang]} ${members?.get(receiverWallets[0].owner.id)} ${amount!}G${message! ? '\n> ' + message! : ''}`, ephemeral: false })
                amateras.log.send(`${await amateras.log.name(senderWallets[0].owner.id)} ${_coin_.transfer[lang]} ${await amateras.log.name(receiverWallets[0].owner.id)} ${amount!}G${message! ? '\n> ' + message! : ''}`)
            break;
        }
    }
}