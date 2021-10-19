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
function item(interact, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        const player = yield amateras.players.fetch(interact.user.id);
        let list = '```';
        for (const reward of player.rewards.values()) {
            list += `${reward.title} - ${reward.count} / ${reward.reach}\n${reward.description}\n奖励：${reward.pay}G - 已完成${reward.times}次\n\n`;
        }
        list += '```';
        interact.reply({ content: list, ephemeral: true });
    });
}
exports.default = item;
//# sourceMappingURL=reward.js.map