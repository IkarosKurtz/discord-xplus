import { Client, Collection, Snowflake } from 'discord.js'

export declare class LevelManager extends Client {
	public client: Client
	private mongoURI: string
	private maxXpToLevelUp: number
	private logChannelId: Snowflake
	private eventsPath: string
	public cache: Collection<Snowflake, Collection<Snowflake, UserData>>
	private cacheRanks: Array<Rank>
	private autosave: boolean
	constructor(options: LevelManagerOptions, discordClient: Client)
	private _init(): Promise<void>
	public get ranks(): Array<Rank>
	public set ranks(value: Array<Rank | RankBuilder>): void
	public get automaticSave(): boolean
	public set automaticSave(value: boolean): void
	private _initEvents(): Promise<void>
	private _loadCache(): Promise<void>
	private _basicFilters(userId: Snowflake, guildId: Snowflake): Promise<void>
	private _createUser(userId: Snowflake, guildId: Snowflake): Promise<UserData>
	public saveData(): Promise<void>
	public getUser(userId: Snowflake, guildId: Snowflake): Promise<UserData>
	public addXp(xp: number, userId: Snowflake, guildId: Snowflake = 'global'): Promise<void>
}

export declare class RankBuilder {
	private nameplate: string
	private color: string
	private value: number
	private min: number
	private max: number
	public toString(): string
	public toRank(): Rank
	public setNameplate(nameplate: string): this
	public setColor(color: string): this
	public setMin(min: number): this
	public setMax(max: number): this
	public setValue(value: number): this
}

export interface LevelManagerOptions {
	mongoURI: string
	maxXpToLevelUp?: number
	logChannelId?: Snowflake
	eventsPath?: string
	ranks?: Array<Rank | RankBuilder>
	autosave?: boolean
}

export interface Rank {
	nameplate: string
	color: string
	value: number
	min: number
	max: number
}

export interface UserData {
	userId: string
	username: string
	xp: number
	level: number
	maxXpToLevelUp: number
	messages: Array<Snowflake>
	rank: Rank
}

export type UsersDatabase = {
	guildId: string
	data: Array<UserData>
}

export declare enum LevelManagerEvents {
	XpAdded = 'xpAdded',
	LevelUp = 'levelUp',
	Bypass = 'bypass',
	DegradeLevel = 'degradeLevel',
	RankUp = 'rankUp',
	DegradeRank = 'degradeRank'
}
