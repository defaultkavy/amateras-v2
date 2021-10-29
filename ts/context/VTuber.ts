import { ContextMenuInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';

export default execute
async function execute(interaction: ContextMenuInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interaction.targetId)
    if (!player) return console.error('Player not exist')
    if (!player.v) {
        await player.setVTuber()
        interaction.reply({content: `VTuber Set.`, ephemeral: true})
    } else {
        await player.unsetVTuber()
        interaction.reply({content: `VTuber Unset`, ephemeral: true})
    }
    await player.save()
    
}