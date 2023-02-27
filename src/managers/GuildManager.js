const Discord = require('discord.js')
const { Guild } = require('../structures/Guild')
const { BaseManager } = require('./BaseManager')

/**
 * Manages the guilds.
 * @extends {BaseManager<Guild>}
 */
class GuildManager extends BaseManager {
  /**
     *
     * @param {Discord.Client} client
     * @param {Guild[]} iterable
     */
  constructor (client, iterable) {
    super(client, Guild)

    if (!iterable) throw new TypeError('Missing argument: iterable')

    if (!Array.isArray(iterable)) throw new TypeError('Iterable must be an array.')

    for (const item of iterable) {
      this._add(item)
    }
  }

  /**
     *
     * @param {Guild} guild
     * @returns {Guild}
     */
  _add (guild) {
    if (!(guild instanceof Guild)) throw new TypeError('Guild must be an instance of Guild.')

    const existing = this.cache.has(guild.guildId)
    if (existing) return existing

    this.cache.set(guild.guildId, guild)

    return guild
  }
}

module.exports = { GuildManager }
