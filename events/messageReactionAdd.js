"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    name: 'messageReactionAdd',
    once: false,
    execute(reaction, user, amateras) {
        return __awaiter(this, void 0, void 0, function* () {
            yield reaction.message.fetch();
            if (!reaction.message.guild || !reaction.message.author || user.bot)
                return;
            const reactedPlayer = yield amateras.players.fetch(reaction.message.author.id);
            const reactPlayer = yield amateras.players.fetch(user.id);
            const reward = reactedPlayer.rewards.get('reacted');
            const reward2 = reactPlayer.rewards.get('react');
            if (reward)
                reward.add();
            if (reward2)
                reward2.add();
        });
    }
};
//# sourceMappingURL=messageReactionAdd.js.map