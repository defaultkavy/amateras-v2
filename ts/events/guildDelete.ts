import { Guild } from "discord.js";
import Amateras from "../lib/Amateras";

module.exports = {
    name: 'guildDelete',
    once: false,
    async execute(guild: Guild, amateras: Amateras) {
        console.debug(true, `- leave ${guild.name}!`)
        const _guild = amateras.guilds.cache.get(guild.id)
        if (_guild) {
            _guild.leave()
        }
    }
}