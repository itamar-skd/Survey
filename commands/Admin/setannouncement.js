const Discord = require('discord.js')
const Guild = require('../../models/guild')

module.exports = {
    name: 'setannouncement',
    permissionError: 'You do not have permission to run this command.',
    devOnly: false,
    aliases: ['setannounce'],
    permissions: ['ADMINISTRATOR'],
    requiredRoles: [],
    callback: async (message, args, client) => {
        let channel = '';
        let epic = '';
        const filter = m => m.author.id === message.author.id
        message.channel.send('What channel should survey announcements be sent to?')
        do {
            await message.channel.send('Please reply with a valid ID or channel tag.\nYou may type \`cancel\` at any time to stop this process.')
            const entry = await message.channel.awaitMessages(filter, {
                max: 1,
                time: 60000,
                errors: ['time']
            })
            epic = entry.first().content
            channel = entry.first().guild.channels.cache.get(entry.first().content) || entry.first().mentions.channels.first()
            if (epic.toLowerCase() === 'cancel') return message.reply('Cancelled.')
        } while (!channel && epic.toLowerCase() !== 'cancel')
        await Guild.findOne({
            guildID: message.guild.id
        }, async (err, channelNew) => {
            if (err) console.error(err)
            if (!channelNew) {
                newChannel = new Guild({
                    guildID: message.guild.id,
                    announcementsChannelID: channel.id,
                    channelID: null
                })

                await newChannel.save().then(async () => {
                    const epic = await Guild.findOne({
                        guildID: message.guild.id
                    })
                    message.channel.send(`I have updated the survey announcements channel to be ${channel}!`)
                }).catch(err => console.error(err));
            } else {
                const currentChannel = message.guild.channels.cache.get(channelNew.announcementsChannelID)
                if (currentChannel && channel.id === currentChannel.id) return message.reply('That\'s already the survey announcements channel!')
                Guild.updateOne({
                    guildID: message.guild.id
                }, {
                    guildID: message.guild.id,
                    announcementsChannelID: channel.id
                }, {
                    upsert: true
                }).then(async () => {
                    const epic2 = await Guild.findOne({
                        guildID: message.guild.id
                    })
                    message.channel.send(`I have updated the survey announcements channel to be ${channel}!`)
                }).catch(err => console.error(err));
            }
        })
    }
}