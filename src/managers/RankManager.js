const Discord = require('discord.js')
const { BaseManager } = require('./BaseManager')

/** @typedef {import('../../typings').Rank} Rank */

/**
 * @extends {BaseManager<Rank>}
 */
class RankManager extends BaseManager {
  /**
     *
     * @param {Discord.Client} client
     * @param {Rank[]} iterable
     */
  constructor (client, iterable) {
    super(client, RankManager)

    if (!iterable) throw new TypeError('Missing argument: iterable')

    if (!Array.isArray(iterable)) throw new TypeError('Iterable must be an array.')
    for (const item of iterable) {
      this._add(item)
    }
  }

  /**
   *
   * @param {Rank} rank
   * @returns {Rank}
   */
  _add (rank) {
    if (typeof rank !== 'object') throw new TypeError('Rank must be an object.')

    const existing = this.cache.get(rank.priority.toString())

    if (existing) throw new Error('Rank already exists.')

    this.cache.set(rank.priority.toString(), rank)

    return rank
  }
}

module.exports = { RankManager }
