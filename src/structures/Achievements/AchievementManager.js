const Discord = require('discord.js')

/**
 * @typedef {import('../../../typings').AchievementBuilder<T>} AchievementBuilder
 * @template [T=any]
 */

/**
 * @typedef {import('../../../typings').AchievementOptions<T>} AchievementOptions
 * @template [T=any]
 */

/**
 * @typedef {import('../../../typings').Achievement<K>} Achievement
 * @template [K=any]
 */

/**
 * @template [K=any]
 */
class AchievementManager {
	constructor(levelManager, extraData) {
		/**
		 * @type {Discord.Collection<Discord.Snowflake, Array<Achievement<K>>>} - The cache of the achievements for each guild.
		 */
		this._cache = new Discord.Collection()

		/**
		 * @type {import('../LevelManager').LevelManager<any, K>} - The level manager.
		 * @private
		 */
		this._levelManager = levelManager

		/**
		 * @type {K} - Extra data that will be saved in the database.
		 */
		this._extraData = extraData
	}

	/**
	 * The cache of the achievements for each guild.
	 * @type {Discord.Collection<Discord.Snowflake, Array<Achievement<K>>>}
	 * @return {Discord.Collection<Discord.Snowflake, Array<Achievement<K>>>}
	 * @readonly
	 */
	get cache() {
		return this._cache
	}

	/**
	 * Add new achievements to a specific guild.
	 * @param {Array<Achievement<K> | AchievementBuilder<K>>} achievements - Array of achievements.
	 * @param {Discord.Snowflake} [guildId='global'] - The id of the guild.
	 * @return {Array<Achievement<K>>}
	 */
	appendAchievement(achievements, guildId = 'global') {
		const guildAchievements = this._cache.get(guildId) ?? []

		return []
	}
}

module.exports = { AchievementManager }
