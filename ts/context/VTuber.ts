import { ContextMenuInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';
import { Gender } from '../lib/layout';

export default execute
async function execute(interaction: ContextMenuInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interaction.targetId)
    if (!player) return console.error('Player not exist')
    if (!player.v) await player.setVTuber()
    else await player.unsetVTuber()
    await player.save()
    await interaction.reply({content: `Change to ${Gender[player.gender]}`, ephemeral: true})
}