import { GuildMember, MessageEmbedOptions } from "discord.js";
import Amateras from "./Amateras";
import { Blackjack, Pokercard } from "./Blackjack";
import { Player } from "./Player";

export class BlackjackPlayer {
    amateras: Amateras;
    game: Blackjack;
    me: Player;
    cards: Pokercard[]
    bet: number;
    member: GuildMember
    constructor(player: Player, member: GuildMember, game: Blackjack, amateras: Amateras) {
        this.amateras = amateras
        this.game = game
        this.me = player
        this.cards = []
        this.bet = 0
        this.member = member
    }

    init() {

    }

    /**
     * 
     * @returns 101 - Cards limit reached
     */
    getCard() {
        if (this.cards.length >= 5) return 101
        const card = this.game.cards.shift()
        if (!card) throw new Error('this.game.cards[0] is undefined')
        this.cards.push(card)
        if (this.cards.length >= 5) this.game.skip(true)
        return card
    }

    cardsEmbed(show: boolean) {
        let list = ''
        for (const card of this.cards) {
            if (show && card === this.cards[this.cards.length - 1]) continue
            list += `${card.emoji} ${card.name} `
        }
        const embed: MessageEmbedOptions = {
            description: list
        }

        return embed
    }

    get cardPoint() {
        let point = 0
        let a = 0
        for (const card of this.cards) {
            if (card.name === 'A') {
                a += 1
                continue
            }
            point += card.point
        }
        
        for (let i = 0; i < a; i++) {
            if (point + 11 > 21) {
                point += 1
            } else {
                point += 11
            }
        }
        return point
    }
}