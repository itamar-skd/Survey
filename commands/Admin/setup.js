const DS = require('discord.js')
const db = require('../../models/guild')
const Guild = require('../../models/guild')

module.exports = {
    name: 'setup',
    permissionError: 'You do not have permission to run this command.',
    permissions: ['ADMINISTRATOR'],
    requiredRoles: [],
    callback: async (message, args, client) => {
       let guild = await Guild.findOne({
            guildID: message.guild.id
        })

        if (!guild) {
            guild = await new Guild({
                guildID: message.guild.id,
                channelID: null,
                announcementsChannelID: null
            }).then(result => console.log(result)).catch(err => console.error(err))
        }
        let channel
        let announcements
        if (guild.channelID) channel = guild.channelID
        else {
            channelID = await message.guild.channels.create('surveys', {
                type: 'text',
                topic: 'This is a survey channel! You may expect survey answers to be posted here soon :)',
                permissionOverwrites: [{
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                }],
            })
            channel = channelID.id
            message.channel.send(`I have created a new Surveys channel: ${channelID}!`)
        }
        if (guild.announcementsChannelID) announcements = guild.announcementsChannelID
        else {
            const announcementsChannel = await message.guild.channels.create('survey-announcements', {
                type: 'text',
                topic: 'This is the survey announcements channel! Survey announcements will be posted here once created. :)',
                permissionOverwrites: [{
                    id: message.guild.id,
                    deny: 'SEND_MESSAGES'
                }],
            })
            announcements = announcementsChannel.id
            message.channel.send(`I have created a new Survey Announcements channel: ${announcementsChannel}!`)
        }

        if (announcements === guild.announcementsChannelID && channel === guild.channelID) return message.reply('There was nothing new to create!')
        else {
            const parent = await message.guild.channels.create('survey', {
                type: 'category',
                permissionOverwrites: [{
                    id: message.guild.id,
                    deny: 'SEND_MESSAGES'
                }],
                position: 1
            })
            if (announcements !== guild.announcementsChannelID) announcementsChannel.setParent(parent)
            if (channel !== guild.channelID) channelID.setParent(parent)
        }
        await Guild.updateOne({
            guildID: message.guild.id
        }, {
            $set: {
                channelID: channel,
                announcementsChannelID: announcements
            }
        }, {
            upsert: true
        })
    }
}