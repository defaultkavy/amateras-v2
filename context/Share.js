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
const terminal_1 = require("../lib/terminal");
exports.default = execute;
function execute(interaction, amateras) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!amateras.players) {
            interaction.reply({ content: '命令无法使用：资料库不存在。', ephemeral: true });
            return;
        }
        if (interaction.guild) {
            let player = yield amateras.players.fetch(interaction.targetId);
            player.sendInfo(interaction, true);
        }
        else {
            terminal_1.cmd.err('interaction.guild is not defined.');
        }
    });
}
//# sourceMappingURL=Share.js.map