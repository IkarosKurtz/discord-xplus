const { AchievementType } = require('../interfaces')
const { capitalize } = require('../utils/Capitalize')

/**
 * Represents an achievement that can be used to store in the guild or user.
 */
class AchievementBuilder {
  /** @type {import('../../typings').AchievementData} */
  data

  /**
   * @param {import('../../typings').AchievementData} data - Data to build the achievement
   */
  constructor (data = {}) {
    if (typeof data !== 'object') throw new TypeError('Data must be a object.')

    this.data = {}

    const achievementProperties = Object.freeze({
      name: 'string',
      description: 'string',
      thumbnail: 'string',
      reward: 'number',
      type: 'enum',
      progress: 'object'
    })

    for (const key in achievementProperties) {
      const property = data[key] ?? undefined
      const expectedType = achievementProperties[key]

      if (property && key === 'progress' && !Array.isArray(property)) throw new TypeError('Progress must be an array.[actual progress, max progress]')

      // eslint-disable-next-line valid-typeof
      if (property && key !== 'type' && typeof property !== expectedType) throw new TypeError(`${capitalize(key)} must be a ${expectedType}.`)

      if (property && key === 'type' && !Object.values(AchievementType).includes(property)) throw new TypeError('Type must be a valid achievement type.')

      this.data[key] = property
    }
  }

  /**
   * Sets the name of the achievement.
   * @param {String} name - Name of the achievement
   * @returns {AchievementBuilder}
   */
  setName (name) {
    if (typeof name !== 'string') throw new TypeError('Name must be a string.')

    this.data.name = name

    return this
  }

  /**
   * Sets the description of the achievement.
   * @param {String} description - Description of the achievement
   * @returns {AchievementBuilder}
   */
  setDescription (description) {
    if (typeof description !== 'string') throw new TypeError('Description must be a string.')

    this.data.description = description

    return this
  }

  /**
   * Sets the thumbnail of the achievement.
   * @param {String} thumbnail - Thumbnail of the achievement
   * @returns {AchievementBuilder}
   */
  setThumbnail (thumbnail) {
    if (typeof thumbnail !== 'string') throw new TypeError('Thumbnail must be a string.')

    this.data.thumbnail = thumbnail

    return this
  }

  /**
   * Sets the reward of the achievement.
   * @param {Number} reward - Reward of the achievement
   * @returns {AchievementBuilder}
   */
  setReward (reward) {
    if (typeof reward !== 'number') throw new TypeError('Reward must be a number.')

    this.data.reward = reward

    return this
  }

  /**
   * Sets the type of the achievement.
   * @param {AchievementType} type - Type of the achievement
   * @returns {AchievementBuilder}
   */
  setType (type) {
    if (!Object.values(AchievementType).includes(type)) throw new TypeError('Type must be a valid achievement type.')

    this.data.type = type

    return this
  }

  /**
   * Sets the progress of the achievement.
   * @param {Number} current - Current progress of the achievement
   * @param {Number} max - Max progress of the achievement
   * @returns {AchievementBuilder}
   */
  setProgress (current, max) {
    if (typeof current !== 'number') throw new TypeError('Current progress must be a number.')
    if (typeof max !== 'number') throw new TypeError('Max progress must be a number.')

    this.data.progress = [current, max]

    return this
  }

  /**
   * Returns the JSON representation of the achievement.
   * @returns {import('../../typings').Achievement}
   */
  toJSON () {
    return this.data
  }
}

module.exports = { AchievementBuilder }
