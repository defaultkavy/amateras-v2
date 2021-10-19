import { CommandInteraction, SelectMenuInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';
import Amateras from '../lib/Amateras';

export default execute
async function execute(interaction: CommandInteraction, amateras: Amateras) {
	const menuId = interaction.id + 'cute'
	const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId(menuId)
					.setPlaceholder('这还需要选的吗？')
					.addOptions([
						{
							label: '宇宙第一可爱',
							description: '不想被踢的话请选这个噢♥️',
							value: 'true',
                            emoji: '♥️',
						},
						{
							label: '不可爱',
							description: '你想退出公会吗？',
							value: 'false',
                            emoji: '💀',
						},
					]),
			);

	await interaction.reply({ content: '我可爱吗？', components: [row] });
	
	const collector = interaction.channel?.createMessageComponentCollector({
		filter: (interact2) => {
			if (interact2.customId === menuId) return true
			return false
		},
		time: 1000 * 60
	})

	if (!collector) return
	collector.on('collect', (interact2) => {
		reply(<SelectMenuInteraction>interact2)
	})
	
	collector.on('end', (interact2) => {
		interaction.editReply({content: '不想问了！', components: []})
	})
	
    function reply(fbInteraction: SelectMenuInteraction) {
        if (fbInteraction.values[0] === 'true') {
            fbInteraction.reply(`${fbInteraction.user} 乖 ♥️`)
        } else if (fbInteraction.values[0] === 'false') {
            fbInteraction.reply(`${fbInteraction.user} 拜拜 💀`)
        }
    }
}