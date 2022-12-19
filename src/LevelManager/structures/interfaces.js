const Discord = require('discord.js')
const { RankBuilder } = require('..')

/**
 * @typedef {Object} LevelManagerOptions
 * @property {Discord.Client} client - The Discord client
 * @property {string} mongoURI - The URI to connect to the MongoDB database
 * @property {number} [maxXpToLevelUp=2500] - The maximum XP to level up (default: 2500)
 * @property {string} [logChannelId] - The ID of the channel to log the events
 * @property {string} [eventsPath] - The path to the events folder (example: ./events/LevelEvents)
 * @property {Array<Rank | RankBuilder>} [ranks=Ranks] - The ranks of the server (default: Ranks)
 * @property {boolean} [autosave=true] - If the manager should autosave the data (default: true)
 * @example
 *
 * const Ranks = [
 *	{
 *		nameplate: 'Noobie',
 *		color: 'Red',
 *		min: 0,
 *		max: 9,
 *		value: 0
 *	},
 *	{
 *		nameplate: 'Rookie',
 *		color: 'Orange',
 *		min: 10,
 *		max: 19,
 *		value: 1
 *	}
 *]
 */

/**
 * The data that will be saved in the database
 * @typedef {Object} UserData
 * @property {Discord.Snowflake} userId - The ID of the user
 * @property {string} username - The username of the user
 * @property {number} xp - The XP of the user
 * @property {number} level - The level of the user
 * @property {number} maxXpToLevelUp - The maximum XP to level up
 * @property {Array<Discord.Snowflake>} messages - The messages of the user
 * @property {Rank} rank - The rank of the user
 */

/**
 * A rank that the user can have
 * @typedef {Object} Rank
 * @property {string} nameplate - The name of the rank
 * @property {string} color - The color of the rank
 * @property {number} value - The value of the rank
 * @property {number} min - The minimum XP of the rank
 * @property {number} max - The maximum XP of the rank
 */

/**
 * @typedef {Object} UsersDatabase
 * @property {Discord.Snowflake} guildId - The ID of the guild
 * @property {Array<UserData>} data - The data of the users
 */

exports.LevelManagerEvents = Object.freeze({
	XpAdded: 'xpAdded',
	LevelUp: 'levelUp',
	Bypass: 'bypass',
	DegradeLevel: 'degradeLevel',
	RankUp: 'rankUp',
	DegradeRank: 'degradeRank'
})

/** @type {RegExp} - Validates if the string is a number */
exports.Regex = /^[0-9]+$/

/** @type {Array<Rank>} - Default ranks for the manager */
exports.Ranks = [
	{
		nameplate: 'Noobie',
		color: 'Red',
		min: 0,
		max: 9,
		value: 0
	},
	{
		nameplate: 'Rookie',
		color: 'Orange',
		min: 10,
		max: 19,
		value: 1
	}
]
