const Discord = require('discord.js')

module.exports = (client, message) => {
  const args = message.content.slice(process.env.DEFAULT_PREFIX.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  let command = client.commands.get(cmd)

  if (message.author.bot) return;
  if (!message.content.startsWith(process.env.DEFAULT_PREFIX)) return;

  if (cmd.length === 0) return;

  if (!command) command = client.commands.get(client.aliases.get(cmd));

  if (command) {

    if (command.devOnly && !client.devs.includes(message.author.id)) return message.reply('This is a dev only command!')

    for (const permission of command.permissions) {
      if (!message.member.hasPermission(permission)) {
        const eembed = new Discord.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL({
            dynamic: true
          }))
          .setDescription(command.permissionError)
          .setColor('RED')
        message.channel.send(eembed)
        return
      }
    }

    for (const requiredRole of command.requiredRoles) {
      const role = message.guild.roles.cache.find(
        (role) => role.name.toLowerCase() === requiredRole
      )

      if (!role || !message.member.roles.cache.has(role.id)) {
        message.reply(`You must have the ${command.requiredRoles} role to execute this command`)
        return
      }
    }

    if (
      args.length < command.minArgs ||
      (command.maxArgs !== null && args.length > command.maxArgs)
    ) {
      message.reply(`Incorrect syntax, \`${process.env.DEFAULT_PREFIX}${command.name} ${command.expectedArgs}\``)
      return
    }

    command.callback(message, args, client)

    return
  }
}