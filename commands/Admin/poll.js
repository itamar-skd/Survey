const DS = require('discord.js')
module.exports = {
    name: 'poll',
    aliases: [],
    expectedArgs: '<#channel>',
    permissionError: 'You do not have permission to run this command.',
    minArgs: 1,
    maxArgs: null,
    permissions: ['ADMINISTRATOR'],
    requiredRoles: [],
    callback: async (message, args, client) => {

        const channel = message.mentions.channels.first()

        if (!channel) return message.channel.send('Please provide a valid channel')

        const filter = m => m.author.id === message.author.id

        let msg
        message.channel.send('Please type the title of the poll.')
        try {
            msg = await message.channel.awaitMessages(filter, {
                max: 1,
                time: 60000,
                errors: ['time']
            })
        } catch (e) {
            console.log(e)
            message.channel.send('You did not respond in time!')
        }

        let msg2
        message.channel.send('Please type the description of the poll.')
        try {
            msg2 = await message.channel.awaitMessages(filter, {
                max: 1,
                time: 60000,
                errors: ['time']
            })
        } catch (e) {
            console.log(e)
            message.channel.send('You did not respond in time!')
        }

        const title = msg.first().content
        const desc = msg2.first().content

        const embed = new DS.MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({
                dynamic: true
            }))
            .setTitle(title)
            .setDescription(desc)
            .setColor('RANDOM')

        channel.send(embed).then(msg => {
            msg.react('👍').then(() => {
                msg.react('👎')
            })
        })
    }
}