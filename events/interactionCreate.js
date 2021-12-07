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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
module.exports = {
    name: 'interactionCreate',
    once: false,
    execute(interaction, amateras) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let consoleText = `command received: ${interaction.user.username} - `;
            if (interaction.isCommand()) { // If slash command message sent
                // Check command file exist
                if (fs_1.default.existsSync(`./commands/${interaction.commandName}.js`)) {
                    // Import command function
                    const commandFn = require(`../commands/${interaction.commandName}.js`);
                    // Call command Function
                    commandFn.default(interaction, amateras);
                    consoleText += `${interaction.commandName}\n${interaction.options.data}`;
                }
                else {
                    // If command file not exist
                    console.error('Command not exist. Function file not found. (Amateras.js)');
                    return;
                }
            }
            else if (interaction.isSelectMenu()) { // If menu selected
                const flags = interaction.message.flags;
                if (flags.toArray().includes('EPHEMERAL'))
                    return;
                const msg = (yield ((_a = amateras.messages) === null || _a === void 0 ? void 0 : _a.fetch(interaction.message.id)));
                if (!msg) {
                    console.error(`Msg "${interaction.id}" not found. (Amateras.js)`);
                    return;
                }
                let SelectFn = '';
                if (!msg.actions) {
                    console.error(`Msg "${interaction.id}" actions is ${msg.actions}. (Amateras.js)`);
                    return;
                }
                for (const action of msg.actions) {
                    for (const element of action) {
                        if (element.type === 'SELECT_MENU' && Object.keys(element.options).includes(interaction.values[0])) {
                            if (!element.options[interaction.values[0]]) {
                                console.error(`Msg "${msg.id}" Select menu "${element.customId}" function is ${element.options[interaction.values[0]]} (Amateras.js)`);
                                return;
                            }
                            SelectFn = element.options[interaction.values[0]];
                        }
                    }
                }
                if (!SelectFn) {
                    //console.error(`Select menu "${interaction.customId}" not found in msg "${msg.id}" or type is uncorrect. (Amateras.js)`)
                    return;
                }
                consoleText += `${interaction.customId}\n${interaction.values}`;
                // Check function file exist
                if (fs_1.default.existsSync(`./reacts/${SelectFn}.js`)) {
                    // Import function
                    const fn = require(`../reacts/${SelectFn}.js`);
                    // Call Function
                    fn.default(interaction, amateras, msg.get);
                }
                else {
                    // If Function not exist
                    console.error(`Select menu "${interaction.customId}" function file not found. (Amateras.js)`);
                    return;
                }
            }
            else if (interaction.isContextMenu()) { // If context menu clicked
                if (fs_1.default.existsSync(`./context/${interaction.commandName}.js`)) {
                    // Import command function
                    const contextFn = require(`../context/${interaction.commandName}.js`);
                    // Call command Function
                    contextFn.default(interaction, amateras);
                    consoleText += `${interaction.commandName}`;
                }
            }
            else if (interaction.isButton()) { // If button clicked
                const flags = interaction.message.flags;
                if (flags.toArray().includes('EPHEMERAL'))
                    return;
                const msg = (yield ((_b = amateras.messages) === null || _b === void 0 ? void 0 : _b.fetch(interaction.message.id)));
                if (!msg) {
                    console.error(`Msg "${interaction.id}" not found. (Amateras.js)`);
                    return;
                }
                let buttonFn = '';
                if (!msg.actions) {
                    console.error(`Msg "${interaction.id}" actions is ${msg.actions}. (Amateras.js)`);
                    return;
                }
                const customId = interaction.customId.split('#')[1];
                for (const action of msg.actions) {
                    for (const element of action) {
                        if (element.customId === customId && element.type === 'BUTTON') {
                            if (!element.fn) {
                                console.error(`Msg "${msg.id}" button "${element.customId}" function is ${element.fn} (Amateras.js)`);
                                return;
                            }
                            buttonFn = element.fn;
                        }
                    }
                }
                if (!buttonFn) {
                    console.error(`Button "${customId}" not found in msg "${msg.id}" or type is uncorrect. (Amateras.js)`);
                    return;
                }
                consoleText += `${customId}`;
                // Check function file exist
                if (fs_1.default.existsSync(`./reacts/${buttonFn}.js`)) {
                    // Import function
                    const fn = require(`../reacts/${buttonFn}.js`);
                    // Call Function
                    fn.default(interaction, amateras);
                }
                else {
                    // If Function not exist
                    console.error(`Button "${interaction.customId}" function file not found. (Amateras.js)`);
                    return;
                }
            }
            else
                return;
            console.log(true, consoleText);
        });
    }
};
//# sourceMappingURL=interactionCreate.js.map