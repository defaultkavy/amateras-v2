import { Client as tClient } from 'tmi.js'

export default function twitch(bot: any) {
    const tclient = new tClient({
        options: { debug: true },
        identity: {
            username: 'amateras_bot',
            password: bot.twitchToken
        },
        channels: [ 'venicec' ]
    })
    
    tclient.connect();
    
    tclient.on('message', (channel, tags, message, self) => {
        // "Alca: Hello, World!"
        console.log(`${tags['display-name']}: ${message}`);
        console.log(tags)
    });
    
    tclient.on('connected', async (address, port) => {
    });

}