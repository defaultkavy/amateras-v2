import { ButtonInteraction, Guild, GuildMember, MessageActionRow, MessageButton, MessageSelectMenu, SelectMenuInteraction } from "discord.js"
import Amateras from "../lib/Amateras"

export default async function profile_change_button(interact: ButtonInteraction, amateras: Amateras) {
    const id = interact.message.embeds[0].footer!.text!
    const player = await amateras.players.fetch(id)
    if (player === 404) return
    const message = await interact.channel!.messages.fetch(interact.message.id)
    
    let embed
    const action = new MessageActionRow
    const button = new MessageButton
    if (message.embeds[0].author && message.embeds[0].author.name === 'Player') {
        if (!player.v) return interact.deferUpdate()
        embed = player.v.infoEmbed()
        button.label = '切换到 Player'
        button.style = 'PRIMARY'
        button.customId = '#profile_change_button'
    } else if (message.embeds[0].author && message.embeds[0].author.name === 'VTuber') {
        if (!(interact.member instanceof GuildMember)) return
        embed = await player.infoEmbed(interact.member)
        button.label = '切换到 VTuber'
        button.style = 'PRIMARY'
        button.customId = '#profile_change_button'
    } else return

    action.addComponents(button)
    if (typeof embed === 'number') return interact.deferUpdate()
    message.edit({embeds: [embed], components: [action]})
    interact.deferUpdate()
}