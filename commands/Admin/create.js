const Discord = require('discord.js')
const Guild = require('../../models/guild')

module.exports = {
    name: 'create',
    permissionError: 'You do not have permission to run this command.',
    permissions: [],
    requiredRoles: [],
    callback: async (message, args, client) => {
        const filter = m => m.author.id === message.author.id
        const filterReactions = (reaction, user) => {
            return ['check2', 'x_'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        let response = '';
        let array = []
        let types = []
        let attachments = []

        const result = await Guild.findOne({
            guildID: message.guild.id
        })
        if (!result) return message.reply('No document was found for your server.\nPlease set up your server using \`setup\`!')
        if (!result.channelID || !client.channels.cache.get(result.channelID)) return message.reply('No surveys channel found!\nPlease type \`!setchannel\` to create one!')
        if (!message.member.roles.cache.has(result.roleID) && !message.member.hasPermission('ADMINISTRATOR')) return message.reply('You cannot create surveys!')
        message.channel.send('Please type the questions you\'d like to add! (40 Characters Maximum)\nYou may type \`cancel\` to finish this request. Type \`done\` when you are finished adding your questions.\nYou may add attachments as well.\n\nFlags: (Start your questions with the following keywords to add the flag)\n```-c = choice (Yes / No input only)\n-n = number (Request number input only)\n-s = short answer (Request an answer of up to 30 characters)```\n**NOTE**: Questions will require long answers by default if no flag is added.')
        do {
            try {
                await message.channel.send(`Please type the question you\'d like to add.`)
                let epic = '';
                let msg
                let attachment
                do {
                    msg = await message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    })
                    epic = msg.first().content
                    attachment = msg.first().attachments.first() ? msg.first().attachments.first().url : ''
                    if (epic.length === 0) message.reply('Please attach a question to your files!')
                    if (epic.length > 40) message.reply(`Your question was too long. Please shorten it to a maximum of 40 characters. (${epic.length} characters)`)
                } while (epic.length > 40 && epic.length !== 0)
                response = msg.first().content
                if (response !== 'done' && response !== 'cancel' && response.length !== 0) {
                    if (['-c', '-n', '-s'].some(flag => response.toLowerCase().startsWith(`${flag} `))) {
                        const flag = response.split(' ')[0].toLowerCase()
                        response = response.split(' ').slice(1).join(' ')
                        if (flag === '-c') types.push('choice')
                        else if (flag === '-n') types.push('number')
                        else if (flag === '-s') types.push('short')
                    } else types.push('long')
                    array.push(response)
                    attachments.push(attachment)
                }
                else if (response === 'cancel') {
                    message.reply('Cancelled.')
                    return
                } else if (response === 'done' && array.length === 0) {
                    response = '';
                    message.reply('You haven\'t supplied any questions!')
                }
            } catch (ex) {
                console.log(ex)
                message.reply('You have not supplied a question in time.')
                return
            }
        } while (response !== 'done' && response !== 'cancel' && array.length !== 10)
        let questionsFinal = '';
        let i = 0;
        array.forEach(element => {
            questionsFinal += `${i + 1}. ${element} (${types[i].toUpperCase()})\n`
            i++
        })
        message.channel.send(`Please confirm the questions below:\n${questionsFinal}\n\n**NOTE**: Confirming will result in a deletion of the previous survey and a creation of the new one.`).then(async msg => {
            await msg.react('<:check2:801796347107213402>')
            await msg.react('<:x_:801796349452484628>')
            try {
                const reaction = await msg.awaitReactions(filterReactions, {
                    max: 1,
                    time: 30000,
                    errors: ['time']
                })
                if (reaction.first().emoji.name === 'x_') return message.reply('Cancelled.')
            } catch (ex) {
                message.reply('You have not supplied a response in time.')
                return
            }
            let name
            try {
                message.channel.send('How would you like to name this survey?')
                const entry = await message.channel.awaitMessages(filter, {
                    max: 1,
                    time: 60000,
                    errors: ['time']
                })
                name = entry.first().content
            } catch (ex) {
                console.error(ex)
                return message.reply('No name was given in time.')
            }
            await Guild.updateOne({
                guildID: message.guild.id
            }, {
                guildID: message.guild.id,
                $set: {
                    survey: array,
                    surveyTypes: types,
                    creatorID: message.author.id,
                    surveyName: name,
                    messageAttachments: attachments
                }
            }, {
                upsert: true
            }).then(message.reply('Survey successfully created!')).catch(err => console.error(err))

            const newResult = await Guild.findOne({ guildID: message.guild.id })
            if (newResult.announcementsChannelID) {
                const announcementEmbed = new Discord.MessageEmbed()
                .setTitle('New Survey!')
                .setDescription(`Hello everyone!\nWe have just published a new survey: **${newResult.surveyName}** by ${message.author}!\n\nPlease help us by taking a few minutes to answer it.\nHave a good day!\n\n**Please type**:\`\`\`!survey - To answer this survey\n!current - To view this survey\`\`\``)
                .setColor('#2aa27a')
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                try {
                    message.guild.channels.cache.get(newResult.announcementsChannelID).send(announcementEmbed)
                } catch { return }
            }
        })
    }
}