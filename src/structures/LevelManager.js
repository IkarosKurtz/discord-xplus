const EventEmitter = require('events')
const Discord = require('discord.js')
const Users = require('../model')
const { connect } = require('mongoose')
const { readdirSync } = require('fs')
const { Ranks, Regex, LevelManagerEvents } = require('./interfaces')
const { RankBuilder } = require('./Rank')

/** @typedef {import('../../typings').UsersDatabase} UsersDatabase */
/** @typedef {import('../../typings').Rank} Rank */
/** @typedef {import('../../typings').UserData} UserData */
/** @typedef {import('../../typings').LevelManagerOptions} LevelManagerOptions */

/**
 * Create a manager for levels and manipulate users' data
 * @extends {EventEmitter}
 */
class LevelManager extends EventEmitter {
	/**
	 * Creates an instance of LevelManager.
	 * @param {LevelManagerOptions} options - The options for the manager
	 * @param {Discord.Client} discordClient - The Discord client
	 */
	constructor(options, discordClient) {
		super()
		/**
		 * @type {Discord.Client} - The Discord client
		 * @public
		 */
		this.client = discordClient

		/**
		 * @type {string}
		 * @description - URL of mongo database
		 * @private
		 */
		this.mongoURI = options.mongoURI

		/**
		 * @type {number}  - Xp needed to level up, will be increased in each level
		 * @private
		 */
		this.maxXpToLevelUp = options.maxXpToLevelUp ?? 2500

		/**
		 * @type {Discord.Snowflake | undefined} - Text channel id where it will be send log messages
		 * @private
		 */
		this.logChannelId = options.logChannelId

		/**
		 * @type {string | undefined} - Path to the events folder
		 * @private
		 */
		this.eventsPath = options.eventsPath

		/**
		 * @type {Discord.Collection<string, Discord.Collection<string, UserData>>} - The users in each guild
		 * @private
		 */
		this.cache = new Discord.Collection()

		/**
		 * @type {Array<Rank>} - The ranks of the server
		 * @public
		 */
		// @ts-ignore
		this.cacheRanks = options.ranks?.map((rank) => (rank instanceof RankBuilder ? rank.toRank() : rank)) ?? Ranks

		/**
		 * @type {boolean} - If the manager will save the data automatically
		 * @public
		 */
		this.autosave = options.autosave ?? true

		this._init()
	}

	/**
	 * @return {Array<Rank>}
	 * @private
	 */
	get ranks() {
		return this.cacheRanks
	}

	/**
	 * @param {Array<Rank | RankBuilder>} ranks - The ranks of the server
	 * @private
	 */
	set ranks(ranks) {
		/** @type {Array<Rank>} */
		const ranksArray = []
		for (const rank of ranks) {
			if (rank instanceof RankBuilder) {
				ranksArray.push(rank.toRank())
				continue
			}

			ranksArray.push(rank)
		}

		this.cacheRanks = ranksArray
	}

	/**
	 * @return {boolean} - If the manager will save the data automatically
	 * @private
	 */
	get automaticSave() {
		return this.autosave
	}

	/**
	 * @param {boolean} value - If the manager will save the data automatically
	 * @private
	 */
	set automaticSave(value) {
		this.autosave = value
	}

	/**
	 * Initialize the database and the events
	 * @returns {Promise<void>}
	 * @private
	 */
	async _init() {
		try {
			await connect(this.mongoURI).then(async () => {
				console.log('\n☁ Successfully connected to the database')
				if (this.eventsPath) {
					await this._initEvents()
				}

				console.log('\n⚠ No events path provided')

				await this._loadCache()

				if (this.autosave) {
					setInterval(async () => await this.saveData(), 5_000)
				}
			})
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * Load events from the events folder only if they exist
	 * @returns {Promise<void>}
	 * @private
	 */
	async _initEvents() {
		try {
			// Read the events folder and filter the files that end with .js
			const files = await readdirSync(`${this.eventsPath}`).filter((file) => file.endsWith('.js'))
			const events = []

			// Loop through the files and require them
			for (const file of files) {
				const event = require(`${this.eventsPath}/${file}`)

				// Check if the event has a type and a run method
				if (!event.type || !event.run) {
					console.log(`\nFile ${file} is not a valid event, check the documentation for more info.`)
					continue
				}

				// Push the event type to the events array and add the event to the client
				events.push(event.type)

				this.on(event.type, event.run.bind(null, this))
			}

			if (events.length < 1) return console.log('\n⚠ No events found')

			console.log(`☁ Successfully loaded ${events.length} events.\n`)
			console.table(events)

			return
		} catch (error) {
			console.log(error)
			return
		}
	}

	/**
	 * Load the cache from the database and store it in the manager
	 * @returns {Promise<void>}
	 * @private
	 */
	async _loadCache() {
		try {
			// Get all the guilds from the database
			/** @type {UsersDatabase[]} */
			const dataBase = await Users.find()

			// Loop through the guilds and store the users in a collection
			for (const guild of dataBase) {
				const usersInGuild = new Discord.Collection()

				for (const users of guild.data) usersInGuild.set(users.userId, users)

				this.cache.set(guild.guildId, usersInGuild)
			}

			console.log('☁ Successfully loaded the cache')

			return
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * Basic filters to check if the user and guild ids are valid
	 * @param {Discord.Snowflake} userId - The user id
	 * @param {Discord.Snowflake} guildId - The guild id
	 * @return {Promise<void>}
	 * @private
	 */
	async _basicFilters(userId, guildId) {
		if (!userId || typeof userId !== 'string' || !Regex.test(userId)) throw new Error('You must provide a valid user id')

		if (!guildId || typeof guildId !== 'string' || (guildId !== 'global' && !Regex.test(guildId)))
			throw new Error('You must provide a valid guild id')
	}

	/**
	 * Save the cache into the database
	 * @returns {Promise<void>}
	 */
	async saveData() {
		// save the cache to the database in guilds
		// @ts-ignore
		for (const guild of this.cache) {
			let guildData = await Users.findOne({ guildId: guild[0] })

			if (!guildData) {
				guildData = new Users({
					guildId: guild[0],
					data: guild[1].map((value) => value)
				})

				await guildData.save().catch((error) => console.log(error))

				return
			}

			guildData.data = guild[1].map((value) => value)

			await guildData.save().catch((error) => console.log(error))
		}
	}

	/**
	 * Create a user in the cache and store it in their guild
	 * @param {Discord.Snowflake} userId - The user id
	 * @param {Discord.Snowflake} guildId - The guild id (optional, if not provided then it will be global)
	 * @return {Promise<UserData>} - The user data
	 * @private
	 */
	async _createUser(userId, guildId) {
		await this._basicFilters(userId, guildId)

		const userGuild = await this.client.users.fetch(userId)

		/** @type {UserData} */
		const user = {
			userId,
			username: userGuild.username,
			xp: 0,
			level: 0,
			maxXpToLevelUp: this.maxXpToLevelUp,
			messages: [],
			rank: this.cacheRanks[0]
		}

		// Check if the guild exists in the cache
		if (!this.cache.has(guildId)) {
			const guild = new Discord.Collection()

			guild.set(userId, user)

			this.cache.set(guildId, guild)
		}

		this.cache.get(guildId)?.set(userId, user)

		return user
	}

	/**
	 * Get a user from the cache, if the user doesn't exist it will be created
	 * @param {Discord.Snowflake} userId - The user id
	 * @param {Discord.Snowflake} guildId - The guild id
	 * @return {Promise<UserData>}
	 * @public
	 */
	async getUser(userId, guildId) {
		await this._basicFilters(userId, guildId)

		let user = await this.cache.get(guildId)?.get(userId)

		if (!user) user = await this._createUser(userId, guildId)

		return user
	}

	/**
	 * Add xp to a user, also check if the user has leveled up
	 * @emits LevelManager#levelUp
	 * @emits LevelManager#xpAdded
	 * @param {number} xp - The xp to add, only positive and integer numbers
	 * @param {Discord.Snowflake} userId - The user id
	 * @param {Discord.Snowflake} guildId - The guild id
	 * @return {Promise<void>}
	 * @public
	 */
	async addXp(xp, userId, guildId = 'global') {
		await this._basicFilters(userId, guildId)

		if (!xp || typeof xp !== 'number' || xp < 0 || !Number.isInteger(xp)) throw new Error('You must provide a valid xp')

		const user = await this.getUser(userId, guildId)
		user.xp += xp

		/**
		 * Xp added event, emitted when xp is added to a user
		 * @event LevelManager#xpAdded
		 * @property {UserData} user - The user that received the xp
		 * @property {number} xp - The xp that was added
		 */
		this.emit(LevelManagerEvents.XpAdded, user, xp)

		if (user.xp >= user.maxXpToLevelUp) {
			user.level++
			user.maxXpToLevelUp = user.level * this.maxXpToLevelUp
			user.xp -= user.maxXpToLevelUp

			if (user.level > user.rank.max) {
				const index = this.cacheRanks.indexOf(user.rank)

				user.rank = this.cacheRanks[index + 1]
			}

			/**
			 * Level up event, emitted when a user levels up
			 *
			 * @event LevelManager#levelUp
			 * @property {Discord.User} user - The user that leveled up
			 * @property {UserData} userData - The user data
			 */
			this.emit(LevelManagerEvents.LevelUp, this.client.users.cache.get(userId), user)
		}

		user.xp = Math.floor(user.xp)

		this.cache.get(guildId)?.set(userId, user)
	}

	/**
	 * Level up a user manually, reset the xp to 0 and check if the user reach the max level of the rank
	 * @emits LevelManager#bypass
	 * @param {Discord.Snowflake} userId - The user id
	 * @param {Discord.User} author - The author of the command/action
	 * @param {Discord.Snowflake} guildId - The guild id
	 * @return {Promise<boolean>}
	 */
	async levelUp(userId, author, guildId = 'global') {
		await this._basicFilters(userId, guildId)

		try {
			const userData = await this.getUser(userId, guildId)

			userData.level++
			userData.maxXpToLevelUp = userData.level * this.maxXpToLevelUp
			userData.xp = 0

			if (userData.level > userData.rank.max) {
				const index = this.cacheRanks.indexOf(userData.rank)

				userData.rank = this.cacheRanks[index + 1]

				const user = await this.client.users.fetch(userId)

				/**
				 * Level up event, emitted when a user levels up
				 *
				 * @event LevelManager#bypass
				 * @property {Discord.User} author - The user that leveled up the user
				 * @property {Discord.User} user - The user that leveled up
				 * @property {UserData} userData - The user data
				 */
				this.emit(LevelManagerEvents.Bypass, author, user, userData)
			}

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	/**
	 * Degrade the level of a user, reset the xp to 0 and check if the user reach the min level of the rank
	 * @emits LevelManager#degradeLevel
	 * @param {Discord.Snowflake} userId - The user id
	 * @param {Discord.User} author - The author of the command/action
	 * @param {Discord.Snowflake} guildId - The guild id
	 * @return {Promise<boolean>}
	 */
	async degradeLevel(userId, author, guildId = 'global') {
		await this._basicFilters(userId, guildId)

		try {
			const userData = await this.getUser(userId, guildId)

			userData.level--
			userData.maxXpToLevelUp = userData.level * this.maxXpToLevelUp
			userData.xp = 0

			if (userData.level < userData.rank.min) {
				const index = this.cacheRanks.indexOf(userData.rank)

				userData.rank = this.cacheRanks[index - 1]

				const user = await this.client.users.fetch(userId)

				/**
				 * Degrade event, emitted when a user degrade another user
				 * @event LevelManager#degradeLevel
				 * @property {Discord.User} author - The author that degraded the user
				 * @property {Discord.User} user - The user that degraded
				 * @property {UserData} userData - The user data
				 */
				this.emit(LevelManagerEvents.DegradeLevel, author, user, userData)
			}

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	/**
	 * Rank up a user manually
	 * @emits LevelManager#rankUp
	 * @param {Discord.Snowflake} userId - The user id
	 * @param {Discord.User} author - The author of the command/action
	 * @param {Discord.Snowflake} guildId - The guild id
	 * @return {Promise<boolean>}
	 */
	async rankUp(userId, author, guildId = 'global') {
		await this._basicFilters(userId, guildId)

		try {
			const userData = await this.getUser(userId, guildId)
			const index = this.cacheRanks.indexOf(userData.rank)

			userData.rank = this.cacheRanks[index + 1]
			const user = await this.client.users.fetch(userId)

			/**
			 * Rank up event, emitted when a user rank up another user
			 * @event LevelManager#rankUp
			 * @property {Discord.User} author - The author that rank up the user
			 * @property {Discord.User} user - The user that rank up
			 * @property {UserData} userData - The user data
			 */
			this.emit(LevelManagerEvents.RankUp, author, user, userData)

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	/**
	 * Degrade a user manually
	 * @emits LevelManager#degradeRank
	 * @param {Discord.Snowflake} userId - The user id
	 * @param {Discord.User} author - The author of the command/action
	 * @param {Discord.Snowflake} guildId - The guild id
	 * @return {Promise<boolean>}
	 */
	async degradeRank(userId, author, guildId = 'global') {
		await this._basicFilters(userId, guildId)

		try {
			const userData = await this.getUser(userId, guildId)
			const index = this.cacheRanks.indexOf(userData.rank)

			userData.rank = this.cacheRanks[index - 1]
			const user = await this.client.users.fetch(userId)

			/**
			 * Degrade rank event, emitted when a user degrade the rank of another user
			 * @event LevelManager#degradeRank
			 * @property {Discord.User} author - The author that degrade the rank of the user
			 * @property {Discord.User} user - The user that degrade the rank
			 * @property {UserData} userData - The user data
			 */
			this.emit(LevelManagerEvents.DegradeRank, author, user, userData)

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}
}

module.exports = { LevelManager }
