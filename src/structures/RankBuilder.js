const { capitalize } = require('../utils/Capitalize')

/**
 * Represents a rank that can be used to store in the guild.
 */
class RankBuilder {
  /** @type {import('../../typings').RankData} */
  data

  /**
     * @param {import('../../typings').RankData} data - Data to build the rank
     */
  constructor (data = {}) {
    if (typeof data !== 'object') throw new TypeError('Data must be a object.')

    this.data = {}

    const rankProperties = Object.freeze({
      nameplate: 'string',
      color: 'string',
      priority: 'number',
      min: 'number',
      max: 'number'
    })

    for (const key in rankProperties) {
      const property = data[key] ?? undefined
      const expectedType = rankProperties[key]

      // eslint-disable-next-line valid-typeof
      if (property && typeof property !== expectedType) throw new TypeError(`${capitalize(key)} must be a ${expectedType}.`)

      this.data[key] = property
    }
  }

  /**
   * Sets the nameplate of the rank.
   * @param {String} nameplate - Nameplate of the rank
   * @returns {RankBuilder}
   */
  setNameplate (nameplate) {
    if (typeof nameplate !== 'string') throw new TypeError('Nameplate must be a string.')

    this.data.nameplate = nameplate

    return this
  }

  /**
   * Sets the color of the rank.
   * @param {String} color - Color of the rank
   * @returns {RankBuilder}
   */
  setColor (color) {
    if (typeof color !== 'string') throw new TypeError('Color must be a string.')

    this.data.color = color

    return this
  }

  /**
   * Sets the priority of the rank.
   * @param {Number} priority - Priority of the rank, the higher the priority, the higher the rank
   * @returns {RankBuilder}
   */
  setPriority (priority) {
    if (typeof priority !== 'number') throw new TypeError('Priority must be a number.')

    this.data.priority = priority

    return this
  }

  /**
   * Sets the minimum XP required to get the rank.
   * @param {Number} min - Minimum XP required to get the rank
   * @returns {RankBuilder}
   */
  setMin (min) {
    if (typeof min !== 'number') throw new TypeError('Min must be a number.')

    this.data.min = min

    return this
  }

  /**
   * Sets the maximum XP required to get the rank.
   * @param {Number} max - Maximum XP required to get the rank
   * @returns {RankBuilder}
   */
  setMax (max) {
    if (typeof max !== 'number') throw new TypeError('Max must be a number.')

    this.data.max = max

    return this
  }

  /**
   * @returns {import('../../typings').Rank}
   */
  toJSON () {
    return this.data
  }
}

module.exports = { RankBuilder }
