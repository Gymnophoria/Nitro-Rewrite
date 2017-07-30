const Duration = require("duration-js")
const prettyms = require("pretty-ms")

module.exports = new Nitro.Command({
  help: "Mute a user.",
  example: "${p}mute @Nitro He is a bot.",
  argExample: "<user> <reason>",
  dm: false,
  coolDown: 1,
  userPerms: ["KICK_MEMBERS"],
  botPerms: ["MANAGE_ROLES"],

  args: [],

  run: async (message, bot, send) => {
    return send(bot.succ("Don't mute the user", message.author.tag))
    if (!message.checkSuffix) return send("**Example: " + module.exports.example.replace("${p}", message.prefix) + "**")
    let user = message.args[0]
    let reason = message.suffixOf(2).length > 0 ? message.suffixOf(2) : false
    let member = await message.parseUser(user)
    if (!member) return send("**Could not find the user: **" + user)
    let time
    try {
      time = new Duration(message.args[1])
    } catch (err) {
      return send("**Invalid Time Format:** " + message.args[1])
    }
    if (time.minutes() < 1) return send("**Mutes must be at least 1 minute**")
    if (time.days() > 7) return send("**Mutes can not be longer than a week**")
    let pretty = prettyms(time.milliseconds(), {verbose: true})
    let embed = new bot.embed()
    let Muted = message.guild.roles.find("name", "Muted")
    if (!Muted) {
      embed.setDescription("I did not find a Muted role on your server, would you like me to create one?")
      embed.setAuthor(bot.user.username, bot.user.avatarURL())
      embed.setFooter("yes/no")
      embed.setColor(embed.randomColor)
      embed.setTimestamp(new Date())
      send("", {embed})
      let create = await message.collectMessage(["yes", "y", "yup"], ["no", "n", "nope"], "author")
      if (!create) return send("**I can not mute users until the Muted role is created.**")
      try {
        Muted = await message.guild.createRole({
          data: {
            name: "Muted"
          },
          reason: "Nitro's Muted Role"
        })
      } catch (err) {
        console.log(err)
        return send("**I was unable to create the Muted role**")
      }
      message.guild.channels.forEach(c => c.overwritePermissions(Muted, {SEND_MESSAGES: false}))
    }
    const clientMember = message.guild.member(bot.user)
    if (Muted.position > clientMember.highestRole.position) return send("**The Muted role is higher than my highest role**")
    try {
      await member.send(`**You have been muted in ${message.guild.name}**\n\n**Length:** ${pretty}\n**Reason:** ${reason || "None"}`)
    } catch (err) {
      console.log(err)
    }
    bot.timer.add({
      id: member.user.id,
      guild: message.guild.id,
      moderator: message.author.id,
      action: "mute",
      length: time.milliseconds(),
      started: Date.now()
    })
    try {
      await member.addRole(Muted)
      let caseman = message.guild.check("caseman")
      if (!caseman) throw new Error("CaseManager was not initialized.")
      caseman.newCase(message.author, member.user, "mute", {reason: reason})
    } catch (err) {
      console.log(err)
      return send("**I was unable to mute the user:** " + member.user.tag)
    }
    send("**Muting User**")
  }
})
