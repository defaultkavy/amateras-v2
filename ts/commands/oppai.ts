import { CommandInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';

export default execute
async function execute(interaction: CommandInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interaction.user.id)
    if (player === 404) return
    await interaction.reply(interaction.user.id === '318714557105307648'
        ? '💢 让你碰了吗？！' 
        : player.gender === 2
        ? '贴贴 ♥️'
        : '想死吗？')
}