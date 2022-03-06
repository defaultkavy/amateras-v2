import { Client, Guild, MessageFlags } from 'discord.js';
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
import { MusicManager } from './MusicManager';
const { system } = require('../../bot_config.json')
import { _system_ } from '../lang.json' 

// This is Bot Object, collect all the bot informations.
export default class Amateras {
    client: Client;
    id: string;
    debug: boolean;
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
    musics: MusicManager;
    ready: boolean;
    constructor(client: Client, db: Db, admin: string) {
        this.client = client;
        this.id = client.user!.id;
        this.debug = system.debug
        this.db = db;
        this.ready = false
        this.commands = new CommandManager(this);
        this.players = new PlayerManager(this)
        this.wallets = new WalletManager(this)
        this.missions = new MissionManager(this)
        this.messages = new _MessageManager(this)
        this.items = new ItemManager(this)
        this.me = <Player>{}
        this.system = new System(admin, this)
        this.guilds = new _GuildManager(this)
        this.rewards = new RewardManager(this)
        this.transactions = new TransactionManager(this)
        this.characters = new _CharacterManager(this)
        this.log = new Log(this)
        this.musics = new MusicManager(this)
    }

    async init() {
        console.log(cmd.Cyan, 'Amateras System Initializing...')
        const player = await this.players.fetch(this.id)
        if (player === 404) throw new Error('Amateras Fatal Error: Amateras User fetch failed')
        this.me = player
        console.time('| System Initialized')
        await this.system.init()
        console.timeEnd('| System Initialized')
        console.time('| Guilds Initialized')
        await this.guilds.init()
        console.timeEnd('| Guilds Initialized')
        console.time('| Global Command Deployed')
        await this.commands.init()
        console.timeEnd('| Global Command Deployed')
        this.eventHandler()
        this.wake()
        console.log(cmd.Yellow, 'Amateras Ready.')
    }

    sleep() {
        this.ready = false
        for (const _guild of this.guilds.cache.values()) {
            _guild.musicPlayer.control.stop()
        }
        this.log.sysSend(_system_.sleep)
    }
    
    wake() {
        this.ready = true
        for (const _guild of this.guilds.cache.values()) {
            _guild.musicPlayer.update()
        }
        this.log.sysSend(_system_.wake)
    }

    private eventHandler() {
        const eventFiles = fs.readdirSync('./js/events').filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`../events/${file}`);
            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args, this));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args, this));
            }
        }
    }
}