const util = require("./util.js")

/*class ArgumentHandlerOLD {
  constructor() {
    this.active = {}
  }

  async run(args, message) {
    if (1 > args.length) return message.content
    this.active[message.author.id] = true
    let newContent = []
    newContent.push(message.prefix + message.command)
    for (let [i, a] of args.entries()) {
      if (i + 1 === args.length && a.type === "text") {
        let content = message.suffixOf(i)
        if (content.length === 0 && a.opt) {} else {
          if (this.test(content, a, message)) {
            content = await this.collect(a, message)
            if (!content) return delete this.active[message.author.id], false
          }
          content = await this.parse(content, a, message)
          if (!content) return delete this.active[message.author.id], false
          content.split(" ").forEach(c => newContent.push(c))
        }
      } else {
        let content = message.args[i]
        if (!content && a.opt) {} else {
          if (this.test(content, a, message)) {
            content = await this.collect(a, message)
            if (!content) return delete this.active[message.author.id], false
          }
          content = await this.parse(content, a, message)
          if (!content) return delete this.active[message.author.id], false
          newContent.push(content)
        }
      }
    }
    delete this.active[message.author.id]
    return newContent.join(" ")
  }

  async parse(content, arg, message) {
    if (arg.type.number) {
      return content
    } else if (arg.type === "name") {
      content = util.cleanVarName(content)
      return content
    } else if (arg.type === "text") {
      return content
    } else if (arg.type === "user") {
      if (/<@\d{18,21}>/.test(content) || /<@!\d{18,21}>/.test(content)) {
        content = content.replace(/[^1234567890]/g, "")
        return content
      } else if (/\d{18,21}/.test(content)) {
        content = content.replace(/[^1234567890]/g, "")
        return content
      } else if (/^.{2,32}#\d{4}$/.test(content)) {
        let nm = content.split("#")[0]
        let disc = content.split("#")[1]
        if (!message.guild) {
          if (nm === "Nitro" && disc === "1474") return "264087705124601856"
          if (nm === message.author.username && disc === message.author.discriminator) return message.author.id
          return this.collect(arg, message)
        }
        let user
        try {
          let members = await message.guild.fetchMembers()
          user = members.members.filter(m => m.user.username.toLowerCase().includes(nm.toLowerCase())).filter(m => m.user.discriminator === disc)
          user = user.first()
          if (!user) return this.collect(arg, message)
        } catch (err) {
          return this.collect(arg, message)
        }
        return user.user.id
      } else if (/^.{2,32}/.test(content)) {
        if (!message.guild) {
          if (content === "Nitro") return "264087705124601856"
          if (content === message.author.username) return message.author.id
          return this.collect(arg, message)
        }
        let user
        try {
          let members = await message.guild.fetchMembers()
          user = members.members.filter(m => m.user.username.toLowerCase().includes(content.toLowerCase()))
          user = user.first()
          if (!user) return this.collect(arg, message)
        } catch (err) {
          return this.collect(arg, message)
        }
        return user.user.id
      } else return this.collect(arg, message)
    } else if (arg.type === "channel") {
      if (/^<#\d{18,21}>$/.test(content)) {
        content = content.replace(/[^1234567890]/g, "")
        return content
      } else if (/^\d{18,21}$/.test(content)) {
        content = content.replace(/[^1234567890]/g, "")
        return content
      } else if (/^[a-z\-_]{2,100}$/.test(content)) {
        if (!message.guild) {
          return false
        }
        let channel = message.guild.channels.filter(c => c.name.includes(content))
        if (!channel.first()) return this.collect(arg, message)
        return channel.first().id
      } else return this.collect(arg, message)
    } else if (arg.type === "role") {
      if (/<@\d{18,21}>/.test(content)) {
        return content.replace(/[^1234567890]/g, "")
      } else if (/\d{18,21}/.test(content)) {
        return content.replace(/[^1234567890]/g, "")
      } else if (/.{2,32}/) {
        let roles = message.guild.roles.filter(r => r.name.toLowerCase().includes(content.toLowerCase()))
        if (!roles.first()) return this.collect(arg, message)
        return roles.first().id
      }
    }
  }

  test(content, arg) {
    if (!content) return true
    if (arg.type.number) {
      let num = parseInt(content) || "invalid"
      if (num === "invalid") return true
      if (arg.type.number.max !== "none" && num > arg.type.number.max) return true
      if (arg.type.number.min !== "none" && num < arg.type.number.min) return true
      return false
    } else if (arg.type === "name") {
      if (content.length > 100) return true
      if (content.replace(/\s+/g, "").length < 1) return true
      return false
    } else if (arg.type === "text") {
      if (content.length > 2000) return true
      if (content.replace(/\s+/g, "").length < 1) return true
      return false
    } else if (arg.type === "user") {
      if (content.replace(/\s+/g, "").length < 1) return true
      return false
    } else if (arg.type === "channel") {
      if (content.replace(/\s+/g, "").length < 1) return true
      return false
    } else if (arg.type === "role") {
      if (content.replace(/\s+/g, "").length < 1) return true
      return false
    }

  }

  chActive(message) {
    return this.active[message.author.id]
  }

  collect(arg, message) {

    return new Promise((resolve) => {

      let collector = message.channel.createMessageCollector(m => m.author.id === message.author.id, {
        time: 30000
      })

      collector.on("collect", msg => {
        if (msg.content === "cancel") return collector.stop("cancel")
        if (arg.type.number) {
          let num = parseInt(msg.content) || "invalid"
          if (num === "invalid") return collector.stop("invalid")
          if (arg.type.number.max !== "none" && num > arg.type.number.max) return collector.stop("invalid")
          if (arg.type.number.min !== "none" && num < arg.type.number.min) return collector.stop("invalid")
          collector.stop("valid")
          return resolve(msg.content)
        } else if (arg.type === "name") {
          if (msg.content.length > 100) return collector.stop("invalid")
          if (msg.content.replace(/\s+/g, "").length < 1) return collector.stop("invalid")
          msg.content = msg.content.replace(/\s/g, "-")
          collector.stop("valid")
          return resolve(msg.content)
        } else if (arg.type === "text") {
          if (msg.content.length > 2000) return collector.stop("invalid")
          if (msg.content.replace(/\s+/g, "").length < 1) return collector.stop("invalid")
          collector.stop("valid")
          return resolve(msg.content)
        } else if (arg.type === "user") {
          if (msg.content.replace(/\s+/g, "").length < 1) return collector.stop("invalid")
          collector.stop("valid")
          return resolve(msg.content)
        } else if (arg.type === "channel") {
          if (msg.content.replace(/\s+/g, "").length < 1) return collector.stop("invalid")
          collector.stop("valid")
          return resolve(msg.content)
        } else if (arg.type === "role") {
          if (msg.content.replace(/\s+/g, "").length < 1) return collector.stop("invalid")
          collector.stop("valid")
          return resolve(msg.content)
        }
      })

      collector.on("end", (c, reason) => {
        if (reason === "time" || reason === "cancel") {
          message.reply("Command cancelled")
          return resolve(false)
        }
        if (reason === "invalid") {
          return this.collect(arg, message)
        }
      })

      message.reply(`${arg.desc}\n\nRespond with \`cancel\` to cancel the command, it will automatically cancel in 30 seconds.`)
    })
  }
}*/

class Argument {

  constructor(arg, index, messageArgs) {
    this.prompt = arg.prompt // When first collecting it asks this prompt
    this.failed = arg.failed // If First collected is invalid, it asks again with more information
    this.type = arg.type // The type of the argument string, name, number, user, channel, role, selection, duration
    this.options = arg // Get the rest of the options
    this.index = index // The index of the argument
    this.msg = messageArgs // message.args array

    this._validateType() // Validate the argument type
  }

  async run(guild) {
    //First it is checking if the argument exists
    if (this._exists()) {
      //If it does exist then it validates
      if (!this._validateContent()) {
        //If it dosnt exist or it dosnt validate, it collects a new one
        await this._collect()
      } else return 
    } else this._collect()
    //Then it validates if the existing argument fits the type if it exists
    
    //It validates again
    //If everything is validated properly, it can then be parsed according to type, if not, it will ask again
    //If the parse fails, it will ask again
  }

  _exists() {
    return this.msg[this.index]
  }

  _validateContent() {

  }

  _regex(type, c) {
    let regs = {
      user() {
        return /^.{2,32}$/.test(c)
      },
      userdisc() {
        return /^.{2,32}#[0-9]{4}$/.test(c)
      },
      usermention() {
        return /^<@[0-9]{17,19}>$/.test(c) || /^<@![0-9]{17,19}>$/.test(c)
      },
      channel() {
        
      },
      channelmention() {

      },
      role() {

      },
      rolemention() {

      },
      id() {

      }
    }
    return regs[type]()
  }

  _validateType() {
    if (this.type === undefined) throw new TypeError("Type undefined")
    let types = {
      string() {
        this.options.max || (this.options.max = 2000)
      },
      name() {
        this.options.allowSpace || (this.options.allowSpace = false)
        this.options.max || (this.options.max = 100)
        this.options.min || (this.options.min = 2)
      },
      number() {
        this.options.max || (this.options.max = 2 ** 31 - 2)
        this.options.min || (this.options.min = 1)
      },
      user() {},
      channel() {},
      role() {},
      selection() {
        if (!this.options.opts) throw new TypeError("Selection options missing.")
      },
      duration() {}
    }
    if (!types[this.type]) throw new TypeError("Invalid Type " + this.type)
    types[this.type]()
  }

}

module.exports = class ArgumentHandler {

  static async run(message, args) {
    if (args.length < 1) return
    for (let [i, arg] of args.entries()) {
      let Arg = new Argument(arg, i, message.args)
      message.args[i] = await Arg.run()
    }
  }

}