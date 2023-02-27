import Discord, { Snowflake } from 'discord.js'
import { RankBuilder } from '../src'

export interface LevelManagerOptions {
	client: Discord.Client,
	mongoURI: string,
	ranks?: Rank[] | RankBuilder[]
	achievements?: Achievement[] | AchievementBuilder[]
	maxXpToLevelUp?: number
	saveInterval?: number
	autoSave?: boolean
	eventsPath?: string
}

export interface Rank {
	nameplate: string
	color: Discord.ColorResolvable | string
	priority: number
	min: number
	max: number
}

export type RankData = Rank

export interface UserData {
	id: Discord.Snowflake
	username: string
	xp: number
	level: number
	maxXpToLevelUp: number
	messages: Snowflake[]
	rank: Rank
	achievements: Achievement[]
}

export type GuildData = DataBaseData

export interface Achievement {
	name: string
	description: string
	thumbnail?: string
	reward: number
	type: AchievementType
	progress: [number, number]
}

export interface DataBaseData {
	guildId: Discord.Snowflake
	ranks: Rank[]
	achievements: Achievement[]
	users: UserData[]
}

export type AchievementData = Achievement

export declare enum LevelManagerEvents{
	ManagerReady = 'managerReady',
	XpAdded = 'xpAdded',
	LevelUp = 'levelUp',
	DegradeLevel = 'degradeLevel',
	Bypass = 'bypass',
	RankUp = 'rankUp',
	DegradeRank = 'degradeRank'
}

export declare enum AchievementType {
	Progressive = 0,
	OneTime = 1
}