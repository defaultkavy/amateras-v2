import { CommandInteraction, ContextMenuInteraction, GuildEmoji, MessageEmbed, MessageEmbedOptions } from 'discord.js'
import Amateras from './Amateras'
import { Mission } from './Mission'
import { Player } from './Player'
const { XMLHttpRequest } = require('xmlhttprequest')

export function emoji(name: string, amateras: Amateras): GuildEmoji | undefined {
    return amateras.client.emojis.cache.find(emoji => emoji.name === name)
}

export class cmd implements CMD {
    /**
     * Show debug message on terminal.
     * Example: DEBUG Your message
     * @param {string} content The message you want to show on terminal.
     */
    static debug(content: string) {
        console.log('DEBUG', content)
    }
    /**
     * Show log message on terminal.
     * Example: LOG Your message
     * @param {string} content The message you want to show on terminal.
     */
    static log(content: string) {
        console.log('LOG', content)
    }
    /**
     * Show system message on terminal.
     * Example: Your message
     * @param {string} content The message you want to show on terminal.
     */
    static sys(content: string) {
        console.log(content)
    }
    /**
     * Show error message on terminal.
     * Example: ERR Your message
     * @param {string} content The message you want to show on terminal.
     */
     static err(content: string) {
        console.log(false, content)
    }
}

export function cloneObj(obj: any, keys?: string[]) {
    let result: any = {};
    for (const i in obj) {
        if (keys && keys.indexOf(i) >= 0) continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
        result[i] = obj[i]
    }

    return result
}

export async function missionInfoEmbed(player: Player, interaction: CommandInteraction, mission: Mission) {
    const embed: MessageEmbedOptions = {
        title: mission.title,
        description: mission.description,
        fields: [
            {
                name: '报酬金',
                value: `${mission.pay}G`
            },
            {
                name: '期限',
                value: `${String(mission.expire.getFullYear())}年${String(mission.expire.getMonth() + 1)}月${String(mission.expire.getDate()).padStart(2, '0')}日`
            }
        ],
        author: {
            iconURL: interaction.user.displayAvatarURL({ size: 128 }),
            name: (await interaction.guild?.members.fetch(interaction.user.id))!.displayName
        }
    }
    return embed
}

export function idGenerator(length: number) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))  
    }
    return result
}

export function removeArrayItem<T>(arr: Array<T>, value: T): Array<T> { 
    const index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

export function validURL(str: string) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

export function checkImage(image_url: string) {
    var http = new XMLHttpRequest;

    http.open('HEAD', image_url, false);
    http.send();
    console.log(http.status)
    if (http.status !== 200) return false;
    return true
}