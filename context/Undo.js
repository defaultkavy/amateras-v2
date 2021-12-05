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
exports.default = execute;
function execute(interaction, amateras) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        if (interaction.guild) {
            const targetMessage = (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.messages.cache.get(interaction.targetId);
            if (((_b = targetMessage === null || targetMessage === void 0 ? void 0 : targetMessage.interaction) === null || _b === void 0 ? void 0 : _b.user.id) === interaction.user.id) {
                if (targetMessage.interaction.commandName === 'mission') {
                    interaction.reply({ content: '你无法撤销任务讯息。', ephemeral: true });
                    return;
                }
                try {
                    targetMessage.delete();
                }
                catch (err) {
                    throw err;
                }
                interaction.reply({ content: '已撤销。', ephemeral: true });
            }
            else {
                interaction.reply({ content: '你无法撤销此讯息。', ephemeral: true });
            }
        }
        else {
            console.error('interaction.guild is not defined. Undo.js => execute()');
        }
    });
}
//# sourceMappingURL=Undo.js.map