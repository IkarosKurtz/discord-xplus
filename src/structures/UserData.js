const Discord = require('discord.js')
const { BaseClass } = require('./BaseClass')

/**
 * Represents a user in the database/cache.
 * @extends BaseClass
 */
class UserDoc extends BaseClass {
  /** @type {Discord.Client} */
  client
  /** @type {Discord.Snowflake} */
  id
  /** @type {String} */
  username
  /** @type {Number} */
  xp
  /** @type {Number} */
  level
  /** @type {Number} */
  maxXpToLevelUp
  /** @type {import('../../typings').Rank} */
  rank
  /** @type {import('../../typings').Achievement[]} */
  achievements

  /**
   * @param {Discord.Client} client - Discord client
   * @param {import('../../typings').UserData} data - Data extracted from the database/cache
   */
  constructor (client, data) {
    super(client)

    this.#checkData(data)

    this.client = client

    this.id = data.id

    this.username = data.username

    this.xp = data.xp

    this.level = data.level

    this.maxXpToLevelUp = data.maxXpToLevelUp

    this.rank = data.rank

    this.achievements = data.achievements
  }

  /**
   * Evaluates if the user has all the required data.
   * @param {import('../../typings').UserData} data - Data extracted from the database/cache
   * @throws {Error | TypeError} - If the data is missing or invalid
   * @private
   */
  #checkData (data) {
    if (!data) throw new Error('Missing argument: data')

    if (typeof data !== 'object') throw new TypeError('Data must be an object')

    if (!data.id) throw new Error('Missing argument: id')

    if (typeof data.id !== 'string') throw new TypeError('Id must be a string')

    if (!data.username) throw new Error('Missing argument: username')

    if (typeof data.username !== 'string') throw new TypeError('Username must be a string')

    if (!data.xp && data.xp !== 0) throw new Error('Missing argument: xp')

    if (typeof data.xp !== 'number') throw new TypeError('Xp must be a number')

    if (!data.level && data.level !== 0) throw new Error('Missing argument: level')

    if (typeof data.level !== 'number') throw new TypeError('Level must be a number')

    if (!data.maxXpToLevelUp) throw new Error('Missing argument: maxXpToLevelUp')

    if (typeof data.maxXpToLevelUp !== 'number') throw new TypeError('MaxXpToLevelUp must be a number')

    if (!data.rank) throw new Error('Missing argument: rank')

    if (typeof data.rank !== 'object') throw new TypeError('Rank must be a object')

    if (!data.achievements) throw new Error('Missing argument: achievements')

    if (!Array.isArray(data.achievements)) throw new TypeError('Achievements must be a array')
  }

  /**
   *
   * @returns {import('../../typings').UserData}
   */
  toJSON () {
    return {
      id: this.id,
      username: this.username,
      xp: this.xp,
      level: this.level,
      maxXpToLevelUp: this.maxXpToLevelUp,
      rank: this.rank,
      achievements: this.achievements
    }
  }
}

module.exports = { UserDoc }
