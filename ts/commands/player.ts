import { ColorResolvable, CommandInteraction, MessageEmbedOptions } from 'discord.js';
import Amateras from '../lib/Amateras';

export default execute
async function execute(interaction: CommandInteraction, amateras: Amateras) {
    const options = interaction.options.data
    switch (options[0].name) {
        case 'edit':
            if (options[0].options) {
                const player = await amateras.players.fetch(interaction.user.id)
                if (player === 404) return
                for (const subcmd of options[0].options) {
                    switch (subcmd.name) {
                        case 'intro':
                            if (typeof subcmd.value !== 'string') return;
                            player.description = subcmd.value
                            break;
                        case 'color':
                            if (typeof subcmd.value !== 'string') return;
                            player.color = <ColorResolvable>subcmd.value
                            break;
                        case 'twitter': 
                            if (typeof subcmd.value !== 'string') return;
                            player.twitter = subcmd.value
                        break;
                        case 'youtube': 
                            if (typeof subcmd.value !== 'string') return;
                            player.youtube = subcmd.value
                        break;
                        case 'aka':
                            if (typeof subcmd.value !== 'string') return;
                            player.aka = subcmd.value
                    }
                }
                await player.save()
                interaction.reply({ content: '个人简介已更新。', ephemeral: true })
            } else {
                interaction.reply({ content: '请选择输入选项。', ephemeral: true })
            }
            break;

        case 'info':
            if (interaction.guild) {
                let user, share = false

                if (options[0].options) {
                    for (const subcmd of options[0].options) {
                        switch (subcmd.name) {
                            case 'user':
                                if (typeof subcmd.value !== 'string') return;
                                user = subcmd.value
                            break;
                            case 'share':
                                if (typeof subcmd.value !== 'boolean') return;
                                share = subcmd.value
                            break;
                        }
                    }
                    if (!user) {
                        const player = await amateras.players.fetch(interaction.user.id)
                        if (player === 404) return
                        player.sendInfo(interaction, share)
                    } else {
                        const player = await amateras.players.fetch(user)
                        if (player === 404) return
                        player.sendInfo(interaction, share)
                    }
                } else {
                    const player = await amateras.players.fetch(interaction.user.id)
                    if (player === 404) return
                    player.sendInfo(interaction, share)
                }
            } else {
                console.error('interaction.guild is not defined. player.js => execute()')
            }
            break;
        
    }
}