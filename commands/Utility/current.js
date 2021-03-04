const Discord = require('discord.js')
const Guild = require('../../models/guild')

module.exports = {
    name: 'current',
    aliases: ['view', 'currentsurvey'],
    permissionError: 'You do not have permission to run this command.',
    permissions: [],
    requiredRoles: [],
    callback: async (message, args, client) => {
        const result = await Guild.findOne({
            guildID: message.guild.id
        })

        const owner = await message.guild.members.fetch(message.guild.ownerID)
        if (!result) return message.reply(`This guild does not have a document created!\nPlease contact ${owner.user.tag} or an Administrator if you believe this is a mistake.`)
        if (result.survey.length < 1) return message.reply('This guild does not have a survey!')

        let questions = '';
        let i = 1;

        result.survey.forEach(question => {
            questions += `${i}. ${question}\n`
            i++
        })
        const author = await message.guild.members.fetch(result.creatorID)
        const Embed = new Discord.MessageEmbed()
        .setTitle(`Viewing Survey: ${result.surveyName}`)
        .setAuthor(`By ${author.user.tag}!`, author.user.displayAvatarURL())
        .setDescription(`\`\`\`${questions}\`\`\``)
        .setColor(message.guild.me.displayColor)
        message.channel.send(Embed)
    }
}