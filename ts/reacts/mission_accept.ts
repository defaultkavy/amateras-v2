import { ButtonInteraction } from "discord.js";
import Amateras from "../lib/Amateras";

export default async function mission_accept(interaction: ButtonInteraction, amateras: Amateras) {
    const player = await amateras.players.fetch(interaction.user.id)
    if (!player) {
        console.error(`Player "${interaction.user.id}(${interaction.user.username})" not found. (mission_accept.js)`)
        return
    }
    const mission = await amateras.missions?.fetch(interaction.message.embeds[0].footer?.text!)
    if (!mission) {
        console.error(`Mission "${interaction.message.embeds[0].footer?.text}" not found." (mission_accept.js)`)
        return
    }
    if (mission.owner === player) {
        interaction.reply({content: `无法接取自己的委托。`, ephemeral: true})
        return
    } else if (mission.agents.includes(player)) {
        interaction.reply({content: `你已接取该委托。`, ephemeral: true})
        return
    } else if (mission.expire <= new Date()) {
        interaction.reply({content: `该委托已到达期限。`, ephemeral: true})
        return
    } else if (!mission.enable) {
        interaction.reply({content: `该委托已结算。`, ephemeral: true})
        return
    } else if (player.missions.accepted.active.cache.size >= 5) {
        interaction.reply({content: `你不能再接受更多的委托了，请先完成你当下正在进行的委托。`, ephemeral: true})
        return
    }
    
    if (mission.agents.length < <number>mission.persons) {
        player.missions.accepted.active.add(mission)
        await mission.addAgent(player)
        const message = await interaction.channel?.messages.fetch(interaction.message.id)
        if (!message) {
            console.error(`Mission message "${mission.message}" not found. (mission_accept.js)`)
        } else {
            mission.missionMessageUpdate('EXECUTE')
        }
        interaction.reply({content: `你接受了 ${interaction.message.interaction?.user} 的委托。`, ephemeral: true})
    } else {
        interaction.reply({content: `该委托已达接取人数上限。`, ephemeral: true})
    }
    
}