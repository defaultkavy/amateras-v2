import { Message } from "discord.js";
import Amateras from "../lib/Amateras";

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message: Message, amateras: Amateras) {
        if (message.system || message.author.bot || !message.guild ) return

        const player = await amateras.players.fetch(message.author.id)
        if (player === 404) return
        const _guild = amateras.guilds.cache.get(message.guild.id)
        // Reward
        const reward = player.rewards.get('message')
        if (reward) reward.add()
        if (message.type === 'REPLY') {
            const repliedMessage = await message.channel.messages.fetch(message.reference!.messageId!)
            if (message.author.id === repliedMessage.author.id) return
            const repliedPlayer = await amateras.players.fetch(repliedMessage.author.id)
            if (repliedPlayer === 404) return
            const repliedReward = repliedPlayer.rewards.get('replied')
            if (repliedReward) repliedReward.add()
        }

        // Forum
        if (_guild && _guild.forums) {
            const forum = _guild.forums.cache.get(message.channel.id)
            if (forum) forum.post(message)
        }

        // Music
        if (_guild && _guild.musicPlayer.channel) {
            if (_guild.musicPlayer.channel.id === message.channelId) {
                await _guild.musicPlayer.link(message, player)
                if (!message.deleted) message.delete()
            }
        }
    }
}