const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
    guildID: String,
    channelID: String,
    roleID: Array,
    survey: Array
});

module.exports = mongoose.model('guildepic', guildSchema);
