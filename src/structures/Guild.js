const Discord = require('discord.js')
const { AchievementManager } = require('../managers/AchievementManager')
const { RankManager } = require('../managers/RankManager')
const { UserManager } = require('../managers/UserManager')
const { GuildsData } = require('../model')
const { AchievementBuilder } = require('./AchievementBuilder')
const { RankBuilder } = require('./RankBuilder')

class Guild {
  /** @type {Discord.Snowflake} */
  guildId
  /** @type {RankManager} */
  ranks
  /** @type {AchievementManager} */
  achievements
  /** @type {UserManager} */
  users
  /**
     *
     * @param {Discord.Client} client
     * @param {import('../../typings').GuildData} data
     */
  constructor (client, data) {
    if (!client) throw new Error('Missing argument: client')

    if (!(client instanceof Discord.Client)) throw new TypeError('Client must be a Discord Client instance.')

    if (!data) throw new Error('Missing argument: data')

    if (typeof data !== 'object') throw new TypeError('Data must be an object.')

    this.client = client

    this.#checkData(data)

    this.guildId = data.guildId

    this.ranks = new RankManager(client, data.ranks)

    this.achievements = new AchievementManager(client, data.achievements)

    this.users = new UserManager(client, data.users)
  }

  /**
   *
   * @param {import('../../typings').DataBaseData} data
   */
  #checkData (data) {
    if (!data.guildId) throw new Error('Missing property: guildId')

    if (typeof data.guildId !== 'string') throw new TypeError('Property guildId must be a string.')

    if (!data.ranks) throw new Error('Missing property: ranks')

    if (!Array.isArray(data.ranks)) throw new TypeError('Property ranks must be an array.')

    if (data.ranks.some(rank => typeof rank !== 'object')) throw new TypeError('Property ranks must be an array of objects.')

    if (!data.achievements) throw new Error('Missing property: achievements')

    if (!Array.isArray(data.achievements)) throw new TypeError('Property achievements must be an array.')

    if (data.achievements.some(achievement => typeof achievement !== 'object')) throw new TypeError('Property achievements must be an array of objects.')

    if (!data.users) throw new Error('Missing property: users')

    if (!Array.isArray(data.users)) throw new TypeError('Property users must be an array.')

    if (data.users.some(user => typeof user !== 'object')) throw new TypeError('Property users must be an array of objects.')
  }

  /**
   *
   * @param {RankBuilder} rank
   */
  async appendRank (rank) {
    if (!rank) throw new Error('Missing argument: rank')

    if (!(rank instanceof RankBuilder)) throw new TypeError('Rank must be a RankBuilder instance.')

    const rankData = rank.toJSON()

    const existing = this.ranks.cache.get(rankData.priority.toString())
    if (existing) throw new Error('Rank is already in the guild (choose other priority).')

    this.ranks.cache.set(rankData.priority.toString(), rankData)

    // await GuildsData.findOneAndUpdate({ guildId: this.guildId }, { $push: { ranks: rankData } }).catch(console.log)

    return rankData
  }

  /**
   *
   * @param {AchievementBuilder} achievement
   */
  async appendAchievement (achievement) {
    if (!achievement) throw new Error('Missing argument: achievement')

    if (!(achievement instanceof AchievementBuilder)) throw new TypeError('Achievement must be a AchievementBuilder instance.')

    const achievementData = achievement.toJSON()

    const existing = this.achievements.cache.get(achievementData.name)
    if (existing) throw new Error('Achievement is already in the guild (choose other name).')

    this.achievements.cache.set(achievementData.name, achievementData)

    // await GuildsData.findOneAndUpdate({ guildId: this.guildId }, { $push: { achievements: achievementData } }).catch(console.log)

    for (const user of this.users.cache.values()) {
      user.achievements.push(achievementData)
    }

    return achievementData
  }

  /**
   *
   * @param {Number} priority
   */
  async deleteRank (priority) {
    if (!priority) throw new Error('Missing argument: priority')

    if (typeof priority !== 'number') throw new TypeError('Priority must be a number.')

    const rank = this.ranks.cache.get(priority.toString())
    if (!rank) throw new Error('Rank not found.')

    this.ranks.cache.delete(priority.toString())

    // await GuildsData.findOneAndUpdate({ guildId: this.guildId }, { $pull: { ranks: { priority } } }).catch(console.log)

    return rank
  }

  /**
   *
   * @param {String} name
   */
  async deleteAchievement (name) {
    if (!name) throw new Error('Missing argument: name')

    if (typeof name !== 'string') throw new TypeError('Name must be a string.')

    const achievement = this.achievements.cache.get(name)
    if (!achievement) throw new Error('Achievement not found.')

    this.achievements.cache.delete(name)

    // await GuildsData.findOneAndUpdate({ guildId: this.guildId }, { $pull: { achievements: { name } } }).catch(console.log)

    for (const user of this.users.cache.values()) {
      user.achievements = user.achievements.filter(achievement => achievement.name !== name)
    }

    return achievement
  }

  /**
   *
   * @returns {import('../../typings').GuildData}
   */
  toJSON () {
    return {
      guildId: this.guildId,
      ranks: this.ranks.cache.map(rank => rank),
      achievements: this.achievements.cache.map(achievement => achievement),
      users: this.users.cache.map(user => user.toJSON())
    }
  }
}

module.exports = { Guild }
