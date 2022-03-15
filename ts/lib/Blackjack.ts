import { CommandInteraction, Guild, GuildMember, Message, MessageEmbed, MessageEmbedOptions, ThreadChannel } from "discord.js";
import Amateras from "./Amateras";
import { BlackjackPlayer } from "./BlackjackPlayer";
import { Game, GameObj } from "./Game";
import { GameChannel } from "./GameChannel";
import { Player } from "./Player";
import { arrayShuffle } from "./terminal";
import { _Guild } from "./_Guild";
import { _TextChannel } from "./_TextChannel";
import { _ThreadChannel } from "./_ThreadChannel";

export class Blackjack extends Game {
    amateras: Amateras;
    _guild: _Guild;
    _channel: _TextChannel;
    owner: BlackjackPlayer;
    message?: Message
    readonly guests: Map<string, BlackjackPlayer>
    _thread?: _ThreadChannel;
    #member?: GuildMember;
    cards: Pokercard[];
    started: boolean;
    memberLimit: number;
    turns: BlackjackPlayer[];
    constructor(obj: BlackjackObj, amateras: Amateras) {
        super({name: 'BLACKJACK'})
        this.amateras = amateras
        this._guild = obj._guild
        this._channel = obj._channel
        this.owner = new BlackjackPlayer(obj.owner, obj.owner_member, this, amateras)
        this.guests = new Map()
        
        // Game
        this.cards = []
        this.started = false
        this.memberLimit = 6
        this.turns = []
    }

    async init(interact: CommandInteraction) {
        const member = await this._guild.member(this.owner.me.id)
        if (!(member instanceof GuildMember)) return
        this.#member = member

        this.message = await this.sendMessage(interact)

        const thread = await this._channel.get.threads.create({name: `21点 - ${member.displayName}`, startMessage: this.message, autoArchiveDuration: 60})
        const _thread = await this._guild.channels.fetch(thread.id)
        if (!(_thread instanceof _ThreadChannel)) return
        this._thread = _thread
        this._thread.get.send({embeds: [this.helpEmbed()]})
        this._guild.games.channels.set(this._thread.id, new GameChannel({game: this, _thread: this._thread}, this.amateras))

        // Game
        const colors = [['spade', '♠️'], ['heart', '♥️'], ['club', '♣️'], ['diamond', '♦️']]
        const numbers: {0: string, 1: number}[] = [['A', 1], ['2', 2], ['3', 3], ['4', 4], ['5', 5], ['6', 6], ['7', 7], ['8', 8], ['9', 9], ['10', 10], ['J', 10], ['Q', 10], ['K', 10]]
        
        for (const color of colors) {
            for (const number of numbers) {
                this.cards.push({color: color[0], emoji: color[1], point: number[1], name: number[0]})        
            }
        }
    }

    async updateMessage() {
        if (!this.message) return
        await this.message.edit({embeds: [this.infoEmbed()]}).catch()
    }

    async sendMessage(interact: CommandInteraction) {
        return await interact.reply({embeds: [this.infoEmbed()], fetchReply: true}) as Message
    }

    infoEmbed() {
        const embed: MessageEmbedOptions = {
            title: '21点 - ' + (this.#member ? this.#member.displayName : this.owner.me.name),
            description: `玩家：${this.guests.size + 1}/${this.memberLimit}`
        }
        return embed
    }

    helpEmbed() {
        const commands = `\`\`\`入场 - /bj join <bet: 赌注金额>\n开局 - /bj start\n看牌 - /bj seek\n补牌 - /bj add\n开牌 - /bj show\n离场 - /bj leave\`\`\``
        const embed: MessageEmbedOptions = {
            title: '欢迎参与游戏：21点',
            description: `创建者：${this.#member ? this.#member : this.owner.me.name}\n${commands}`
        }
        return embed
    }

    /**
     * 
     * @returns 101 - Member limit reached 
     * @returns 102 - Not allow add owner to game
     */
    addGuest(player: Player, member: GuildMember, bet: number) {
        if (this.guests.size + 1 >= this.memberLimit) return 101
        if (player === this.owner.me) return 102
        const gamePlayer = new BlackjackPlayer(player, member, this, this.amateras)
        gamePlayer.bet = bet
        this.guests.set(player.id, gamePlayer)
        this.updateMessage()
        return gamePlayer
    }

    start() {
        this.started = true
        this.shuffe()
        this.owner.getCard()
        this.owner.getCard()
        for (const guest of this.guests.values()) {
            guest.getCard()
            guest.getCard()
        }
        // Member turns set
        this.turns = Array.from(this.guests.values())
        this.turns.push(this.owner)
    }
    
    shuffe() {
        this.cards = arrayShuffle(this.cards)
    }

    /**
     * 
     * @returns 101 - Game not started
     * @returns 200 - Skip
     * @returns 201 - Game done
     */
    skip(force = false) {
        if (!this.started) return 101
        if (this.turns[1]) {
            this.turns.shift()
            if (force && this._thread) this._thread.get.send({content: `轮到 ${this.thisTurn.member} 的抽卡回合`})
            return 200
        } else {
            this.turns.shift()
            this.done()
            return 201
        }
    }

    done() {
        if (!this._thread) return
        this._thread.get.send({content: '结束'})
    }

    get thisTurn() {
        return this.turns[0]
    }

    get guestList() {
        let list = '```md\n'
        list += `# 庄主\n- ${this.owner.member.displayName}\n# 玩家\n`
        for (const guest of this.guests.values()) {
            list += `- ${guest.member.displayName} - ${guest.bet}G\n`
        }
        list += '```'
        return list
    }
}

interface BlackjackObj {  
    owner: Player
    owner_member: GuildMember
    _channel: _TextChannel
    _guild: _Guild
}

export interface Pokercard {
    color: string,
    emoji: string,
    point: number,
    name: string
}