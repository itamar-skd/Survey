const DS = require('discord.js')
const db = require('../../models/guild')

module.exports = {
    name: 'setroles',
    aliases: ['validroles'],
    expectedArgs: '<Roles>',
    permissionError: 'You do not have permission to run this command.',
    minArgs: 1,
    maxArgs: null,
    permissions: ['ADMINISTRATOR'],
    requiredRoles: [],
    callback: async (message, args, client) => {
        const role = message.mentions.roles

        if(!role) return message.reply('Please specify at least one role!')

        let text = ''

        role.map(async role => {
            text += `${role.name}\n`
            await db.findOne({
                guildID: message.guild.id
            }, async (err, data) => {
                if(err) console.log(err)
                if(!data) {
                    data = new db({
                        guildID: message.guild.id,
                        channelID: null,
                        roleID: [role.id],
                    })
                } else {
                    if(data.roleID.includes(role.id)) return message.reply(`${role.name} is already added!`)
                    data.roleID.push(role.id)
                }
                data.save()
                    .then(() => message.reply(`I have added these roles to the support roles:\n\n${text}`))
                    .catch(err => {
                        message.channel.send(`An error has occured!`)
                        console.log(err)
                    })
            })
        })
    }
}
