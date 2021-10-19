import { CommandInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';

export default execute
async function execute(interaction: CommandInteraction, amateras: Amateras) {
    if (!amateras.players) {
        interaction.reply({ content: '命令无法使用：资料库不存在。', ephemeral: true })
        return
    }
    const player = await amateras.players.fetch(interaction.user.id)
    await interaction.reply(interaction.user.id === interaction.guild?.ownerId
        ? '💢 让你碰了吗？！' 
        : player.gender === 2
        ? '贴贴 ♥️'
        : '想死吗？')
}