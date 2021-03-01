const { readdirSync } = require("fs");
const path = require('path')

const validatePermissions = (permissions) => {
    const validPermissions = [
      'CREATE_INSTANT_INVITE',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'ADMINISTRATOR',
      'MANAGE_CHANNELS',
      'MANAGE_GUILD',
      'ADD_REACTIONS',
      'VIEW_AUDIT_LOG',
      'PRIORITY_SPEAKER',
      'STREAM',
      'VIEW_CHANNEL',
      'SEND_MESSAGES',
      'SEND_TTS_MESSAGES',
      'MANAGE_MESSAGES',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'READ_MESSAGE_HISTORY',
      'MENTION_EVERYONE',
      'USE_EXTERNAL_EMOJIS',
      'VIEW_GUILD_INSIGHTS',
      'CONNECT',
      'SPEAK',
      'MUTE_MEMBERS',
      'DEAFEN_MEMBERS',
      'MOVE_MEMBERS',
      'USE_VAD',
      'CHANGE_NICKNAME',
      'MANAGE_NICKNAMES',
      'MANAGE_ROLES',
      'MANAGE_WEBHOOKS',
      'MANAGE_EMOJIS',
    ]
  
    for (const permission of permissions) {
      if (!validPermissions.includes(permission)) {
        throw new Error(`Unknown permission node "${permission}"`)
      }
    }
  }

module.exports = client => {
    readdirSync("./commands/").forEach((dir) => {
        const commands = readdirSync(`./commands/${dir}/`).filter((file) =>
          file.endsWith(".js")
        );
        for (let file of commands) {
          let cmd = require(path.resolve(`./commands/${dir}/${file}`));
          if (cmd.name) {
            client.commands.set(cmd.name, cmd);
            if (cmd.permissions.length) {
                if (typeof cmd.permissions === 'string') {
                  permissions = [permissions]
                }
                validatePermissions(cmd.permissions)
              }
                console.log(`>>> Registering command "${cmd.name}"`)
          } else {
            continue;
          }
          if (cmd.aliases && Array.isArray(cmd.aliases))
            cmd.aliases.forEach((alias) => client.aliases.set(alias, cmd.name));
        }
      });
}