/** @enum {number} */
const AchievementType = Object.freeze({
  Progressive: 0,
  OneTime: 1
})

/** @enum {string} */
const LevelManagerEvents = Object.freeze({
  ManagerReady: 'managerReady',
  XpAdded: 'xpAdded',
  LevelUp: 'levelUp',
  DegradeLevel: 'degradeLevel',
  Bypass: 'bypass',
  RankUp: 'rankUp',
  DegradeRank: 'degradeRank'
})

module.exports = {
  AchievementType,
  LevelManagerEvents
}
