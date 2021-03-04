const Discord = require('discord.js')
const Guild = require('../../models/guild')

module.exports = {
    name: 'survey',
    aliases: ['respond', 'fill'],
    permissionError: 'You do not have permission to run this command.',
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

        const msg = await message.author.send(`Hiya ${message.author}!\nAre you ready to answer ${message.guild.name}'s survey: **${guild.surveyName}**?`).catch(err => {
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
            console.error(ex)
            return
        }

        if (emoji === 'x_') return msg.channel.send('Cancelled.')
        else {
            let answers = []
            let reply
            let c = 0
            for (const question of guild.survey) {
                await msg.channel.send(`${c + 1}. **${question}**: (${Math.floor(1500 / guild.survey.length)} characters)`, guild.messageAttachments[c] ? new Discord.MessageAttachment(guild.messageAttachments[c]) : '')
                do {
                    try {
                        const collected = await msg.channel.awaitMessages(m => m.author.id === message.author.id, {
                            max: 1,
                            time: 180000,
                            errors: ['time']
                        })
                        reply = collected.first().content
                        if (reply.length > Math.floor(1500 / guild.survey.length)) msg.channel.send(`Your answer was too long. Please shorten it. (${reply.length} characters)`)
                    } catch (ex) {
                        console.error(ex)
                        return
                    }
                } while (reply.length > Math.floor(1500 / guild.survey.length))
                answers.push(reply)
                c++
            }
            let answersFinal = ''
            let b = 1
            guild.survey.forEach(element => {
                answersFinal += `${b}. **${element}**\n\`${answers[b - 1]}\`\n\n`
                b++
            })

            msg.channel.send(`Here are your final answers!\nAre you sure you want to submit it?`, {
                embed: {
                    description: answersFinal,
                    color: '#2aa27a'
                }
            }).then(async msg => {
                try {
                    await msg.react('<:check2:801796347107213402>')
                    await msg.react('<:x_:801796349452484628>')
                    const reaction = await msg.awaitReactions(filterReactions, {
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    })
                    const emoji = reaction.first().emoji.name
                    if (emoji === 'x_') return message.reply('Cancelled.')
                } catch (ex) {
                    console.error(ex)
                    return
                }

                msg.channel.send(`Thanks for submitting a response!\nWe\'ve sent it to ${message.guild.name}\'s administrators. :)`)
                const channel = await client.channels.fetch(guild.channelID)
                const Embed = new Discord.MessageEmbed()
                    .setAuthor(`${message.author.tag}'s Response!`, message.author.displayAvatarURL())
                    .setDescription(answersFinal)
                    .setColor(message.guild.me.displayColor)

                channel.send(Embed)
            })
        }
    }
}
