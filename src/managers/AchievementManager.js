const Discord = require('discord.js')
const { BaseManager } = require('./BaseManager')

/** @typedef {import('../../typings').Achievement} Achievement */

/**
 * Manager for the achievements.
 * @extends {BaseManager<Achievement>}
 */
class AchievementManager extends BaseManager {
  /**
     *
     * @param {Discord.Client} client
     * @param {Achievement[]} iterable
     */
  constructor (client, iterable) {
    super(client, AchievementManager)

    if (!iterable) throw new TypeError('Missing argument: iterable')

    if (!Array.isArray(iterable)) throw new TypeError('Iterable must be an array.')
    for (const item of iterable) {
      this._add(item)
    }
  }

  /**
   *
   * @param {Achievement} achievement
   * @returns {Achievement}
   */
  _add (achievement) {
    if (typeof achievement !== 'object') throw new TypeError('Achievement must be an object.')

    const existing = this.cache.get(achievement.name)

    if (existing) throw new Error('Achievement already exists.')

    this.cache.set(achievement.name, achievement)

    return achievement
  }
}

module.exports = { AchievementManager }
