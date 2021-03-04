const DS = require('discord.js')

module.exports = {
    name: 'test',
    aliases: ['testing'],
    expectedArgs: '<testing args>',
    permissionError: 'You do not have permission to run this command.',
    devOnly: true,
    permissions: [],
    requiredRoles: [],
    callback: (message, args, client) => {
        const hello = 1
        const epic = `${hello === 1}`

        if (eval(epic)) console.log('hi')
    }
}
