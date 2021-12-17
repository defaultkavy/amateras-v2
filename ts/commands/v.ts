import { CommandInteraction } from "discord.js"
import Amateras from "../lib/Amateras"
import { checkImage } from "../lib/terminal"

export default async function item(interact: CommandInteraction, amateras: Amateras) {
    const v = await amateras.players.v.fetch(interact.user.id)
    if (v === 404 || v === 101) return interact.reply({content: 'VTuber 限定功能。', ephemeral: true})

    for (const subcmd0 of interact.options.data) {
        if (subcmd0.name === 'image') {
            if (!subcmd0.options) {
                interact.reply({content: '请输入必要参数。', ephemeral: true})
                return
            }
            const imageObj: {url?: string} = {
                url: undefined
            }
            for (const subcmd1 of subcmd0.options) {
                if (subcmd1.name === 'url') {
                    imageObj.url === <string>imageObj.url
                }
            }
            if (imageObj.url && checkImage(imageObj.url)) {
                v.image = imageObj.url
                interact.reply({content: '图片设定完成', ephemeral: true})
            } else {
                interact.reply({content: '图片链接无效', ephemeral: true})
            }
        }
        if (subcmd0.name === 'info') {
            const embed = v.infoEmbed()
            if (embed === 101) return interact.reply('Error: User is not defined')
            if (!subcmd0.options) {
                interact.reply({embeds: [embed], ephemeral: true})
                return
            }
            let share = false, user
            for (const subcmd1 of subcmd0.options) {
                if (subcmd1.name === 'share') {
                    share = <boolean>subcmd1.value!
                } else if (subcmd1.name === 'user') {
                    user = <string>subcmd1.value
                }
            }
            if (user) {
                const target = await amateras.players.v.fetch(user)
                if (target === 404 || target === 101) return interact.reply({content: '对方不是 V', ephemeral: true})
                const embed2 = target.infoEmbed()
                if (embed2 === 101) return interact.reply('Error: User is not defined')
                interact.reply({embeds: [embed2], ephemeral: !share})
            } else {
                interact.reply({embeds: [embed], ephemeral: !share})
            }
        }
    }
}