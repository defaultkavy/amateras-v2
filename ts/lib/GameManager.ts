import { GuildMember } from "discord.js";
import Amateras from "./Amateras";
import { Blackjack } from "./Blackjack";
import { Game } from "./Game";
import { GameChannel } from "./GameChannel";
import { Player } from "./Player";
import { _Guild } from "./_Guild";
import { _TextChannel } from "./_TextChannel";

export class GameManager {
    amateras: Amateras;
    _guild: _Guild;
    caches: Map<string, Game>;
    channels: Map<string, GameChannel>;
    constructor(_guild: _Guild, amateras: Amateras) {
        this.amateras = amateras
        this._guild = _guild
        this.caches = new Map()
        this.channels = new Map()
    }

    async start(name: 'Blackjack', _channel: _TextChannel, owner: Player, member: GuildMember) {
        if (name === 'Blackjack') {
            const game = new Blackjack({_channel: _channel, _guild: this._guild, owner: owner, owner_member: member}, this.amateras)
            this.caches.set(owner.id, game)
            return game
        }
    }
}