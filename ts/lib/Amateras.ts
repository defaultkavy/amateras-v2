import { commandBuilder } from "./commandsBuilder";
import { Client, Message, MessageFlags } from 'discord.js';
import fs from 'fs';
import { Db } from "mongodb";
import { PlayerManager } from "./PlayerManager";
import WalletManager from "./WalletManager";
import MissionManager from "./MissionManager";
import _MessageManager from "./_MessageManager";
import { Player } from "./Player";
import { _GuildManager } from "./_GuildManager";
import { ItemManager } from "./ItemManager";
import { RewardManager } from "./RewardManager";
import { TransactionManager } from "./TransactionManager";

// This is Bot Object, collect all the bot informations.
export default class Amateras {
    client: Client;
    id: string;
    guilds: _GuildManager;
    commands?: Command[];
    globalCommands?: Command[];
    db: Db;
    players: PlayerManager;
    wallets: WalletManager;
    missions: MissionManager;
    messages: _MessageManager;
    items: ItemManager;
    me: Player;
    rewards: RewardManager;
    transactions: TransactionManager;
    constructor(client: Client, options: { db: Db, commands?: Command[], globalCommands: Command[] }) {
        this.client = client;
        this.id = client.user!.id;
        this.commands = options.commands;
        this.globalCommands = options.globalCommands
        this.db = options.db;
        this.players = new PlayerManager(this)
        this.wallets = new WalletManager(this)
        this.missions = new MissionManager(this)
        this.messages = new _MessageManager(this)
        this.items = new ItemManager(this)
        this.me = <Player>{}
        this.guilds = new _GuildManager(this)
        this.rewards = new RewardManager(this)
        this.transactions = new TransactionManager(this)
    }

    async init() {
        await this.setCommands()
        await this.guilds.init()
        this.interactionCreate();
        this.messageCreate()
        this.messageReactionAdd()
        this.setTimer()
        this.me = await this.players.fetch(this.id)
    }

    async setCommands(): Promise<void> {
        if (this.commands) await commandBuilder(this);
        //if (this.globalCommands) await commandGlobalBuilder(this)
        await this.client.application?.fetch()
        const guild = await this.client.guilds.fetch('744127668064092160')
        const appCmds = await guild.commands.fetch()
        appCmds?.forEach(appcmd => {
            if (appcmd.name === 'Angry' ||
                appcmd.name === 'Toggle') {
                appcmd.permissions.add({
                    permissions: [
                        {
                            id: guild?.ownerId!,
                            type: 2,
                            permission: true
                        }
                    ]
                })
            } else if (appcmd.name === 'mod') {
                appcmd.permissions.add({
                    permissions: [
                        {
                            id: '744160642994274376',
                            type: 1,
                            permission: true
                        },
                        {
                            id: '877863354809585704',
                            type: 1,
                            permission: true
                        }
                    ]
                })
            }
        })
    }

    private interactionCreate() {
        // Client Interaction Command
        this.client.on('interactionCreate', async (interaction) => {
            let consoleText = `command received: ${interaction.user.username} - `;
            if (interaction.isCommand()) { // If slash command message sent
                // Check command file exist
                if (fs.existsSync(`./commands/${interaction.commandName}.js`)) {
                    // Import command function
                    const commandFn = require(`../commands/${interaction.commandName}.js`);
                    // Call command Function
                    commandFn.default(interaction, this);
                    consoleText += `${ interaction.commandName }\n${ interaction.options.data }`
                } else {
                    // If command file not exist
                    console.error('Command not exist. Function file not found. (Amateras.js)')
                    return;
                }
            } else if (interaction.isSelectMenu()) { // If menu selected
                const flags = <MessageFlags>interaction.message.flags
                if (flags.toArray().includes('EPHEMERAL')) return
                const msg = (await this.messages?.fetch(interaction.message.id))
                if (!msg) {
                    console.error(`Msg "${interaction.id}" not found. (Amateras.js)`)
                    return
                }
                let SelectFn: string | undefined = ''
                if (!msg.actions) {
                    console.error(`Msg "${interaction.id}" actions is ${msg.actions}. (Amateras.js)`)
                    return
                }
                for (const action of msg.actions) {
                    for (const element of action) {
                        if (element.type === 'SELECT_MENU' && Object.keys(element.options).includes(interaction.values[0])) {
                            if (!element.options[interaction.values[0]]) {
                                console.error(`Msg "${msg.id}" Select menu "${element.customId}" function is ${element.options[interaction.values[0]]} (Amateras.js)`)
                                return
                            }
                            SelectFn = element.options[interaction.values[0]]
                        }
                    }
                }
                if (!SelectFn) {
                    //console.error(`Select menu "${interaction.customId}" not found in msg "${msg.id}" or type is uncorrect. (Amateras.js)`)
                    return
                }
                consoleText += `${ interaction.customId }\n${ interaction.values }`
                // Check function file exist
                if (fs.existsSync(`./reacts/${SelectFn}.js`)) {
                    // Import function
                    const fn = require(`../reacts/${SelectFn}.js`);
                    // Call Function
                    fn.default(interaction, this, msg.get);
                } else {
                    // If Function not exist
                    console.error(`Select menu "${interaction.customId}" function file not found. (Amateras.js)`)
                    return;
                }

            } else if (interaction.isContextMenu()) { // If context menu clicked
                if (fs.existsSync(`./context/${interaction.commandName}.js`)) {
                    // Import command function
                    const contextFn = require(`../context/${interaction.commandName}.js`);
                    // Call command Function
                    contextFn.default(interaction, this);
                    consoleText += `${ interaction.commandName }`
                }
            } else if (interaction.isButton()) { // If button clicked
                const flags = <MessageFlags>interaction.message.flags
                if (flags.toArray().includes('EPHEMERAL')) return
                const msg = (await this.messages?.fetch(interaction.message.id))
                if (!msg) {
                    console.error(`Msg "${interaction.id}" not found. (Amateras.js)`)
                    return
                }
                let buttonFn: string = ''
                if (!msg.actions) {
                    console.error(`Msg "${interaction.id}" actions is ${msg.actions}. (Amateras.js)`)
                    return
                }
                const customId = interaction.customId.split('#')[1]
                for (const action of msg.actions) {
                    for (const element of action) {
                        if (element.customId === customId && element.type === 'BUTTON') {
                            if (!element.fn) {
                                console.error(`Msg "${msg.id}" button "${element.customId}" function is ${element.fn} (Amateras.js)`)
                                return
                            }
                            buttonFn = element.fn
                        }
                    }
                }
                if (!buttonFn) {
                    console.error(`Button "${customId}" not found in msg "${msg.id}" or type is uncorrect. (Amateras.js)`)
                    return
                }
                consoleText += `${ customId }`
                // Check function file exist
                if (fs.existsSync(`./reacts/${buttonFn}.js`)) {
                    // Import function
                    const fn = require(`../reacts/${buttonFn}.js`);
                    // Call Function
                    fn.default(interaction, this);
                } else {
                    // If Function not exist
                    console.error(`Button "${interaction.customId}" function file not found. (Amateras.js)`)
                    return;
                }
                
            } else return;
            console.log(true, consoleText)
        })
    }

    private messageCreate() {
        this.client.on('messageCreate', async (message: Message) => {
            console.log(true, `message received: ${message.author.username} - ${message.content}`)
            if (!message.guild || message.system) return
            const player = await this.players.fetch(message.author.id)
            const reward = player.rewards.get('message')
            if (reward) reward.add()
            if (message.type === 'REPLY') {
                const repliedMessage = await message.channel.messages.fetch(message.reference!.messageId!)
                if (message.author.id === repliedMessage.author.id) return
                const repliedPlayer = await this.players.fetch(repliedMessage.author.id)
                const repliedReward = repliedPlayer.rewards.get('replied')
                if (repliedReward) repliedReward.add()
            }
        })
    }

    private messageReactionAdd() {
        this.client.on('messageReactionAdd', async (reaction, user) => {
            await reaction.message.fetch()
            if (!reaction.message.guild || !reaction.message.author || user.bot) return
            const reactedPlayer = await this.players.fetch(reaction.message.author.id)
            const reactPlayer = await this.players.fetch(user.id)
            const reward = reactedPlayer.rewards.get('reacted')
            const reward2 = reactPlayer.rewards.get('react')
            if (reward) reward.add()
            if (reward2) reward2.add()
        })
    }

    private setTimer() {
        const time = new Date()
        const now = new Date()
        time.setDate(time.getDate() + 1)
        time.setHours(0,0,0,0)

        const expiredMission = async () => {
            if (!this.db) return
            const collection = this.db?.collection('mission_expire')
            const doc = <MissionDateData> (await collection.find({ expire_date: time }).toArray())[0]
            if (!doc) return
            for (const missionId of doc.missions) {
                const mission = await this.missions?.fetch(missionId)
                if (mission) {
                    if (mission.enable) mission.setMessageButtonExpire()
                } else {
                    console.error(`Mission "${missionId}" fetch failed. (Amateras.js)`)
                    return
                }
            }
        }
        
        setTimeout(expiredMission.bind(this), time.getTime() - now.getTime())
    }
}