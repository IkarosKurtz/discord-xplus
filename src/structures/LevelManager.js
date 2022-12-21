const Users = require('../model')
const Discord = require('discord.js')
const EventEmitter = require('events')
const { connect } = require('mongoose')
const { readdirSync } = require('fs')
const { RankBuilder } = require('./Rank')
const { Ranks, Regex, LevelManagerEvents } = require('./interfaces')

/** @typedef {import('../../typings').UsersDatabase} UsersDatabase */
/** @typedef {import('../../typings').Rank} Rank */
/** @typedef {import('../../typings').UserData} UserData */
/** @typedef {import('../../typings').LevelManagerOptions} LevelManagerOptions */
/** @typedef {import('./interfaces').xpFunction} xpFunction */

/**
 * Creates a LevelManager, this is the main class, when you create a new instance of this class, it will automatically connect to the database and load the users
 * (if you already used the manager), also will load the events if you specified the path to the events folder in the options, but if you don't have a folder
 * or you doesn't know how it works, you can visit {@tutorial Level-events} to learn how to create and use events.
 * @extends {EventEmitter}
 */
class LevelManager extends EventEmitter {
	/**
	 * Creates an instance of LevelManager.
	 * @param {Discord.Client} client - The Discord client or a custom client of Discord.js.
	 * @param {LevelManagerOptions} options - The options for the manager.
	 */
	constructor(client, options) {
		super()

		// #region Validation

		if (client && typeof client !== 'object')
			throw new TypeError('The client must be a Discord.js client or must be extended from it.')

		if (options && typeof options !== 'object') throw new TypeError('The options must be an object.')

		if (options.mongoURI && typeof options.mongoURI !== 'string') throw new TypeError('The mongoURI must be a string.')

		if (options.maxXpToLevelUp && typeof options.maxXpToLevelUp !== 'number')
			throw new TypeError('The maxXpToLevelUp must be a number.')

		if (options.logChannelId && typeof options.logChannelId !== 'string')
			throw new TypeError('The logChannelId must be a string.')

		if (options.eventsPath && typeof options.eventsPath !== 'string') throw new TypeError('The eventsPath must be a string.')

		// @ts-ignore
		if (options.ranks && !Array.isArray(options.ranks) && options.ranks.length === 0)
			throw new TypeError('The ranks must be an object.')

		if (options.calculateXpFunction && typeof options.calculateXpFunction !== 'function')
			throw new TypeError('The calculateXpFunction must be a function.')

		if (options.autosave && typeof options.autosave !== 'boolean') throw new TypeError('The autosave must be a boolean.')

		if (options.msToSave && typeof options.msToSave !== 'number') throw new TypeError('The msToSave must be a number.')

		// #endregion

		// #region  Properties

		/**
		 * @type {Discord.Client} - The Discord client or a custom client of Discord.js.
		 * @private
		 */
		this._client = client

		/**
		 * @type {string} - URL of mongo database.
		 * @private
		 */
		this._mongoURI = options.mongoURI

		/**
		 * @type {number} - Xp needed to level up, will be increased in each level.
		 * @private
		 */
		this._maxXpToLevelUp = options.maxXpToLevelUp ?? 1500

		/**
		 * @type {Discord.Snowflake | undefined} - Text channel id where it will be send log messages.
		 * @private
		 */
		this._logChannelId = options.logChannelId

		/**
		 * @type {string | undefined} - Path to the events folder.
		 * @private
		 */
		this._eventsPath = options.eventsPath

		/**
		 * @type {Discord.Collection<string, Discord.Collection<string, UserData>>} - The users in each guild.
		 * @private
		 */
		this._cache = new Discord.Collection()

		/**
		 * @type {Discord.Collection<Discord.Snowflake, Array<Rank>>} - The ranks of the server.
		 * @private
		 */
		this._ranks = new Discord.Collection()

		const existingValues = []

		/**
		 * @type {Array<Rank>} - The default ranks of the manager.
		 * @private
		 */
		// @ts-ignore
		this._defaultRanks =
			options.ranks?.map((rank) => {
				if (rank instanceof RankBuilder) {
					return rank.toJSON()
					// @ts-ignore
				} else if (typeof rank === 'object' && rank.nameplate && rank.value) {
					return rank
				}

				throw new TypeError('The rank must be an instance of RankBuilder or an Rank object.')
			}) ?? Ranks

		this._defaultRanks.forEach((rank) => {
			if (!existingValues.includes(rank.value)) {
				existingValues.push(rank.value)
			} else {
				throw new Error(`The value ${rank.value} is already in use in another rank, please change it. (Rank: ${rank.nameplate})`)
			}
		})

		/**
		 * @type {boolean} - If the manager will save the data automatically.
		 * @private
		 */
		this._autosave = options.autosave ?? true

		/**
		 * @type {xpFunction} - Function to calculate the xp needed to level up.
		 * @private
		 */
		this._calculateXpToLevelUp = options.calculateXpFunction ?? ((level, xp) => level * 2500)

		/**
		 * @type {number} - The time in milliseconds to save the data.
		 * @private
		 */
		this._msToSave = options.msToSave ?? 1000 * 60 * 60 * 4

		// #endregion

		this._init()
	}

	// #region Getters and Setters

	/**
	 * Indicates if the manager saves the data automatically, by default it is every 3 hours, but you can change it.
	 * @type {boolean}
	 * @return {boolean} - If the manager will save the data automatically.
	 */
	get autosave() {
		return this._autosave
	}

	/**
	 * @param {boolean} value - If the manager will save the data automatically.
	 * @private
	 */
	set autosave(value) {
		if (typeof value !== 'boolean') throw new TypeError('Parameter must be a boolean.')

		this._autosave = value
	}

	/**
	 * Default ranks of the manager, it can be the default ranks or the ranks that you specified in the options, if you change this, it will be overwrite the default ranks.
	 * @type {Array<Rank>}
	 * @return {Array<Rank>} - The default ranks of the manager.
	 */
	get defaultRanks() {
		return this._defaultRanks
	}

	/**
	 * @param {Array<Rank | RankBuilder>} ranks - The new default ranks of the manager.
	 * @private
	 */
	set defaultRanks(ranks) {
		if (!Array.isArray(ranks)) throw new TypeError('Parameter must be an array.')

		if (ranks.length === 0) throw new Error('The array must have at least one rank.')

		const newRanks = []
		for (const rank of ranks) {
			if (rank instanceof RankBuilder) {
				newRanks.push(rank.toJSON())
				continue
			} else if (typeof rank === 'object' && rank.nameplate && rank.value) {
				newRanks.push(rank)
				continue
			}

			throw new TypeError('The ranks must be an instance of RankBuilder or an Rank object.')
		}

		const existingValues = []

		newRanks.sort((a, b) => a.value - b.value)
		newRanks.forEach((rank) => {
			if (!existingValues.includes(rank.value)) {
				existingValues.push(rank.value)
			} else {
				throw new Error(`The value ${rank.value} is already in use in another rank, please change it. (Rank: ${rank.nameplate})`)
			}
		})

		this._defaultRanks = newRanks
	}

	// #endregion

	// #region Private Methods

	/**
	 * Initialize the database and the events.
	 * @emits LevelManager#managerReady
	 * @return {Promise<void>}
	 * @private
	 */
	async _init() {
		try {
			await connect(this._mongoURI).then(async () => {
				console.log('\n☁ Successfully connected to the database')
				if (this._eventsPath) {
					await this._initEvents()
				} else {
					console.log('\n⚠ No events path provided')
				}

				await this._loadCache()

				setInterval(async () => {
					if (this._autosave) await this.saveData()
				}, this._msToSave)

				/**
				 * Emitted when the manager is ready.
				 * @event LevelManager#managerReady
				 * @property {Discord.Client} client - The Discord client.
				 */
				this.emit(LevelManagerEvents.ManagerReady, this._client)
			})
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * Load events from the events folder only if they exist.
	 * @return {Promise<void>}
	 * @private
	 */
	async _initEvents() {
		try {
			// Read the events folder and filter the files that end with .js
			const files = await readdirSync(`${this._eventsPath}`).filter((file) => file.endsWith('.js'))
			const events = []

			// Loop through the files and require them
			for (const file of files) {
				const event = require(`${this._eventsPath}/${file}`)

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

			console.log(`☁ Successfully loaded ${events.length === 1 ? `${events.length} event.` : `${events.length} events.`}\n`)
			console.table(events)

			return
		} catch (error) {
			console.log(error)
			return
		}
	}

	/**
	 * Load the cache from the database and store it in the manager.
	 * @return {Promise<void>}
	 * @private
	 */
	async _loadCache() {
		try {
			// Get all the guilds from the database
			/** @type {Array<UsersDatabase>} */
			const dataBase = await Users.find()

			// Loop through the guilds and store the users in a collection
			for (const guild of dataBase) {
				const usersInGuild = new Discord.Collection()

				for (const users of guild.data) usersInGuild.set(users.userId, users)
				this._ranks.set(guild.guildId, guild.ranks)

				this._cache.set(guild.guildId, usersInGuild)
			}

			console.log('☁ Successfully loaded the cache')

			return
		} catch (error) {
			console.log(error)
		}
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
	 * @return {Promise<UserData>} - The user data.
	 * @private
	 */
	async _createUser(userId, guildId) {
		const userGuild = await this._client.users.fetch(userId)

		/** @type {UserData} */
		const user = {
			userId,
			username: userGuild.username,
			xp: 0,
			level: 0,
			maxXpToLevelUp: this._maxXpToLevelUp,
			messages: [],
			rank: this._defaultRanks[0]
		}

		// Check if the guild exists in the cache
		if (!this._cache.has(guildId)) {
			const guild = new Discord.Collection()

			guild.set(userId, user)

			this._cache.set(guildId, guild)
			this._ranks.set(guildId, this._defaultRanks)
		}

		this._cache.get(guildId)?.set(userId, user)

		return user
	}

	// #endregion

	/**
	 * Save all the data from the cache to the database and overwrite the data if it already exists, more info {@tutorial Saving-data}.
	 * @return {Promise<void>}
	 * @public
	 */
	async saveData() {
		try {
			// save the cache to the database in guilds
			// @ts-ignore
			for (const guild of this._cache) {
				/** @type {UsersDatabase} */
				let guildData = await Users.findOne({ guildId: guild[0] })

				// If the guild doesn't exist in the database then create a new one
				if (!guildData) {
					guildData = new Users({
						guildId: guild[0],
						ranks: this._defaultRanks,
						data: guild[1].map((value) => value)
					})

					await guildData.save()
					continue
				}

				// Save the users' data
				guildData.data = guild[1].map((value) => {
					if (value.messages.length > 3000) value.messages = value.messages.slice(0, 1500)

					return value
				})

				// Update ranks
				guildData.ranks = this._ranks.get(guild[0])

				await guildData.save()
			}
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * Get a user from the cache, if the user doesn't exist it will be created and then will be saved automatically, for more info check {@tutorial Saving-data}.
	 * @param {Discord.Snowflake} userId - The user id.
	 * @param {Discord.Snowflake} [guildId="global"] - The guild id.
	 * @return {Promise<UserData>} - User's data.
	 * @public
	 */
	async getUser(userId, guildId = 'global') {
		await this._basicFilters(userId, guildId)

		let user = await this._cache.get(guildId)?.get(userId)

		if (!user) user = await this._createUser(userId, guildId)

		return user
	}

	/**
	 * Adds xp to a user, then will be saved, for more info check {@tutorial Saving-data}.
	 * @emits LevelManager#levelUp
	 * @emits LevelManager#xpAdded
	 * @emits LevelManager#rankUp
	 * @param {number} xp - The xp to add, only positive and integer numbers.
	 * @param {Discord.Snowflake} userId - The user id.
	 * @param {Discord.Snowflake} [guildId="global"] - The guild id.
	 * @return {Promise<void>}
	 * @public
	 */
	async addXp(xp, userId, guildId = 'global') {
		if (typeof xp !== 'number' || xp < 0 || !Number.isInteger(xp)) throw new Error('You must provide a valid xp')

		const userData = await this.getUser(userId, guildId)
		userData.xp += xp

		// Check if the user is in the correct rank
		userData.rank = this._ranks.get(guildId)?.find((rank) => userData.level >= rank.min && userData.level <= rank.max)

		/**
		 * Emitted when a user receives xp by different methods like send a message, join a VC, react to a message, etc.
		 * You will do that manually.
		 * @event LevelManager#xpAdded
		 * @property {UserData} user - The user who received the xp.
		 * @property {number} xp - The xp that was added.
		 */
		this.emit(LevelManagerEvents.XpAdded, userData, xp)

		if (userData.xp >= userData.maxXpToLevelUp) {
			userData.level++
			userData.maxXpToLevelUp = this._calculateXpToLevelUp(userData.level, userData.xp)
			userData.xp -= userData.maxXpToLevelUp

			// If the user has reached the max level then we promote him to the next rank
			if (userData.level > userData.rank.max) {
				const ranks = this.ranksOf(guildId)
				const index = ranks.indexOf(userData.rank)

				userData.rank = ranks[index + 1]

				const user = await this._client.users.fetch(userId)

				/**
				 * Emitted when a user has been promoted.
				 * @property {Discord.User} user - The user that rank up
				 * @property {UserData} userData - The user data
				 */
				this.emit(LevelManagerEvents.RankUp, user, userData)
			}

			/**
			 * Emitted when a user has leveled up by reaching the max xp required.
			 * @event LevelManager#levelUp
			 * @property {Discord.User} user - The user that leveled up.
			 * @property {UserData} userData - The user data.
			 */
			this.emit(LevelManagerEvents.LevelUp, this._client.users.cache.get(userId), userData)
		}

		userData.xp = Math.floor(userData.xp)
	}

	/**
	 * Level up a user manually, reset the xp to 0 and check if the user reach the max level of the rank.
	 * If the user has reached the maximum rank, they will be able to continue leveling up.
	 * @emits LevelManager#bypass
	 * @emits LevelManager#rankUp
	 * @param {Discord.Snowflake} userId - The user id.
	 * @param {Discord.User} author - The author of the command/action.
	 * @param {Discord.Snowflake} [guildId="global"] - The guild id.
	 * @return {Promise<boolean>} - If the user has leveled up or if an error occurred.
	 */
	async levelUp(userId, author, guildId = 'global') {
		try {
			const userData = await this.getUser(userId, guildId)

			userData.level++
			userData.xp = 0
			userData.maxXpToLevelUp = this._calculateXpToLevelUp(userData.level, userData.xp)

			const user = await this._client.users.fetch(userId)

			if (userData.level > userData.rank.max) {
				const ranks = this.ranksOf(guildId)

				const nextRank = ranks.find((r) => r.value === userData.rank.value + 1)

				if (!nextRank) return false

				userData.rank = nextRank

				/**
				 * Emitted when a user has been promoted.
				 * @property {Discord.User} user - The user that rank up
				 * @property {UserData} userData - The user data
				 */
				this.emit(LevelManagerEvents.RankUp, user, userData)
			}

			/**
			 * Emitted when a user has leveled up by another person like an admin or a moderator (staff)..
			 * @event LevelManager#bypass
			 * @property {Discord.User} author - The author that leveled up the user.
			 * @property {Discord.User} user - The user that leveled up.
			 * @property {UserData} userData - The user data.
			 */
			this.emit(LevelManagerEvents.Bypass, author, user, userData)

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	/**
	 * Degrade the level of a user, reset the xp to 0 and check if the user reach the min level of the rank.
	 * @emits LevelManager#degradeLevel
	 * @emits LevelManager#rankUp
	 * @param {Discord.Snowflake} userId - The user id.
	 * @param {Discord.User} author - The author of the command/action.
	 * @param {Discord.Snowflake} [guildId="global"] - The guild id.
	 * @return {Promise<boolean>} - If the user has been degraded or if an error occurred.
	 */
	async degradeLevel(userId, author, guildId = 'global') {
		try {
			const userData = await this.getUser(userId, guildId)

			if (userData.level === 0) return false

			userData.level--
			userData.xp = 0
			userData.maxXpToLevelUp = this._calculateXpToLevelUp(userData.level === 0 ? 1 : userData.level, userData.xp)

			const user = await this._client.users.fetch(userId)

			if (userData.level < userData.rank.min) {
				const ranks = this.ranksOf(guildId)

				const nextRank = ranks.find((r) => r.value === userData.rank.value - 1)

				userData.rank = nextRank

				/**
				 * Emitted when a user has been promoted.
				 * @property {Discord.User} user - The user that rank up
				 * @property {UserData} userData - The user data
				 */
				this.emit(LevelManagerEvents.RankUp, user, userData)
			}

			/**
			 * Emitted when a user has degraded by another person like an admin or a moderator (staff).
			 * @event LevelManager#degradeLevel
			 * @property {Discord.User} author - The author that degraded the user
			 * @property {Discord.User} user - The user that degraded
			 * @property {UserData} userData - The user data
			 */
			this.emit(LevelManagerEvents.DegradeLevel, author, user, userData)

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	/**
	 * Promote a user manually, for more info about ranks check {@tutorial ranks}.
	 * @emits LevelManager#rankUp
	 * @param {Discord.Snowflake} userId - The user id.
	 * @param {Discord.Snowflake} [guildId="global"] - The guild id.
	 * @return {Promise<boolean>} - If the user has been promoted or if an error occurred.
	 */
	async rankUp(userId, guildId = 'global') {
		try {
			const userData = await this.getUser(userId, guildId)
			const ranks = this.ranksOf(guildId)

			if (userData.rank.value === ranks.length - 1) return false

			const nextRank = ranks.find((r) => r.value === userData.rank.value + 1)
			userData.xp = 0

			userData.rank = nextRank
			userData.level = nextRank.min

			userData.maxXpToLevelUp = this._calculateXpToLevelUp(userData.level, userData.xp)

			const user = await this._client.users.fetch(userId)

			/**
			 * Emitted when a user has been promoted.
			 * @event LevelManager#rankUp
			 * @property {Discord.User} user - The user that rank up
			 * @property {UserData} userData - The user data
			 */
			this.emit(LevelManagerEvents.RankUp, user, userData)

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	/**
	 * Degrade a user manually, for more info about ranks check {@tutorial ranks}.
	 * You can't degrade a user if he is already in the lowest rank.
	 * @emits LevelManager#degradeRank
	 * @param {Discord.Snowflake} userId - The user id.
	 * @param {Discord.User} author - The author of the command/action.
	 * @param {Discord.Snowflake} [guildId="global"] - The guild id.
	 * @return {Promise<boolean>} - If the user has been degraded or if an error occurred.
	 */
	async degradeRank(userId, author, guildId = 'global') {
		try {
			if (!author || typeof author !== 'object' || !author.id) throw new Error('The author must be a Discord User.')

			const userData = await this.getUser(userId, guildId)
			const ranks = this.ranksOf(guildId)

			if (userData.rank.value === 0) return false

			const nextRank = ranks.find((r) => r.value === userData.rank.value - 1)

			userData.xp = 0
			userData.rank = nextRank
			userData.level = nextRank.min
			userData.maxXpToLevelUp = this._calculateXpToLevelUp(userData.level === 0 ? 1 : userData.level, userData.xp)

			const user = await this._client.users.fetch(userId)

			/**
			 * Emitted when a user has been degraded by another person like an admin or a moderator (staff).
			 * @event LevelManager#degradeRank
			 * @property {Discord.User} author - The author that degrade the rank of the user.
			 * @property {Discord.User} user - The user that degrade the rank.
			 * @property {UserData} userData - The user data.
			 */
			this.emit(LevelManagerEvents.DegradeRank, author, user, userData)

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	/**
	 * Get guild leaderboard or global leaderboard, get as many users as you want
	 * @param {number} [limit=10] - The number of users that you want to get.
	 * @param {Discord.Snowflake} [guildId="global"] - Id of the guild that you want to get the leaderboard.
	 * @return {Promise<Array<UserData>>} - The users data.
	 */
	async leaderboard(limit = 10, guildId = 'global') {
		if (typeof guildId !== 'string' || typeof limit !== 'number' || (guildId !== 'global' && !Regex.test(guildId)))
			throw new TypeError('Invalid type of arguments, guildId must be a string and limit must be a number.')

		if (!Number.isInteger(limit) || limit < 1) throw new RangeError('Limit must be a positive integer')

		if (!this._cache.has(guildId)) {
			console.error('Guild not found')
			return undefined
		}

		if (!Regex.test(guildId)) {
			console.error('Invalid guild id')
			return undefined
		}
		const guildUsers = this._cache.get(guildId).map((user) => user)

		// Copy the array because sort() is mutating the array
		const sortedUsers = [...guildUsers].sort((a, b) => b.level - a.level)

		return sortedUsers.slice(0, sortedUsers.length < limit ? sortedUsers.length : limit)
	}

	/**
	 * Get the ranks of a guild or default ranks, for more info about ranks check {@tutorial ranks}.
	 * @param {Discord.Snowflake} [guildId="global"] - The guild id.
	 * @returns {Array<Rank>} - Ranks in guild.
	 */
	ranksOf(guildId = 'global') {
		if (typeof guildId !== 'string' || (guildId !== 'global' && !Regex.test(guildId))) throw new TypeError('Invalid guild id.')

		if (!this._ranks.has(guildId)) {
			this._ranks.set(guildId, this._defaultRanks)
		}

		return this._ranks.get(guildId)
	}

	/**
	 * Append ranks to the manager and re-sort the ranks by their value and it can be RankBuilder or Rank object, for more info about ranks check {@tutorial ranks}.
	 * @param  {Array<Rank | RankBuilder>} ranks - Array of ranks to append.
	 * @param {Discord.Snowflake} [guildId="global"] - The guild id.
	 * @return {Array<Rank>} - The new sorted ranks.
	 */
	appendRank(ranks, guildId = 'global') {
		if (typeof guildId !== 'string' || (guildId !== 'global' && !Regex.test(guildId))) throw new TypeError('Invalid guild id.')

		if (!Array.isArray(ranks)) throw new TypeError('Ranks must be an array.')

		const guildRanks = this.ranksOf(guildId)
		for (const rank of ranks) {
			if (rank instanceof RankBuilder) {
				// @ts-ignore
				if (rank._missingData()) {
					throw new Error('RankBuilder must have all the required data.')
				}

				guildRanks.push(rank.toJSON())

				continue
			} else if (!(rank instanceof RankBuilder) && typeof rank === 'object' && rank.nameplate) {
				guildRanks.push(rank)
				continue
			}

			throw new TypeError('Invalid rank.')
		}

		const existingValues = []
		guildRanks.forEach((rank, index) => {
			if (!existingValues.includes(rank.value)) {
				existingValues.push(rank.value)
			} else {
				throw new Error(`The value ${rank.value} is already in use in another rank, please change it. (Rank: ${rank.nameplate})`)
			}
		})

		return guildRanks.sort((a, b) => a.value - b.value)
	}

	/**
	 * Remove ranks from the manager and re-sort the ranks by their value, for more info about ranks check {@tutorial ranks}.
	 * @param  {Array<number>} values - Property value of the ranks to remove.
	 * @param {Discord.Snowflake} [guildId="global"] - The guild id.
	 * @return {Array<Rank>} - The new sorted ranks.
	 */
	removeRank(values, guildId = 'global') {
		if (typeof guildId !== 'string' || (guildId !== 'global' && !Regex.test(guildId))) throw new TypeError('Invalid guild id.')

		if (!Array.isArray(values)) throw new TypeError('Values must be an array.')

		if (values.some((value) => typeof value !== 'number' && !Number.isInteger(value)))
			throw new TypeError('Values must be an array of integers.')

		const guildRanks = this.ranksOf(guildId)
		const temp = [...guildRanks]
		for (const rank of temp) {
			if (!values.includes(rank.value)) continue

			const index = guildRanks.indexOf(rank)

			guildRanks.splice(index, 1)
		}

		return guildRanks.sort((a, b) => a.value - b.value)
	}
}

module.exports = { LevelManager }
