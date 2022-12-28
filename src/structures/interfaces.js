const Discord = require('discord.js')
const { RankBuilder } = require('./Ranks/Rank')

/**
 * Callback function to calculate the XP to level up.
 * @callback xpFunction
 * @param {number} level - The current level of the user.
 * @param {number} xp - The current XP of the user (if user has level up, this will be the XP after the level up).
 * @returns {number} The necessary XP to level up.
 */

/**
 * Options that will be passed to the manager.
 * @typedef {Object} LevelManagerOptions
 * @property {string} mongoURI - The URI to connect to the MongoDB database.
 * @property {number} [maxXpToLevelUp=1500] - The maximum XP to level up.
 * @property {Discord.Snowflake} [logChannelId] - The ID of the channel to log the events.
 * @property {string} [eventsPath] - The path to the events folder (example: ./events/LevelEvents).
 * @property {Array<Rank | RankBuilder>} [ranks=Ranks] - The ranks of the server.
 * @property {boolean} [autosave=true] - If the manager should autosave the data.
 * @property {xpFunction} [calculateXpFunction=(level, xp) => level * 2500] - The function to calculate the XP.
 * @property {number} [msToSave=1000 * 60 * 60 * 4] - The time in milliseconds to save the data.
 * @example
 * // Default ranks
 * const Ranks = [
 * 	{
 * 		nameplate: 'Beta',
 * 		color: '#FCFFE7',
 * 		min: 0,
 * 		max: 14,
 * 		value: 0
 * 	},
 * 	{
 * 		nameplate: 'Novice',
 * 		color: '#FFC6D3',
 * 		min: 15,
 * 		max: 29,
 * 		value: 1
 * 	},
 * 	{
 * 		nameplate: 'Initiate',
 * 		color: '#BAD7E9',
 * 		min: 30,
 * 		max: 44,
 * 		value: 2
 * 	},
 * 	{
 * 		nameplate: 'Wanderer',
 * 		color: '#3A4F7A',
 * 		min: 45,
 * 		max: 59,
 * 		value: 3
 * 	},
 * 	{
 * 		nameplate: 'Standard',
 * 		color: 'Orange',
 * 		min: 60,
 * 		max: 74,
 * 		value: 4
 * 	},
 * 	{
 * 		nameplate: 'Guild Keeper',
 * 		color: '#2B3467',
 * 		min: 75,
 * 		max: 89,
 * 		value: 5
 * 	},
 * 	{
 * 		nameplate: 'Omega',
 * 		color: '#862433',
 * 		min: 90,
 * 		max: 104,
 * 		value: 6
 * 	},
 * 	{
 * 		nameplate: 'Alpha Omega',
 * 		color: '#EB455F',
 * 		min: 105,
 * 		max: 120,
 * 		value: 7
 * 	}
 * ]
 *
 */

/** @typedef {import("./Achievements/Achievement").AchievementBuilder} AchievementBuilder */

/**
 * The data that will be saved in the database.
 * @typedef {Object} UserData
 * @template [T=any]
 * @property {Discord.Snowflake} userId - The ID of the user.
 * @property {string} username - The username of the user.
 * @property {number} xp - The XP of the user.
 * @property {number} level - The level of the user.
 * @property {number} maxXpToLevelUp - The maximum XP to level up.
 * @property {Array<Discord.Snowflake>} messages - The messages of the user.
 * @property {T} [extraData] - Extra data that will be saved in the database.
 * @property {Array<AchievementBuilder>} [achievements] - Achievements of the user.
 * @property {Rank} rank - The rank of the user.
 */

/**
 * Rank that will be stored in the manager and users' data, for more info see {@tutorial ranks}
 * @typedef {Object} Rank
 * @property {string} nameplate - The name of the rank.
 * @property {string | Discord.ColorResolvable} color - The color of the rank.
 * @property {number} value - The value of the rank.
 * @property {number} min - The minimum XP of the rank.
 * @property {number} max - The maximum XP of the rank.
 */

/**
 * The data that will be saved in the database, every guild is a new record, for more info see {@tutorial Saving-data}
 * @typedef {Object} UsersDatabase
 * @property {Discord.Snowflake} guildId - The ID of the guild.
 * @property {Array<Rank>} ranks - The ranks of the guild.
 * @property {Array<UserData>} data - The data of the users.
 */

/**
 * @readonly
 */
const LevelManagerEvents = Object.freeze({
	ManagerReady: 'managerReady',
	XpAdded: 'xpAdded',
	LevelUp: 'levelUp',
	DegradeLevel: 'degradeLevel',
	Bypass: 'bypass',
	RankUp: 'rankUp',
	DegradeRank: 'degradeRank'
})

/**
 * @type {RegExp} - Regex to check if the string is a number
 * @readonly
 */
const Regex = /^[0-9]+$/

/**
 * @type {Array<Rank>} - Default ranks implemented in the manager
 * @readonly
 */
const Ranks = [
	{
		nameplate: 'Beta',
		color: '#FCFFE7',
		min: 0,
		max: 14,
		value: 0
	},
	{
		nameplate: 'Novice',
		color: '#FFC6D3',
		min: 15,
		max: 29,
		value: 1
	},
	{
		nameplate: 'Initiate',
		color: '#BAD7E9',
		min: 30,
		max: 44,
		value: 2
	},
	{
		nameplate: 'Wanderer',
		color: '#3A4F7A',
		min: 45,
		max: 59,
		value: 3
	},
	{
		nameplate: 'Standard',
		color: 'Orange',
		min: 60,
		max: 74,
		value: 4
	},
	{
		nameplate: 'Guild Keeper',
		color: '#2B3467',
		min: 75,
		max: 89,
		value: 5
	},
	{
		nameplate: 'Omega',
		color: '#862433',
		min: 90,
		max: 104,
		value: 6
	},
	{
		nameplate: 'Alpha Omega',
		color: '#EB455F',
		min: 105,
		max: 120,
		value: 7
	}
]

module.exports = { Ranks, Regex, LevelManagerEvents }
