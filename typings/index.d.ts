import EventEmitter from 'events'
import { Document } from 'mongoose'
import { Client, Collection, ColorResolvable, Snowflake, User } from 'discord.js'

export declare class LevelManager extends EventEmitter {
	private _client: Client
	private _mongoURI: string
	private _maxXpToLevelUp: number
	private _logChannelId: Snowflake | undefined
	private _eventsPath: string | undefined
	private _cache: Collection<Snowflake, Collection<Snowflake, UserData>>
	private _ranks: Collection<Snowflake, Array<Rank>>
	private _defaultRanks: Array<Rank>
	private _autosave: boolean
	private _calculateXpToLevelUp: (level: number, xp: number) => number
	private _msToSave: number
	constructor(discordClient: Client, options: LevelManagerOptions)
	/**
	 *Indicates if the manager saves the data automatically, by default it is every 3 hours, but you can change it.
	 */
	public get autosave(): boolean
	/**
	 *Indicates if the manager saves the data automatically, by default it is every 3 hours, but you can change it.
	 */
	public set autosave(value: boolean): void
	/**
	 * Default ranks of the manager, it can be the default ranks or the ranks that you specified in the options, if you change this, it will be overwrite the default ranks.
	 */
	public get defaultRanks(): Array<Rank>
	/**
	 * Default ranks of the manager, it can be the default ranks or the ranks that you specified in the options, if you change this, it will be overwrite the default ranks.
	 */
	public set defaultRanks(ranks: Array<Rank | RankBuilder>): void
	private _init(): Promise<void>
	private _initEvents(): Promise<void>
	private _loadCache(): Promise<void>
	private _basicFilters(userId: Snowflake, guildId: Snowflake): Promise<void>
	private _createUser(userId: Snowflake, guildId: Snowflake): Promise<UserData>
	/**
	 * Save all the data from the cache to the database and overwrite the data if it already exists, more info {@tutorial Saving-data}.
	 */
	public saveData(): Promise<void>
	/**
	 * Get a user from the cache, if the user doesn't exist it will be created and then will be saved automatically, for more info check {@tutorial Saving-data}.
	 * @param userId - The user id.
	 * @param  guildId - The guild id.
	 * @return - User's data.
	 */
	public getUser(userId: Snowflake, guildId: Snowflake): Promise<UserData>
	/**
	 * Adds xp to a user, then will be saved, for more info check {@tutorial Saving-data}.
	 * @param xp - The xp to add, only positive and integer numbers.
	 * @param userId - The user id.
	 * @param guildId - The guild id.
	 */
	public addXp(xp: number, userId: Snowflake, guildId: Snowflake = 'global'): Promise<void>
	/**
	 * Level up a user manually, reset the xp to 0 and check if the user reach the max level of the rank.
	 * If the user has reached the maximum rank, they will be able to continue leveling up.
	 * @param userId - The user id.
	 * @param author - The author of the command/action.
	 * @param guildId - The guild id.
	 * @return - If the user has leveled up or if an error occurred.
	 */
	public levelUp(userId: Snowflake, author: User, guildId: Snowflake = 'global'): Promise<boolean>
	/**
	 * Degrade the level of a user, reset the xp to 0 and check if the user reach the min level of the rank.
	 * @param userId - The user id.
	 * @param author - The author of the command/action.
	 * @param guildId - The guild id.
	 * @return - If the user has been degraded or if an error occurred.
	 */
	public degradeLevel(userId: Snowflake, author: User, guildId: Snowflake = 'global'): Promise<boolean>
	/**
	 * Promote a user manually, for more info about ranks check {@tutorial ranks}.
	 * @param userId - The user id.
	 * @param guildId - The guild id.
	 * @return - If the user has been promoted or if an error occurred.
	 */
	public rankUp(userId: Snowflake, author: User, guildId: Snowflake = 'global'): Promise<boolean>
	/**
	 * Degrade a user manually, for more info about ranks check {@tutorial ranks}.
	 * You can't degrade a user if he is already in the lowest rank.
	 * @param userId - The user id.
	 * @param author - The author of the command/action.
	 * @param guildId - The guild id.
	 * @return - If the user has been degraded or if an error occurred.
	 */
	public degradeRank(userId: Snowflake, author: User, guildId: Snowflake = 'global'): Promise<boolean>
	/**
	 * Get guild leaderboard or global leaderboard, get as many users as you want
	 * @param limit - The number of users that you want to get.
	 * @param guildId - Id of the guild that you want to get the leaderboard.
	 * @return - The users data.
	 */
	public leaderboard(limit: number = 10, guildId: Snowflake = 'global'): Promise<Array<UserData>>
	/**
	 * Get the ranks of a guild or default ranks, for more info about ranks check {@tutorial ranks}.
	 * @param guildId - The guild id.
	 * @returns - Ranks in guild.
	 */
	public ranksOf(guildId: Snowflake = 'global'): Array<Rank>
	/**
	 * Append ranks to the manager and re-sort the ranks by their value and it can be RankBuilder or Rank object, for more info about ranks check {@tutorial ranks}.
	 * @param ranks - Array of ranks to append.
	 * @param guildId - The guild id.
	 * @return - The new sorted ranks.
	 */
	public appendRank(ranks: Array<Rank | RankBuilder>, guildId: Snowflake = 'global'): Array<Rank>
	/**
	 * Remove ranks from the manager and re-sort the ranks by their value, for more info about ranks check {@tutorial ranks}.
	 * @param values - Property value of the ranks to remove.
	 * @param guildId - The guild id.
	 * @return - The new sorted ranks.
	 */
	public removeRank(values: Array<number>, guildId: Snowflake = 'global'): Array<Rank>
}

export declare class RankBuilder {
	private _data: Rank
	constructor()
	/**
	 * Represents the rank as a sting
	 * @return - string representation of the rank
	 */
	public toString(): string
	/**
	 * Represents the rank as a JSON
	 * @return - Return a plain object with all the data of the rank
	 */
	public toJSON(): Rank
	private _missingData(): boolean
	/**
	 * Set the nameplate of the rank
	 * @param nameplate - The nameplate of the rank
	 */
	public setNameplate(nameplate: string): this
	/**
	 * Set the color of the rank
	 * @param color - The color of the rank
	 */
	public setColor(color: string): this
	/**
	 * Set the minimum xp to be in this rank
	 * @param min - The minimum xp to be in this rank
	 */
	public setMin(min: number): this
	/**
	 * Set the maximum xp to be in this rank
	 * @param max - The maximum xp to be in this rank
	 */
	public setMax(max: number): this
	/**
	 * Set the value of the rank (used to compare ranks, the higher the value, the higher the rank)
	 * @param value - The value of the rank
	 */
	public setValue(value: number): this
}

export interface LevelManagerOptions {
	mongoURI: string
	maxXpToLevelUp?: number
	logChannelId?: Snowflake
	eventsPath?: string
	ranks?: Array<Rank | RankBuilder>
	autosave?: boolean
	calculateXpFunction?: (level: number, xp: number) => number
	msToSave?: number
}

export interface UserData {
	userId: Snowflake
	username: string
	xp: number
	level: number
	maxXpToLevelUp: number
	messages: Array<Snowflake>
	rank: Rank
}

export interface Rank {
	nameplate: string
	color: string | ColorResolvable
	value: number
	min: number
	max: number
}

export interface UsersDatabase extends Document {
	guildId: Snowflake
	ranks: Array<Rank>
	data: Array<UserData>
}

export declare enum LevelManagerEvents {
	ManagerReady = 'managerReady',
	XpAdded = 'xpAdded',
	LevelUp = 'levelUp',
	DegradeLevel = 'degradeLevel',
	Bypass = 'bypass',
	RankUp = 'rankUp',
	DegradeRank = 'degradeRank'
}
