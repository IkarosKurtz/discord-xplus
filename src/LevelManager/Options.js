
class Options {
  /**
     * @returns {import('../../typings').Rank[]}
     */
  static setDefaultRanks () {
    return [
      {
        nameplate: 'Beta',
        color: '#FCFFE7',
        min: 0,
        max: 14,
        priority: 0
      },
      {
        nameplate: 'Novice',
        color: '#FFC6D3',
        min: 15,
        max: 29,
        priority: 1
      },
      {
        nameplate: 'Initiate',
        color: '#BAD7E9',
        min: 30,
        max: 44,
        priority: 2
      },
      {
        nameplate: 'Wanderer',
        color: '#3A4F7A',
        min: 45,
        max: 59,
        priority: 3
      },
      {
        nameplate: 'Standard',
        color: 'Orange',
        min: 60,
        max: 74,
        priority: 4
      },
      {
        nameplate: 'Guild Keeper',
        color: '#2B3467',
        min: 75,
        max: 89,
        priority: 5
      },
      {
        nameplate: 'Omega',
        color: '#862433',
        min: 90,
        max: 104,
        priority: 6
      },
      {
        nameplate: 'Alpha Omega',
        color: '#EB455F',
        min: 105,
        max: 120,
        priority: 7
      }
    ]
  }

  /**
   *
   * @returns {import('../../typings').Achievement[]}
   */
  static setDefaultAchievements () {
    return [
      {
        name: 'First level',
        description: 'You reached the first level',
        reward: 100,
        type: 1
      }
    ]
  }
}

module.exports = { Options }
