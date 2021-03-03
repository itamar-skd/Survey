const DS = require('discord.js')

module.exports = {
    name: 'test',
    aliases: ['testing'],
    expectedArgs: '<testing args>',
    permissionError: 'You do not have permission to run this command.',
    minArgs: 1,
    maxArgs: null,
    devOnly: true,
    permissions: [],
    requiredRoles: [],
    callback: (message, args, client) => {
        message.channel.send('works')
    }
}
