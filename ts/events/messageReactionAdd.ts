import { Message, MessageReaction, User } from "discord.js";
import Amateras from "../lib/Amateras";

module.exports = {
    name: 'messageReactionAdd',
    once: false,
    async execute(reaction: MessageReaction, user: User, amateras: Amateras) {
        await reaction.message.fetch()
        if (user.bot || 
            reaction.message.author && reaction.message.author.bot || 
            !reaction.message.guild || 
            !reaction.message.author) return
        const reactedPlayer = await amateras.players.fetch(reaction.message.author.id)
        if (reactedPlayer === 404) return
        const reactPlayer = await amateras.players.fetch(user.id)
        if (reactPlayer === 404) return
        const reward = reactedPlayer.rewards.get('reacted')
        const reward2 = reactPlayer.rewards.get('react')
        if (reward) reward.add()
        if (reward2) reward2.add()
    }
}