import { Interaction, Message, MessageFlags } from "discord.js";
import Amateras from "../lib/Amateras";
import fs from 'fs';

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction: Interaction, amateras: Amateras) {
            let consoleText = `command received: ${interaction.user.username} - `;
            if (interaction.isCommand()) { // If slash command message sent
                // Check command file exist
                if (fs.existsSync(`./commands/${interaction.commandName}.js`)) {
                    // Import command function
                    const commandFn = require(`../commands/${interaction.commandName}.js`);
                    // Call command Function
                    commandFn.default(interaction, amateras);
                    consoleText += `${ interaction.commandName }\n${ interaction.options.data }`
                } else {
                    // If command file not exist
                    console.error('Command not exist. Function file not found. (Amateras.js)')
                    return;
                }
            } else if (interaction.isSelectMenu()) { // If menu selected
                const flags = <MessageFlags>interaction.message.flags
                if (flags.toArray().includes('EPHEMERAL')) return
                const msg = (await amateras.messages?.fetch(interaction.message.id))
                if (!msg) {
                    console.error(`Msg "${interaction.id}" not found. (Amateras.js)`)
                    return
                }
                let SelectFn: string | undefined = ''
                if (!msg.actions) {
                    console.error(`Msg "${interaction.id}" actions is ${msg.actions}. (Amateras.js)`)
                    return
                }
                for (const action of msg.actions) {
                    for (const element of action) {
                        if (element.type === 'SELECT_MENU' && Object.keys(element.options).includes(interaction.values[0])) {
                            if (!element.options[interaction.values[0]]) {
                                console.error(`Msg "${msg.id}" Select menu "${element.customId}" function is ${element.options[interaction.values[0]]} (Amateras.js)`)
                                return
                            }
                            SelectFn = element.options[interaction.values[0]]
                        }
                    }
                }
                if (!SelectFn) {
                    //console.error(`Select menu "${interaction.customId}" not found in msg "${msg.id}" or type is uncorrect. (Amateras.js)`)
                    return
                }
                consoleText += `${ interaction.customId }\n${ interaction.values }`
                // Check function file exist
                if (fs.existsSync(`./reacts/${SelectFn}.js`)) {
                    // Import function
                    const fn = require(`../reacts/${SelectFn}.js`);
                    // Call Function
                    fn.default(interaction, amateras, msg.get);
                } else {
                    // If Function not exist
                    console.error(`Select menu "${interaction.customId}" function file not found. (Amateras.js)`)
                    return;
                }

            } else if (interaction.isContextMenu()) { // If context menu clicked
                if (fs.existsSync(`./context/${interaction.commandName}.js`)) {
                    // Import command function
                    const contextFn = require(`../context/${interaction.commandName}.js`);
                    // Call command Function
                    contextFn.default(interaction, amateras);
                    consoleText += `${ interaction.commandName }`
                }
            } else if (interaction.isButton()) { // If button clicked
                const flags = <MessageFlags>interaction.message.flags
                if (flags.toArray().includes('EPHEMERAL')) return
                const msg = (await amateras.messages?.fetch(interaction.message.id))
                if (!msg) {
                    console.error(`Msg "${interaction.id}" not found. (Amateras.js)`)
                    return
                }
                let buttonFn: string = ''
                if (!msg.actions) {
                    console.error(`Msg "${interaction.id}" actions is ${msg.actions}. (Amateras.js)`)
                    return
                }
                const customId = interaction.customId.split('#')[1]
                for (const action of msg.actions) {
                    for (const element of action) {
                        if (element.customId === customId && element.type === 'BUTTON') {
                            if (!element.fn) {
                                console.error(`Msg "${msg.id}" button "${element.customId}" function is ${element.fn} (Amateras.js)`)
                                return
                            }
                            buttonFn = element.fn
                        }
                    }
                }
                if (!buttonFn) {
                    console.error(`Button "${customId}" not found in msg "${msg.id}" or type is uncorrect. (Amateras.js)`)
                    return
                }
                consoleText += `${ customId }`
                // Check function file exist
                if (fs.existsSync(`./reacts/${buttonFn}.js`)) {
                    // Import function
                    const fn = require(`../reacts/${buttonFn}.js`);
                    // Call Function
                    fn.default(interaction, amateras);
                } else {
                    // If Function not exist
                    console.error(`Button "${interaction.customId}" function file not found. (Amateras.js)`)
                    return;
                }
                
            } else return;
            console.log(true, consoleText)

    }
}