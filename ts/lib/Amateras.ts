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
import { System } from './System';
import { CommandManager } from './CommandManager';

// This is Bot Object, collect all the bot informations.
export default class Amateras {
    client: Client;
    id: string;
    guilds: _GuildManager;
    //commands: CommandManager;
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
    log: Log;
    system: System;
    commands: CommandManager;
    constructor(client: Client, db: Db, admin: string) {
        this.client = client;
        this.id = client.user!.id;
        this.db = db;
        this.commands = new CommandManager(this);
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
        this.system = new System(admin, this)
        
    }

    async init() {
        console.log(cmd.Cyan, 'Amateras System Initializing...')
        console.time('| System Initialized')
        console.time('| Guilds Initialized')
        await this.guilds.init()
        console.timeEnd('| Guilds Initialized')
        const player = await this.players.fetch(this.id)
        if (player === 404) throw new Error('Amateras Fatal Error: Amateras User fetch failed')
        this.me = player
        await this.system.init()
        console.time('| Global Command Deployed')
        //await this.commands.init()
        console.timeEnd('| Global Command Deployed')
        console.timeEnd('| System Initialized')
        this.eventHandler()
        this.setTimer()
        console.log(cmd.Yellow, 'Amateras Ready.')
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