const Discord = require('discord.js')
const _ = require('lodash')
const { connect } = require('mongoose')
const { Options } = require('./Options')
const { EventEmitter } = require('events')
const { AchievementType, LevelManagerEvents } = require('../interfaces')
const { capitalize } = require('../utils/Capitalize')
const { AchievementBuilder } = require('../structures/AchievementBuilder')
const { RankBuilder } = require('../structures/RankBuilder')
const { readdirSync } = require('fs')
const { GuildsData } = require('../model')
const { Guild } = require('../structures/Guild')
const { GuildManager } = require('../managers/GuildManager')
const { UserDoc } = require('../structures/UserData')

/**
 * The hub of the library, this class is responsible for managing the ranks, achievements, and users from database.
 * @extends {EventEmitter}
 */
class LevelManager extends EventEmitter {
  /** @type {Discord.Client} */
  client
  /** @type {String} */
  mongoURI
  /** @type {import('../../typings').Rank[]} */
  ranks
  /** @type {import('../../typings').Achievement[]} */
  achievements
  /** @type {Number} */
  maxXpToLevelUp
  /** @type {Number} */
  saveInterval
  /** @type {Boolean} */
  autoSave
  /** @type {String} */
  eventsPath
  /** @type {GuildManager} */
  guilds

  /**
   * @param {Discord.Client} client - Discord client
   * @param {import('../../typings').LevelManagerOptions} options - Options for the level manager
   */
  constructor(client, options) {
    super()

    if (!client) throw new TypeError('Missing argument: client')

    if (!(client instanceof Discord.Client)) throw new TypeError('Client must be a discord client instance.')

    this.client = client

    this.#checkOptions(options)

    this.ranks = options.ranks ?? Options.setDefaultRanks()

    this.achievements = options.achievements ?? Options.setDefaultAchievements()

    this.maxXpToLevelUp = options.maxXpToLevelUp ?? 2500

    this.saveInterval = options.saveInterval ?? 1000 * 60 * 60 * 3

    this.autoSave = options.autoSave ?? true

    this.eventsPath = options.eventsPath ?? undefined

    this.mongoURI = options.mongoUri

    this.guilds = new GuildManager(client, [])

    this.#init()
  }

  /**
   * Check if options have the correct type
   * @param {import('../../typings').LevelManagerOptions} options
   */
  #checkOptions (options) {
    if (!options) throw new TypeError('Missing argument: options')

    if (typeof options !== 'object') throw new TypeError('Options must be a object.')

    if (!options.mongoUri) throw new TypeError('Options must have a mongodb uri.')

    if (typeof options.mongoUri !== 'string') throw new TypeError('Mongo uri must be a string.')

    if (options.ranks && !Array.isArray(options.ranks)) throw new TypeError('Ranks must be a array.')

    if (options.ranks && !options.ranks.length) throw new TypeError('Ranks must have at least one element.')

    if (options.achievements && !Array.isArray(options.achievements)) throw new TypeError('Achievements must be a array.')

    if (options.achievements && !options.achievements.length) throw new TypeError('Achievements must have at least one element.')

    if (options.maxXpToLevelUp && typeof options.maxXpToLevelUp !== 'number') throw new TypeError('Property maxXpToLevelUp must be a number.')

    if (options.saveInterval && typeof options.saveInterval !== 'number') throw new TypeError('Property saveInterval must be a number.')

    if (options.autoSave && typeof options.autoSave !== 'boolean') throw new TypeError('Property autoSave must be a boolean.')

    if (options.eventsPath && typeof options.eventsPath !== 'string') throw new TypeError('Property eventsPath must be a string.')

    if (options.ranks) this.#checkRanks(options.ranks)

    if (options.achievements) this.#checkAchievements(options.achievements)
  }

  /**
   * Check if ranks have the correct type and if have all properties
   * @param {import('../../typings').Rank[] | RankBuilder[]} ranks
   */
  #checkRanks (ranks) {
    const rankProperties = Object.freeze({
      nameplate: 'string',
      color: 'string',
      priority: 'number',
      min: 'number',
      max: 'number'
    })

    this.ranks = []

    for (const rank of ranks) {
      if (typeof rank !== 'object' && !(rank instanceof RankBuilder)) throw new TypeError('Ranks must be a array of object or instance of Rank.')

      /** @type {import('../../typings').Rank} */
      let rankData

      if (rank instanceof RankBuilder) rankData = rank.toJSON()
      else rankData = rank

      for (const key in rankProperties) {
        const property = rankData[key] ?? null
        const expectedType = rankProperties[key]

        if (!property) throw new TypeError('Ranks must have all properties: nameplate, color, priority, min, and max.')

        // eslint-disable-next-line valid-typeof
        if (typeof property !== expectedType) throw new TypeError(`${capitalize(key)} must be a ${expectedType}.`)

        this.ranks.push(rankData)
      }
    }
  }

  /**
   * Check if achievements have the correct type and if have all properties
   * @param {import('../../typings').Achievement[] | AchievementBuilder[]} achievements
   */
  #checkAchievements (achievements) {
    const achievementProperties = Object.freeze({
      name: 'string',
      description: 'string',
      thumbnail: 'string',
      reward: 'number',
      type: 'enum',
      progress: 'object'
    })

    this.achievements = []

    for (const achievement of achievements) {
      if (typeof achievement !== 'object' && !(achievement instanceof AchievementBuilder)) throw new TypeError('Achievements must be a array of object or instance of Achievement.')

      let achievementData
      if (achievement instanceof AchievementBuilder) achievementData = achievement.toJSON()
      else achievementData = achievement

      for (const key in achievementProperties) {
        const property = achievementData[key] ?? null
        const expectedType = achievementProperties[key]

        if (!property && key !== 'thumbnail') throw new TypeError('Achievements must have all properties: name, description, reward, and type. (thumbnail is optional)')

        if (key === 'progress' && property && !Array.isArray(property)) throw new TypeError('Progress must be a array.')

        if (key === 'thumbnail' && property && typeof property !== 'string') throw new TypeError('Thumbnail must be a string. (optional)')

        // eslint-disable-next-line valid-typeof
        if (property && !['type', 'progress'].includes(key) && typeof property !== expectedType) throw new TypeError(`${capitalize(key)} must be a ${expectedType}.`)

        if (property && key === 'type' && !Object.values(AchievementType).includes(property)) throw new TypeError('Type must be a valid achievement type.')
      }
    }
  }

  #init () {
    if (this.eventsPath) this.#loadEvents()

    if (this.autoSave) this.#startAutoSave()

    this.#loadUsers()
  }

  async #loadEvents () {
    const events = await readdirSync(this.eventsPath)
    const totalEvents = []

    for (const eventFile of events) {
      const event = require(`${this.eventsPath}/${eventFile}`)

      if (!event.eventType) throw new TypeError('Event must have a eventType property.')

      if (!event.run) throw new TypeError('Event must have a run method.')

      if (typeof event.run !== 'function') throw new TypeError('Event run method must be a function.')

      if (!Object.values(LevelManagerEvents).includes(event.eventType)) throw new TypeError('Event type must be a valid event type.')

      totalEvents.push(event.eventType)

      this.on(event.eventType, event.run.bind(null, this))
    }

    console.table(totalEvents)
  }

  #startAutoSave () {
    setInterval(async () => {
      await this.saveUsers()
    }, this.saveInterval)
  }

  async #loadUsers () {
    await connect(this.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(async () => {
      /** @type {import('../../typings').DataBaseData[]} */
      const bunch = await GuildsData.find({})

      const guilds = []

      for (const chunk of bunch) {
        for (const achievement of chunk.achievements) {
          for (const user of chunk.users) {
            for (let userAchievement of user.achievements) {
              if (userAchievement.name === achievement.name && userAchievement.type === achievement.type && userAchievement.description === achievement.description) continue

              userAchievement = achievement
            }
          }
        }

        const guild = new Guild(this.client, chunk)

        guilds.push(guild)
      }

      this.guilds = new GuildManager(this.client, guilds)
    })
      .catch(console.log)
  }

  async saveData () {
    for (const guild of this.guilds.cache.values()) {
      await GuildsData.findOneAndUpdate({ guildId: guild.guildId }, guild.toJSON()).catch(console.log)
    }
  }

  maxXpFunction (level, xp) {
    return level * this.maxXpToLevelUp
  }

  /**
   *
   * @param {Discord.Snowflake} guildId
   */
  #addGuild (guildId) {
    const guild = new Guild(this.client, {
      guildId,
      achievements: this.achievements,
      ranks: this.ranks,
      users: []
    })

    this.guilds.cache.set(guildId, guild)

    return guild
  }

  /**
   *
   * @param {Discord.GuildMember} member
   * @param {Guild} guild
   */
  async #addUser (member, guild) {
    /** @type {import('../../typings').UserData} */
    const userData = {
      id: member.id,
      username: member.user.username,
      level: 0,
      xp: 0,
      maxXpToLevelUp: this.maxXpToLevelUp,
      messages: [],
      achievements: this.achievements,
      rank: this.ranks[0]
    }
    const user = new UserDoc(this.client, userData)

    guild.users.cache.set(member.id, user)

    // await GuildsData.findOneAndUpdate({ guildId: guild.guildId }, { $push: { users: userData } }).catch(console.log)

    return user
  }

  #filter (member, guildId) {
    if (!member) throw new Error('Member is required.')

    if (!(member instanceof Discord.GuildMember)) throw new TypeError('Member must be a GuildMember.')

    if (typeof guildId !== 'string') throw new TypeError('GuildId must be a string.')

    if (guildId !== 'global' && !/^[0-9]+$/.test(guildId)) throw new TypeError('GuildId must be a valid snowflake.')
  }

  /**
   *
   * @param {Discord.GuildMember} member
   * @param {Number} xp
   * @param {Discord.Snowflake} guildId
   * @returns {Promise<boolean>}
   */
  async addXp (member, xp, guildId = 'global') {
    this.#filter(member, guildId)

    if (!xp) throw new Error('Xp is required.')

    if (typeof xp !== 'number') throw new TypeError('Xp must be a number.')

    if (xp <= 0) throw new TypeError('Xp must be greater than 0.')

    if (xp % 1 !== 0) throw new TypeError('Xp must be an integer.')

    let guild = this.guilds.cache.get(guildId)
    if (!guild) guild = await this.#addGuild(guildId)

    let user = guild.users.cache.get(member.id)
    if (!user) user = await this.#addUser(member, guild)

    user.xp += Math.floor(xp)

    if (user.xp >= user.maxXpToLevelUp) {
      user.level++
      user.xp = Math.floor(user.xp - user.maxXpToLevelUp)

      user.maxXpToLevelUp = this.maxXpFunction(user.level, user.xp)

      return true
    }

    return false
  }

  /**
   *
   * @param {Discord.GuildMember} member
   * @param {Discord.Snowflake} guildId
   * @returns {Promise<UserDoc>}
   */
  async levelUp (member, guildId = 'global') {
    this.#filter(member, guildId)

    let guild = this.guilds.cache.get(guildId)
    if (!guild) guild = await this.#addGuild(guildId)

    let user = guild.users.cache.get(member.id)
    if (!user) user = await this.#addUser(member, guild)

    user.level++
    user.xp = 0

    user.maxXpToLevelUp = this.maxXpFunction(user.level, user.xp)

    return user
  }

  /**
   *
   * @param {Discord.GuildMember} member
   * @param {Discord.Snowflake} guildId
   * @returns {Promise<UserDoc>}
   */
  async removeLevel (member, guildId = 'global') {
    this.#filter(member, guildId)

    let guild = this.guilds.cache.get(guildId)
    if (!guild) guild = await this.#addGuild(guildId)

    let user = guild.users.cache.get(member.id)
    if (!user) user = await this.#addUser(member, guild)

    if (user.level <= 0) return user

    user.level--

    user.maxXpToLevelUp = this.maxXpFunction(user.level, user.xp)

    return user
  }

  /**
   *
   * @param {Discord.GuildMember} member
   * @param {Discord.Snowflake} guildId
   * @returns {Promise<UserDoc>}
   */
  async rankUp (member, guildId = 'global') {
    this.#filter(member, guildId)

    let guild = this.guilds.cache.get(guildId)
    if (!guild) guild = await this.#addGuild(guildId)

    let user = guild.users.cache.get(member.id)
    if (!user) user = await this.#addUser(member, guild)

    const rank = guild.ranks.cache.find(r => r.priority === user.rank.priority + 1)
    if (!rank) return user

    user.rank = rank

    return user
  }

  /**
   *
   * @param {Discord.GuildMember} member
   * @param {Discord.Snowflake} guildId
   * @returns {Promise<UserDoc>}
   */
  async degradeRank (member, guildId = 'global') {
    this.#filter(member, guildId)

    let guild = this.guilds.cache.get(guildId)
    if (!guild) guild = await this.#addGuild(guildId)

    let user = guild.users.cache.get(member.id)
    if (!user) user = await this.#addUser(member, guild)

    const rank = guild.ranks.cache.find(r => r.priority === user.rank.priority - 1)
    if (!rank) return user

    user.rank = rank

    return user
  }

  /**
   *
   * @param {Number} limit
   * @param {Discord.Snowflake} guildId
   * @returns {UserDoc[]}
   */
  leaderboard (limit = 10, guildId = 'global') {
    if (typeof guildId !== 'string') throw new TypeError('GuildId must be a string.')

    if (guildId !== 'global' && !/^[0-9]+$/.test(guildId)) throw new TypeError('GuildId must be a valid snowflake.')

    const guild = this.guilds.cache.get(guildId)
    if (!guild) return []

    const array = guild.users.cache.map(u => u).sort((a, b) => b.level - a.level)

    const users = array.slice(0, array.length < limit ? array.length : limit)

    return _.cloneDeep(users)
  }
}

module.exports = { LevelManager }
