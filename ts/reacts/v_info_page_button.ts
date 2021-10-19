import { ButtonInteraction, CommandInteraction, Interaction, Message, MessageActionRow, MessageSelectMenu, SelectMenuInteraction } from "discord.js"
import Amateras from "../lib/Amateras"

export default async function v_info_page_button(interact: ButtonInteraction, amateras: Amateras, options?: { interactOld: CommandInteraction, messageEle: MessageElement }) {
    const footer = interact.message.embeds[0].footer
    if (!footer || footer.text !== interact.user.id) {
        interact.reply({content: '你无法更改别人的形象。', ephemeral: true})
        return
    }
    const player = await amateras.players.fetch(interact.user.id)
    const param = interact.customId.split('#')[0]
    const folderId = param.split('$')[0]
    let message: Message | undefined = undefined
    if (!options) message = await interact.channel!.messages.fetch(interact.message.id)
    const comp = options ? options.messageEle.comp : message!.components
    const folder = player.v!.imageFolders.folders.get(folderId)
    if (!folder) {
        // folder not found
        return
    }
    const page = param.split('$')[1]
    let i = +page
    const imageId = Array.from(folder.images.keys())
    const customId = interact.customId.split('#')[1]
    if (customId !== 'v_info_next_button') {
        if (i === 1) {
            i = imageId.length
        } else i -= 1
    } else {
        if (i === imageId.length) {
            i = 1
        } else i += 1
    }
    const image = folder.images.get(imageId[i - 1])
    comp[1].components[1].customId = `${folderId}$${ i }` + '#v_info_next_button'
    comp[1].components[0].customId = `${folderId}$${ i }` + '#v_info_prev_button'
    if (message) await message.edit({embeds: [await player.v!.infoEmbed(folder, image)], components: comp})
    else await options!.interactOld.editReply({embeds: [await player.v!.infoEmbed(folder, image)], components: comp})
    interact.deferUpdate()
}