const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
    guildID: String,
    channelID: String,
    creatorID: String,
    surveyName: String,
    survey: Array,
    surveyTypes: Array,
    messageAttachments: Array,
    roleID: Array
});

module.exports = mongoose.model('guildepic', guildSchema);
