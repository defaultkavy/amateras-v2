import Amateras from "./Amateras";
import { Game } from "./Game";
import { _ThreadChannel } from "./_ThreadChannel";

export class GameChannel {
    amateras: Amateras;
    game: Game;
    _thread: _ThreadChannel;
    constructor(obj: GameChannelObj, amateras: Amateras) {
        this.amateras = amateras
        this.game = obj.game
        this._thread = obj._thread
    }
}

interface GameChannelObj {
    _thread: _ThreadChannel
    game: Game
}