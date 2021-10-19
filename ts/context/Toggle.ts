import { ContextMenuInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';
import { Gender } from '../lib/layout';

export default execute
async function execute(interaction: ContextMenuInteraction, amateras: Amateras) {
    if (!amateras.players) {
        interaction.reply({ content: '命令无法使用：资料库不存在。', ephemeral: true })
        return
    }
    const player = await amateras.players.fetch(interaction.targetId)
    if (player.gender === 1) {
        player.gender = 2
    } else {
        player.gender = 1
    }
    player.save()
    await interaction.reply({content: `Change to ${Gender[player.gender]}`, ephemeral: true})
}