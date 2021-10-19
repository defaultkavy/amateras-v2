import { CommandInteraction } from "discord.js"
import Amateras from "../lib/Amateras"

export default async function item(interact: CommandInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interact.user.id)
    let list = '```'
    for (const reward of player.rewards.values()) {
        list += `${ reward.title } - ${ reward.count } / ${ reward.reach }\n${ reward.description }\n奖励：${ reward.pay }G - 已完成${ reward.times }次\n\n`
    }
    list += '```'
    interact.reply({content: list, ephemeral: true})
}