const Client = require("../../struct/Client.js")
const client = new Client("poll")
client.database()
module.exports = client.bot
require("./message.js")
client.login()
