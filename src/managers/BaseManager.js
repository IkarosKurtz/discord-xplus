const Discord = require('discord.js')
const { Collection } = require('discord.js')
const { BaseClass } = require('../structures/BaseClass')

/**
 * Base class for all the managers.
 * @template T
 */
class BaseManager extends BaseClass {
  /** @type {T} */
  _holds
  /** @type {Collection<String, T>} */
  _cache

  /**
   * @param {Discord.client} client
   * @param {T} holds
   */
  constructor (client, holds) {
    super(client)

    if (!holds) throw new TypeError('Missing argument: holds')

    if (typeof holds !== 'function') throw new TypeError('Holds must be a class.')

    this._holds = holds

    this._cache = new Collection()
  }

  /**
   * @returns {T}
   */
  get holds () {
    return this._holds.name
  }

  /**
   * @returns {Collection<String, T>}
   */
  get cache () {
    return this._cache
  }

  _add (data) {
  }
}

module.exports = { BaseManager }
