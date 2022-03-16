import { Interaction, Message, MessageFlags } from "discord.js";
import Amateras from "../lib/Amateras";
import fs from 'fs';

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction: Interaction, amateras: Amateras) {
        let consoleText = `command received: ${interaction.user.username} - `;
        const guild = interaction.guild
        const _guild = guild ? amateras.guilds.cache.get(guild.id) : undefined
        if (interaction.isCommand()) { // If slash command message sent
            if (!amateras.ready && interaction.commandName !== 'sys') return interaction.reply({content: '天照进入休眠中，无法使用请求', ephemeral: true})
            // Check _guild init ready
            if (_guild && _guild.ready === false) return interaction.reply({ content: '伺服器初始化中，无法执行请求', ephemeral: true })
            // Return when command run in special channel
            if (guild && interaction.commandName !== 'mod' && interaction.commandName !== 'sys') {
                if (_guild) {
                    if (interaction.channelId) {
                        if (_guild.lobby.channel && interaction.channelId === _guild.lobby.channel.id ||
                            _guild.musicPlayer.channel && interaction.channelId === _guild.musicPlayer.channel.id ||
                            _guild.forums.cache.has(interaction.channelId)) {
                                return interaction.reply({content: `你无法在这里发布请求指令`, ephemeral: true})
                            }
                    }
                }
            }
            // Check command file exist
            if (fs.existsSync(`./js/commands/${interaction.commandName}.js`)) {
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
            if (!amateras.ready) return interaction.reply({content: '天照进入休眠中，无法使用请求', ephemeral: true})
            if (_guild && _guild.ready === false) return interaction.reply({ content: '伺服器初始化中，无法执行请求', ephemeral: true })
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
            if (fs.existsSync(`./js/reacts/${SelectFn}.js`)) {
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
            if (!amateras.ready) return interaction.reply({content: '天照进入休眠中，无法使用请求', ephemeral: true})
            if (_guild && _guild.ready === false) return interaction.reply({ content: '伺服器初始化中，无法执行请求', ephemeral: true })
            if (fs.existsSync(`./js/context/${interaction.commandName}.js`)) {
                // Import command function
                const contextFn = require(`../context/${interaction.commandName}.js`);
                // Call command Function
                contextFn.default(interaction, amateras);
                consoleText += `${ interaction.commandName }`
            }
        } else if (interaction.isButton()) { // If button clicked
            if (!amateras.ready) return interaction.reply({content: '天照进入休眠中，无法使用请求', ephemeral: true})
            if (_guild && _guild.ready === false) return interaction.reply({ content: '伺服器初始化中，无法执行请求', ephemeral: true })
            const flags = <MessageFlags>interaction.message.flags
            if (flags.toArray().includes('EPHEMERAL')) return
            const msg = (await amateras.messages?.fetch(interaction.message.id))
            let buttonFn: string = ''
            let customId = interaction.customId.split('#')[1]
            if (msg && msg.actions) {
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
            }
            if (!buttonFn) {
                buttonFn = interaction.customId
            }
            consoleText += `${ customId }`
            console.debug(buttonFn)
            // Check function file exist
            if (fs.existsSync(`./js/reacts/${buttonFn}.js`)) {
                // Import function
                const fn = require(`../reacts/${buttonFn}.js`);
                // Call Function
                fn.default(interaction, amateras);
            } else {
                // If Function not exist
                console.error(`"${interaction.customId}" function file not found.`)
                return;
            }
            
        } else return;
        console.log(true, consoleText)

    }
}