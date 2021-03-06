import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Amateras from './Amateras';

export async function commandBuilder(amateras: Amateras) {
    const rest = new REST({ version: '9' }).setToken(amateras.client.token!);

    try {
        for (const guild of amateras.client.guilds.cache) {
            await rest.put(
                Routes.applicationGuildCommands(amateras.id, guild[1].id),
                { body: {} },
            );
        }

    } catch(err) {
        console.error(err);
    }
};

export async function commandGlobalBuilder(amateras: Amateras) {
    const rest = new REST({ version: '9' }).setToken(amateras.client.token!);

    try {
        await rest.put(
            Routes.applicationCommands(amateras.id),
            { body: [] },
        );

    } catch(err) {
        console.error(err);
    }
};