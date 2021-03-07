const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
    guildID: String,
    channelID: String,
    creatorID: String,
    surveyName: String,
    announcementsChannelID: String,
    pollsChannelID: String,
    survey: Array,
    surveyTypes: Array,
    messageAttachments: Array,
    roleID: Array
});

module.exports = mongoose.model('guildepic', guildSchema);
