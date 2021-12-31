import { Guild } from "discord.js";
import Amateras from "../lib/Amateras";

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(guild: Guild, amateras: Amateras) {
        const _guild = amateras.guilds.cache.get(guild.id)
        if (_guild && _guild.available === true) return
        console.debug(true, `- join ${guild.name}!`)
        amateras.guilds.create(guild)
    }
}