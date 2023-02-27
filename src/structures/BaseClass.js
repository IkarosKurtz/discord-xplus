const Discord = require('discord.js')

/**
 * Base class for all the structures.
 */
class BaseClass {
  /** @type {Discord.Client} */
  client

  /**
   * @param {Discord.Client} client - Discord client
   */
  constructor (client) {
    if (!client) throw new Error('Missing argument: client')

    if (!(client instanceof Discord.Client)) throw new TypeError('Client must be a Discord Client instance.')

    this.client = client
  }
}

module.exports = { BaseClass }
