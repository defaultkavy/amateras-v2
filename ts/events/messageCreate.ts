import { Message } from "discord.js";
import Amateras from "../lib/Amateras";
import { wordCounter } from "../lib/terminal";

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message: Message, amateras: Amateras) {
        if (message.system || message.author.bot || !message.guild ) return

        const player = await amateras.players.fetch(message.author.id)
        if (player === 404) return
        const _guild = amateras.guilds.cache.get(message.guild.id)
        //Reward
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

        //Forum
        if (_guild && _guild.forums) {
            const forum =  await _guild.forums.fetch(message.channel.id)
            if (forum !== 404 && forum.state === "OPEN" && message.channel.type === "GUILD_TEXT") {
                let content = ''
                if (message.cleanContent) {
                    content = message.cleanContent
                } else if (message.attachments.first()) {
                    content = Array.from(message.attachments)[0][1].name!
                }
                
                const name = wordCounter(content, 20)
                await message.channel.threads.create({
                    name: name,
                    autoArchiveDuration: 1440,
                    startMessage: message
                })
            }
        }
    }
}