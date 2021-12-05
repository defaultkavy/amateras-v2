import { ContextMenuInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';

export default execute
async function execute(interaction: ContextMenuInteraction, amateras: Amateras) {
    if (!amateras.players) {
        interaction.reply({ content: '命令无法使用：资料库不存在。', ephemeral: true })
        return
    }
    if (interaction.guild) {
        let player = await amateras.players.fetch(interaction.targetId);
        player.sendInfo(interaction, true)
    } else {
        console.error('interaction.guild is not defined.')
    }
}