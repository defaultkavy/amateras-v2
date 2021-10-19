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
        if (interaction.user.id !== ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.ownerId)) {
            yield interaction.reply({ content: '此功能无法使用。', ephemeral: true });
            return;
        }
        const targetMessage = yield ((_b = interaction.channel) === null || _b === void 0 ? void 0 : _b.messages.fetch(interaction.targetId));
        yield (targetMessage === null || targetMessage === void 0 ? void 0 : targetMessage.reply('😡'));
        yield interaction.reply({ content: 'Sent.', ephemeral: true });
    });
}
//# sourceMappingURL=Angry.js.map