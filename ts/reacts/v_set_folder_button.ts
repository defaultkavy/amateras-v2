import { ButtonInteraction, CommandInteraction, GuildChannel, Interaction, Message, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, TextChannel } from "discord.js"
import Amateras from "../lib/Amateras"
import { VImageFolder } from "../lib/VImageFolder"

export default async function v_set_folder_button(interact: ButtonInteraction, amateras: Amateras, options?: { interactOld: CommandInteraction, messageEle: MessageElement }) {
    const footer = interact.message.embeds[0].footer
    if (!footer || footer.text !== interact.user.id) {
        interact.reply({content: '你无法更改别人的形象。', ephemeral: true})
        return
    }
    const player = await amateras.players.fetch(interact.user.id)
    if (player === 404) return
    let message: Message | undefined = undefined
    if (!options) message = await interact.channel!.messages.fetch(interact.message.id)
    
    const comp = message ? message.components : options?.messageEle.comp
    const action = new MessageActionRow
    const select = new MessageSelectMenu
    select.placeholder = '选择你的文件夹'
    select.customId = interact.id + '_v_set_default_folder_select'
    if (player.v!.imageFolders.folders.size === 0) return interact.reply({content:`Error: Folder not exist`, ephemeral: true})
    for (const folder of player.v!.imageFolders.folders.values()) {
        select.addOptions({
            label: folder.name ? folder.name : '未命名',
            description: `${ folder.id } - ${ folder.images.size }张图片`,
            value: folder.id
        })
    }
    action.addComponents(select)
    if (message) message.edit({components: [action]})
    else if (options) options.interactOld.editReply({components: [action]})
    interact.deferUpdate()

    const collector = interact.channel!.createMessageComponentCollector({
        time: 1000 * 60,
        filter: (interact2) => {
            if (interact2.user.id === player.id) {
                if (interact2.message.id === interact.message.id &&
                    interact2.customId === select.customId) return true
                return false
            } else return false
        }
    })

    let status = 0
    collector.on('collect', async (interact2: SelectMenuInteraction) => {
        let set: VImageFolder | undefined
        const guild = amateras.guilds.cache.get(interact.guild!.id)
        if (!guild) return console.error('guild is ' + guild)
        const channel = <GuildChannel>interact.channel
        const lobby = await guild.lobby!.fetchByCategory(channel.parent!.id)
        if (interact.customId === '#v_set_default_folder') set = await player.v!.imageFolders.setDefault(interact2.values[0])
        if (interact.customId === '#v_set_once_folder') {
            if (!lobby) return console.error('lobby is ' + lobby)
            set = await lobby.setFolder(interact.user.id, interact2.values[0])
        }
        if (!set) {
            interact2.reply({ content: '文件夹不存在', ephemeral: true })
            return
        }
        if (lobby) {
            set = lobby.vFolder.get(interact.user.id)
            if (!set) {
                set = player.v!.imageFolders.default
            }
        }
        const image = set!.images.entries().next().value ? set!.images.entries().next().value[1] : undefined
        if (!image) {
            interact2.reply({content: '文件夹中没有图片', ephemeral: true})
            return
        }
        comp![1].components[1].customId = `${set!.id}$${ set!.toArray().indexOf(image) + 1 }` + '#v_info_next_button'
        comp![1].components[0].customId = `${set!.id}$${ set!.toArray().indexOf(image) + 1 }` + '#v_info_prev_button'
        if (message) await message.edit({embeds: [], components: comp})
        else if (options) options.interactOld.editReply({embeds: [], components: comp})
        interact2.deferUpdate()
        status = 1
    })

    collector.on('end', async (collection) => {
        if (status === 0) {
            if (message) message.edit({components: comp})
            else if (options) options.interactOld.editReply({components: []})
        }
    })
}