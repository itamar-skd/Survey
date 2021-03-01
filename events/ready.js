const mongoose = require('mongoose')

module.exports = client => {
    console.log(`>>> Active as ${client.user.username}`)

    mongoose.connect(process.env.MONGOOSE, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false
    }).then(console.log('>>> Connected to MongoDB'))
}