import { CommandInteraction } from 'discord.js';

export default ping
async function ping(interaction: CommandInteraction) {
    await interaction.reply('喵喵!')
}