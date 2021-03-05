const mongoose = require('mongoose')

module.exports = client => {
    console.log(`>>> Active as ${client.user.username}`)
    client.user.setPresence({ activity: {name: `${client.guilds.cache.size} Servers!`, type: 'WATCHING'}, status: 'dnd'})
    setInterval(() => {
        client.user.setPresence({ activity: {name: `${client.guilds.cache.size} Servers!`, type: 'WATCHING'}, status: 'dnd'})
    }, 1000 * 60 * 10)

    mongoose.connect(process.env.MONGOOSE, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false
    }).then(console.log('>>> Connected to MongoDB'))
}
