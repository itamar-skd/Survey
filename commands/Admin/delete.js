const Discord = require('discord.js')
const Guild = require('../../models/guild')

module.exports = {
    name: 'delete',
    permissionError: 'You do not have permission to run this command.',
    permissions: [],
    requiredRoles: [],
    callback: async (message, args, client) => {
        const filterReactions = (reaction, user) => {
            return ['check2', 'x_'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        const guild = await Guild.findOne({
            guildID: message.guild.id
        })
        
        if (!guild) return message.reply('This server does not have a guild!')
        if (!guild.survey || guild.survey.length === 0) return message.reply('This server does not have a survey!')
        if (guild.roleID.some(role => message.member.roles.cache.has(role)) && !message.member.permissions.has('ADMINISTRATOR')) return message.reply('You do not have permission to delete surveys!')

        const msg = await message.channel.send(`Are you sure you\'d like to delete **${guild.surveyName}**?`)
        await msg.react('<:check2:801796347107213402>')
        await msg.react('<:x_:801796349452484628>')
        try {
            const reaction = await msg.awaitReactions(filterReactions, {
                max: 1,
                time: 180000,
                errors: ['time']
            })
            if (reaction.first().emoji.name === 'x_') return message.reply('Cancelled.')
        } catch (ex) {
            console.error(ex)
            return
        }
        await Guild.updateOne({
            guildID: message.guild.id
        }, {
            $set: {
                survey: null,
                surveyName: null,
                surveyTypes: null,
                creatorID: null
            }
        }).then(message.reply(`Sucessfully deleted ${guild.surveyName}!`)).catch(err => console.error(err))
    }
}