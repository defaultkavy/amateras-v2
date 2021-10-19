import { ButtonInteraction, Message, MessageButton } from "discord.js";
import Amateras from "../lib/Amateras";

export default async function mission_info(interaction: ButtonInteraction, amateras: Amateras) {
    if (!amateras.db) {
        return
    }
    const player = await amateras.players?.fetch(interaction.user.id)
    if (!player) {
        console.error(`Player "${interaction.user.id}(${interaction.user.username})" not found.`)
        return
    }
    const mission = await amateras.missions?.fetch(interaction.message.embeds[0].footer?.text!)
    if (!mission) {
        console.error(`Mission "${interaction.message.embeds[0].footer?.text}" not found."`)
        return
    }
    await mission.createThread(interaction)
    interaction.deferUpdate()
    
}