process.env.TZ = 'Asia/Kuala_Lumpur'
// NodeJS module
import { Client, Intents } from 'discord.js';
import { Db, MongoClient } from 'mongodb';

// AMATERAS Library
import Amateras from './lib/Amateras';
import { cmd, idGenerator } from './lib/terminal'
// Client config
let { bot } = require('./bot_config.json')
// Create Bot Client
// Client Options - Partials: Cache message and reaction.
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INTEGRATIONS],
    partials: ['MESSAGE', 'REACTION']
});
// Database Client
const mongo = new MongoClient('mongodb://localhost:27017/')
let db: Db
// Connect to DB
databaseInit(init)
async function databaseInit(callback: () => void) {
    cmd.sys('Connecting to MongoDB...')
    await mongo.connect()
    cmd.sys('MongoDB Connected')
    db = mongo.db('Amateras')
    callback()
}

async function init() {
    // Create Bot info object
    cmd.sys('Amateras Starting up...')
    // Client login with token, edit token from bot_config.json
    client.login(bot.token);
    // Client Ready
    client.once('ready', async () => {
        cmd.sys('Ready');
        const { commands, global_commands } = require('./command_list.json')
        const amateras = new Amateras(client, {db: db, commands: commands, globalCommands: global_commands})
        await amateras.init()
    })
}