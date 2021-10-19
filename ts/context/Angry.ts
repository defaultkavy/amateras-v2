import { ContextMenuInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';

export default execute
async function execute(interaction: ContextMenuInteraction, amateras: Amateras) {
    if (interaction.user.id !== interaction.guild?.ownerId) {
        await interaction.reply({content: '此功能无法使用。', ephemeral: true});
        return;
    }
    const targetMessage = await interaction.channel?.messages.fetch(interaction.targetId);
    await targetMessage?.reply('😡');
    await interaction.reply({content: 'Sent.', ephemeral: true});
}