import { CommandInteraction, ContextMenuInteraction, GuildEmoji, MessageEmbed, MessageEmbedOptions } from 'discord.js'
import Amateras from './Amateras'
import { Mission } from './Mission'
import { Player } from './Player'
const { XMLHttpRequest } = require('xmlhttprequest')

export function emoji(name: string, amateras: Amateras): GuildEmoji | undefined {
    return amateras.client.emojis.cache.find(emoji => emoji.name === name)
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
    if (typeof value === 'number' || typeof value === 'string') {
        const index = arr.indexOf(value);
        if (index > -1) {
          arr.splice(index, 1);
        }
    } else if (typeof value === 'object') {
        for (let i = 0; i < arr.length; i++) {
            if (objectEqual(arr[i], value)) {
                arr.splice(i, 1)
            }
        }
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
    if (!image_url || typeof image_url !== 'string') return false
    var http = new XMLHttpRequest;

    http.open('HEAD', image_url, false);
    http.send();
    if (http.status !== 200) return false;
    return true
}

export function wordCounter(txt: string, max: number) {
    let wordsCount = 0
    let result = ''
    for (const char of txt) {
        if (char.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/)) {
            wordsCount += 2
        } else {
            wordsCount += 1
        }
        if (wordsCount > max) {
            return result + "..."
        } else {
            result += char
        }
    }
    return result
}

export function arrayEqual(arr: any[], array: any[]) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (arr.length != array.length)
        return false;

    for (var i = 0, l=arr.length; i < l; i++) {
        // Check if we have nested arrays
        if (arr[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!arr[i].equals(array[i])) return false;
            
        } else if (arr[i] instanceof Object && array[i] instanceof Object){
            if (!objectEqual(arr[i], array[i])) return false

        } else if (arr[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }
    }       
    return true;
}

export function objectEqual(obj: any, object2: any) {
    //For the first loop, we only check for types
    for (const propName in obj) {
        //Check for inherited methods and properties - like .equals itself
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
        //Return false if the return value is different
        if (obj.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        }
        //Check instance type
        else if (typeof obj[propName] != typeof object2[propName]) {
            //Different types => not equal
            return false;
        }
    }
    //Now a deeper check using other objects property names
    for(const propName in object2) {
        //We must check instances anyway, there may be a property that only exists in object2
            //I wonder, if remembering the checked values from the first loop would be faster or not 
        if (obj.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
            return false;
        }
        else if (typeof obj[propName] != typeof object2[propName]) {
            return false;
        }
        //If the property is inherited, do not check any more (it must be equa if both objects inherit it)
        if(!obj.hasOwnProperty(propName))
          continue;
        
        //Now the detail check and recursion
        
        //This returns the script back to the array comparing
        /**REQUIRES Array.equals**/
        if (obj[propName] instanceof Array && object2[propName] instanceof Array) {
                   // recurse into the nested arrays
           if (!arrayEqual(obj[propName], (object2[propName]))) return false;
        }
        else if (obj[propName] instanceof Object && object2[propName] instanceof Object) {
                   // recurse into another objects
                   //console.log("Recursing to compare ", this[propName],"with",object2[propName], " both named \""+propName+"\"");
           if (!arrayEqual(obj[propName], (object2[propName]))) return false;
        }
        //Normal value comparison for strings and numbers
        else if(obj[propName] != object2[propName]) {
           return false;
        }
    }
    //If everything passed, let's say YES
    return true;
}  

export function arrayHasObj(arr: any[], obj: {}) {
    for (const child of arr) {
        if (child instanceof Object) {
            if (objectEqual(child, obj)) return true
        }
    }
    return false
}

export function equalOneOf<T>(target: T, array: T[]) {
    for (const element of array) {
        if (target === element) {
            return true
        }
    }
    return false
}

export function msTime(duration: number) {
    const millisecond = duration % 1000
    const second = Math.floor(duration / 1000)
    const minute = Math.floor(second / 60)
    const hour = Math.floor(minute / 60)
    const day = Math.floor(hour / 24)
    const year = Math.floor(day / 365)
    return {
        millisecond: millisecond - (second * 1000),
        second: second - (minute * 60),
        minute: minute - (hour * 60),
        hour: hour - (day * 24),
        day: day - (year * 365),
        year: year
    }
}

export function timestampDate(timestamp: number) {
    const date = new Date(timestamp)
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}