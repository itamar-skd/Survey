const { readdirSync} = require('fs')

module.exports = (client) => {
    const loadEvents = (files) => {
        const eventFiles = readdirSync(`./events/${files}`).filter(file => file.endsWith('.js'))
        for (const file of eventFiles) {
            const event = require(`../events/${file}`)
            const event_name = file.split('.')[0]
            client.on(event_name, event.bind(null, client))
        }
    }

    loadEvents('../events')
}