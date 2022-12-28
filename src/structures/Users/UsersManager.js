const Discord = require('discord.js')
const { Regex } = require('../interfaces')

/**
 * @typedef {import('../../../typings').UserData<T, K>} UserData
 * @template [T=any]
 * @template [K=any]
 */

/**
 * @template [T=any]
 * @template [K=any]
 */
class UserManager {
	/**
	 * Create a new user manager, this manager will be used to get users from the cache, when you want a user is recommended se the getUser method instead of getting it from the cache directly because you will search a guild and then a user, also the getUser method will create a new record guild and user if they don't exist.
	 * @param {import('../LevelManager').LevelManager} levelManager - Level manager.
	 * @param {T} extraData - Extra data.
	 * @example
	 * 	// returns a user
	 * 	client.levelManager.users.getUser(userId, guildId)
	 *
	 * 	// also return a user, but first returns a Collection with all users in the selected guild
	 * 	client.levelManager.users.cache.get(guildId)?.get(userId)
	 */
	constructor(levelManager, extraData) {
		/**
		 * @type {Discord.Collection<string, Discord.Collection<string, UserData<T, K>>>} - The users in each guild.
		 * @private
		 */
		this._cache = new Discord.Collection()

		/**
		 * @type {import('../LevelManager').LevelManager} - The client.
		 * @private
		 */
		this._levelManager = levelManager

		/**
		 * @type {T} - Extra data.
		 * @private
		 */
		this._extraData = extraData ?? null
	}

	/**
	 * The cache with all guilds and users.
	 * @type {Discord.Collection<string, Discord.Collection<string, UserData<T, K>>>}
	 * @readonly
	 */
	get cache() {
		return this._cache
	}

	/**
	 * Basic filters to check if the user and guild ids are valid.
	 * @param {Discord.Snowflake} userId - The user id.
	 * @param {Discord.Snowflake} guildId - The guild id.
	 * @return {Promise<void>}
	 * @private
	 */
	async _basicFilters(userId, guildId) {
		if (typeof userId !== 'string' || !Regex.test(userId)) throw new Error('You must provide a valid user id')

		if (typeof guildId !== 'string' || (guildId !== 'global' && !Regex.test(guildId))) throw new TypeError('Invalid guild id.')
	}

	/**
	 * Create a new user's record in the cache.
	 * @param {Discord.Snowflake} userId - The user id.
	 * @param {Discord.Snowflake} guildId - The guild id (optional, if not provided then it will be global).
	 * @return {Promise<UserData<T, K>>} - The user data.
	 * @private
	 */
	async _createUser(userId, guildId) {
		const userGuild = await this._levelManager.client.users.fetch(userId)

		const achievements = this._levelManager.achievements.cache.get(guildId) ?? undefined

		/** @type {UserData<T, K>} */
		const user = {
			userId,
			username: userGuild.username,
			xp: 0,
			level: 0,
			// @ts-ignore
			maxXpToLevelUp: this._levelManager._maxXpToLevelUp,
			messages: [],
			achievement: achievements,
			// @ts-ignore
			rank: this._levelManager._defaultRanks[0]
		}

		if (this._extraData) user.extraData = this._extraData

		// Check if the guild exists in the cache
		if (!this._cache.has(guildId)) {
			const guild = new Discord.Collection()

			guild.set(userId, user)

			this._cache.set(guildId, guild)
			this._levelManager.ranks.set(guildId, this._levelManager.defaultRanks)
		}

		this._cache.get(guildId)?.set(userId, user)
		this._levelManager.achievements.cache.set(guildId, achievements)

		return user
	}

	/**
	 * Get a user from the cache, if the user doesn't exist it will be created and then will be saved automatically, for more info check {@tutorial Saving-data}.
	 * @param {Discord.Snowflake} userId - The user id.
	 * @param {Discord.Snowflake} [guildId="global"] - The guild id.
	 * @return {Promise<UserData<T, K>>} - User's data.
	 * @public
	 */
	async getUser(userId, guildId = 'global') {
		await this._basicFilters(userId, guildId)

		let user = await this._cache.get(guildId)?.get(userId)

		if (!user) user = await this._createUser(userId, guildId)

		return user
	}

	/**
	 * Get guild leaderboard or global leaderboard, get as many users as you want
	 * @param {number} [limit=10] - The number of users that you want to get.
	 * @param {Discord.Snowflake} [guildId="global"] - Id of the guild that you want to get the leaderboard.
	 * @return {Promise<Array<UserData<T, K>>>} - The users data.
	 * @public
	 */
	async leaderboard(limit = 10, guildId = 'global') {
		if (typeof guildId !== 'string' || typeof limit !== 'number' || (guildId !== 'global' && !Regex.test(guildId)))
			throw new TypeError('Invalid type of arguments, guildId must be a string and limit must be a number.')

		if (!Number.isInteger(limit) || limit < 1) throw new RangeError('Limit must be a positive integer')

		if (!this._cache.has(guildId)) {
			console.error('Guild not found')
			return undefined
		}

		const guildUsers = this._cache.get(guildId).map((user) => user)

		// Copy the array because sort() is mutating the array
		const sortedUsers = [...guildUsers].sort((a, b) => b.level - a.level)

		return sortedUsers.slice(0, sortedUsers.length < limit ? sortedUsers.length : limit)
	}
}

module.exports = { UserManager }
