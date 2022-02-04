const Discord = require('discord.js')
const client = new Discord.Client({
    partials: ['CHANNEL', 'GUILD_MEMBER', 'REACTION']
})
require('dotenv').config()

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.aliases = new Discord.Collection();
client.devs = [];

["event", "command"].forEach(handler => {
    require(`./handlers/${handler}`)(client)
})

client.login(process.env.TOKEN)
