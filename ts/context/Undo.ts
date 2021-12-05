import { ContextMenuInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';

export default execute
async function execute(interaction: ContextMenuInteraction, amateras: Amateras) {
    if (interaction.guild) {
        const targetMessage = interaction.channel?.messages.cache.get(interaction.targetId)
        if (targetMessage?.interaction?.user.id === interaction.user.id) {
            if (targetMessage.interaction.commandName === 'mission') {
                interaction.reply({content: '你无法撤销任务讯息。', ephemeral: true})
                return
            }
            try {
                targetMessage.delete()
            } catch(err) {
                throw err
            }
            interaction.reply({content: '已撤销。', ephemeral: true})
        } else {
            interaction.reply({content: '你无法撤销此讯息。', ephemeral: true})
        }
    } else {
        console.error('interaction.guild is not defined. Undo.js => execute()')
    }
}