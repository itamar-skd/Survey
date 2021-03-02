const Discord = require('discord.js')
const Guild = require('../../models/guild')

module.exports = {
    name: 'survey',
    aliases: ['respond', 'fill'],
    permissionError: 'You do not have permission to run this command.',
    devOnly: false,
    permissions: [],
    requiredRoles: [],
    callback: async (message, args, client) => {
        let epic = true
        const filterReactions = (reaction, user) => {
            return ['check2', 'x_'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        const guild = await Guild.findOne({
            guildID: message.guild.id
        })

        const owner = await message.guild.members.fetch(message.guild.ownerID)
        if (!guild) return message.reply(`This guild doesn\'t have a document created!\nPlease ask ${owner.user.tag} or an Administrator to set it up!`)
        if (!guild.channelID) return message.reply(`This guild doesn\'t have a surveys channel created!\nPlease ask ${owner.user.tag} or an Administrator to set it up!`)
        if (guild.survey.length === 0) return message.reply(`This guild doesn\'t have a survey created!\nPlease ask ${owner.user.tag} or an Administrator to set it up!`)

        const msg = await message.author.send(`Hiya ${message.author}!\nAre you ready to answer ${message.guild.name}'s survey?`).catch(err => {
            epic = false
            return message.reply('I couldn\'t DM you! Please open personal DMs!')
        })

        if (!epic) return
        message.reply('I have sent you a DM!')
        await msg.react('<:check2:801796347107213402>')
        await msg.react('<:x_:801796349452484628>')
        let emoji
        try {
            const reaction = await msg.awaitReactions(filterReactions, {
                max: 1,
                time: 60000,
                errors: ['time']
            })
            emoji = reaction.first().emoji.name
        } catch (ex) {
            msg.channel.send('No valid response was given in time.')
        }

        if (emoji === 'x_') return msg.channel.send('Cancelled.')
        else {
            let answers = []
            for (const question of guild.survey) {
                await msg.channel.send(`${guild.survey.indexOf(question) + 1}. **${question}**:`)
                try {
                const collected = await msg.channel.awaitMessages(m => m.author.id === message.author.id, {
                    max: 1,
                    time: 180000,
                    errors: ['time']
                })
                answers.push(collected.first().content)
                if (guild.survey.indexOf(question) === guild.survey.length - 1) msg.channel.send('Thanks for taking the survey!\nWe have submitted your response to the guild\'s administrators!')
                } catch (ex) {
                    msg.channel.send('No valid response was given in time.')
                }
            }

            const channel = await client.channels.fetch(guild.channelID)
            const Embed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.tag}'s Response!`, message.author.displayAvatarURL())
            .setDescription(guild.survey.map(question => `${guild.survey.indexOf(question) + 1}. **${question}**\n\`${answers[guild.survey.indexOf(question)]}\``).join('\n\n'))
            .setColor(message.guild.me.displayColor)

            channel.send(Embed)
        }
    }
}
