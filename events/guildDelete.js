const Discord = require('discord.js')
const Guild = require('../models/guild')

module.exports = async (client, guild) => {
    const result = await Guild.findOne({ guildID: guild.id })
    if (result) result.delete()
}
