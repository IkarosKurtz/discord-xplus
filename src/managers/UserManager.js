const Discord = require('discord.js')
const { UserDoc } = require('../structures/UserData')
const { BaseManager } = require('./BaseManager')

/**
 * Manages the users.
 * @extends {BaseManager<UserDoc>}
 */
class UserManager extends BaseManager {
  /**
   * @param {Discord.Client} client
   * @param {import('../../typings').UserData[]} iterable
   */
  constructor (client, iterable) {
    super(client, UserDoc)

    if (!iterable) throw new TypeError('Missing argument: iterable')

    if (!Array.isArray(iterable)) throw new TypeError('Iterable must be an array.')

    for (const item of iterable) {
      this._add(item)
    }
  }

  /**
   *
   * @param {import('../../typings').UserData} data
   * @returns {UserDoc}
   */
  _add (data) {
    if (typeof data !== 'object') throw new TypeError('User must be an object.')
    const existing = this.cache.has(data.id)
    if (existing) return existing

    // eslint-disable-next-line new-cap
    const entry = new this._holds(this.client, data)

    this.cache.set(entry.id, entry)

    return entry
  }
}

module.exports = { UserManager }
