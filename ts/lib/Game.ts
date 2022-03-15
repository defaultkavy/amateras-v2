import { Blackjack } from "./Blackjack";

export class Game {
    name: string;
    constructor(obj: GameObj) {
        this.name = obj.name
    }
    isBlackjack(): this is Blackjack {
        return this.name === 'BLACKJACK' ? true : false
    }
}

export interface GameObj {
    name: 'BLACKJACK'
}