import { ButtonInteraction, CommandInteraction, ContextMenuInteraction, Interaction, Message, MessageFlags, SelectMenuInteraction } from "discord.js";
import Amateras from "../lib/Amateras";
import fs from 'fs';

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction: Interaction, amateras: Amateras) {
        let consoleText = `${interaction.user.username} - `;
        const guild = interaction.guild
        const _guild = guild ? amateras.guilds.cache.get(guild.id) : undefined

        if (interaction.isCommand()) { 

            if (!checkCommand(interaction)) return 
            executeCommand(`commands/${interaction.commandName}`)

        } else if (interaction.isSelectMenu()) { 
            
            if (!checkCommand(interaction)) return 

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

            executeCommand(`reacts/${SelectFn}`)

        } else if (interaction.isContextMenu()) {

            if (!checkCommand(interaction)) return 
            executeCommand(`context/${interaction.commandName}`)

        } else if (interaction.isButton()) { // If button clicked

            if (!checkCommand(interaction)) return 
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
            executeCommand(`reacts/${buttonFn}`)
            
        } else return;

        /**
         * Find file and execute command file
         * @param path Path to command files list
         */
        function executeCommand(path: string) {
            // Check command file exist
            if (fs.existsSync(`./js/${path}.js`)) {
                const commandFn = require(`../${path}.js`);
                commandFn.default(interaction, amateras);
                consoleText += `${ path }`
                console.log(consoleText)
            } else {
                throw new Error('Command not exist. Function file not found.')
            }
        }

        function checkCommand(interaction: Interaction) {

            if (interaction instanceof CommandInteraction) {

                if (!amateras.ready && interaction.commandName !== 'sys') {
                    interaction.reply({content: '天照进入休眠中，无法使用请求', ephemeral: true})
                    return false
                }

                // Check _guild init ready
                if (_guild && _guild.ready === false) {
                    interaction.reply({ content: '伺服器初始化中，无法执行请求', ephemeral: true })
                    return false
                }
    
                // Command channel error
                if (guild && interaction.commandName !== 'mod' && interaction.commandName !== 'sys' && _guild && interaction.channelId) {
                    if (_guild.lobby.channel && interaction.channelId === _guild.lobby.channel.id ||
                        _guild.musicPlayer.channel && interaction.channelId === _guild.musicPlayer.channel.id ||
                        _guild.forums.cache.has(interaction.channelId)) {
                            interaction.reply({content: `你无法在这里发布请求指令`, ephemeral: true})
                            return false
                        }
                }

            } else if (interaction instanceof SelectMenuInteraction ||
                    interaction instanceof ContextMenuInteraction ||
                    interaction instanceof ButtonInteraction) {
                if (!amateras.ready) {
                    interaction.reply({content: '天照进入休眠中，无法使用请求', ephemeral: true})
                    return false
                }
    
                if (_guild && _guild.ready === false) {
                    interaction.reply({ content: '伺服器初始化中，无法执行请求', ephemeral: true })
                    return false
                }

            } else { // unhandle interaction type
                return false
            }
            return true
        }
    }
}