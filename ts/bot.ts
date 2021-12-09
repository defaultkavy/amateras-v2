process.env.TZ = 'Asia/Kuala_Lumpur'
// NodeJS module
import { Client, Intents } from 'discord.js';
import { Db, MongoClient } from 'mongodb';

// AMATERAS Library
import Amateras from './lib/Amateras';
import cmd from './lib/cmd';
import { removeArrayItem } from './lib/terminal';
// Client config
let config = require('./bot_config.json')
// Create Bot Client
// Client Options - Partials: Cache message and reaction.
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'REACTION', 'CHANNEL', 'GUILD_MEMBER']
});
// Database Client
const mongo = new MongoClient('mongodb://isekai.live:27017/', {auth: {username: config.db.user, password: config.db.pwd}})
let db: Db
// Connect to DB
databaseInit(init)
async function databaseInit(callback: () => void) {
    console.log(cmd.Cyan, 'Connecting to MongoDB...')
    console.time('| MongoDB Connected')
    await mongo.connect()
    console.timeEnd('| MongoDB Connected')
    db = mongo.db('Amateras')
    callback()
}

async function init() {
    // Create Bot info object
    console.log(cmd.Cyan, 'Connecting to Discord...')
    console.time('| Connected')
    // Client login with token, edit token from bot_config.json
    client.login(config.bot.token);
    // Client Ready
    client.once('ready', async () => {
        console.timeEnd('| Connected');
        const amateras = new Amateras(client, {db: db})
        await amateras.init()
    })
}