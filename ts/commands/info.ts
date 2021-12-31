import { CommandInteraction } from 'discord.js';
import Amateras from '../lib/Amateras';

export default async function info(interact: CommandInteraction, amateras: Amateras) {
    amateras.me.sendInfo(interact, false)
}