/**
 * @typedef {Object} AchievementOptions
 * @template [T=any]
 * @property {string} name - The name of the achievement.
 * @property {string} description - The description of the achievement.
 * @property {string} [image] - The image of the achievement.
 * @property {AchievementType} [type] - The type of the achievement.
 * @property {T} [extraData] - Extra data that will be saved in the database.
 */

/**
 * @typedef {Object} Achievement
 * @template [K=any]
 * @property {string} name - The name of the achievement.
 * @property {string} description - The description of the achievement.
 * @property {string} [thumbnail='Question mark'] - The image of the achievement.
 * @property {AchievementType} [type=AchievementType.OneAction] - The type of the achievement.
 * @property {K} [extraData] - Extra data that will be saved in the database.
 */

/**
 * @readonly
 */
const AchievementType = Object.freeze({
	Progressive: 0,
	OneAction: 1
})

module.exports = { AchievementType }
