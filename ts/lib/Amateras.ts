import { commandBuilder } from "./commandsBuilder";
import { Client, MessageFlags } from 'discord.js';
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
import { _CharacterManager } from "./_CharacterManager";
import cmd from "./cmd";
import { Log } from "./Log";

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
    characters: _CharacterManager;
    log: Log
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
        this.characters = new _CharacterManager(this)
        this.log = new Log(this)
    }

    async init() {
        console.log(cmd.Cyan, 'Command Deploying...')
        console.time('| Command Deployed')
        await this.setCommands()
        console.timeEnd('| Command Deployed')
        console.log(cmd.Cyan, 'Amateras System Initializing...')
        console.time('| System Initialized')
        await this.guilds.init()
        console.timeEnd('| System Initialized')
        this.eventHandler()
        this.setTimer()
        this.me = await this.players.fetch(this.id)
        console.log(cmd.Yellow, 'Amateras Ready.')
    }

    async setCommands(): Promise<void> {
        if (this.commands) await commandBuilder(this);
        //if (this.globalCommands) await commandGlobalBuilder(this)
        await this.client.application?.fetch()
        const guild = await this.client.guilds.fetch('744127668064092160')
        const appCmds = await guild.commands.fetch()
        appCmds?.forEach(appcmd => {
            if (appcmd.name === 'Angry' ||
                appcmd.name === 'Toggle' || appcmd.name === 'VTuber') {
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

    private eventHandler() {
        const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`../events/${file}`);
            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args, this));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args, this));
            }
        }
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