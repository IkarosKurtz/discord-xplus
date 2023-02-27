import Discord from 'discord.js'
import { AchievementBuilder, AchievementManager, Guild, RankBuilder, RankManager, UserManager } from '../src'
import { describe, it, expect } from 'vitest'

describe('Guild', () => {
  const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] })

  /* Arguments: client */
  it('Throw an error if client is not provided or is other type', () => {
    expect(() => new Guild()).toThrow('Missing argument: client')
    expect(() => new Guild('client')).toThrow('Client must be a Discord Client instance.')
  })

  /* Arguments: data */
  it('Throw an error if data is not provided or is other type', () => {
    expect(() => new Guild(client)).toThrow('Missing argument: data')
    expect(() => new Guild(client, 'data')).toThrow('Data must be an object.')

    expect(() => new Guild(client, null)).toThrow('Missing argument: data')
  })

  /* Data: guildId */
  it('Throw an error if guildId is not provided or is other type', () => {
    expect(() => new Guild(client, {})).toThrow('Missing property: guildId')
    expect(() => new Guild(client, { guildId: 2 })).toThrow('Property guildId must be a string.')
  })

  /* Data: ranks */
  it('Throw an error if ranks is not provided or is other type', () => {
    expect(() => new Guild(client, { guildId: '1' })).toThrow('Missing property: ranks')
    expect(() => new Guild(client, { guildId: '1', ranks: 2 })).toThrow('Property ranks must be an array.')

    expect(() => new Guild(client, { guildId: '1', ranks: [6] })).toThrow('Property ranks must be an array of objects.')
  })

  /* Data: achievements */
  it('Throw an error if achievements is not provided or is other type', () => {
    expect(() => new Guild(client, { guildId: '1', ranks: [] })).toThrow('Missing property: achievements')
    expect(() => new Guild(client, { guildId: '1', ranks: [], achievements: 2 })).toThrow('Property achievements must be an array.')

    expect(() => new Guild(client, { guildId: '1', ranks: [], achievements: [6] })).toThrow('Property achievements must be an array of objects.')
  })

  /* Data: users */
  it('Throw an error if users is not provided or is other type', () => {
    expect(() => new Guild(client, { guildId: '1', ranks: [], achievements: [] })).toThrow('Missing property: users')
    expect(() => new Guild(client, { guildId: '1', ranks: [], achievements: [], users: 2 })).toThrow('Property users must be an array.')

    expect(() => new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [6] })).toThrow('Property users must be an array of objects.')
  })

  /* Properties: guildId */
  it('Property guildId return the guildId', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })

    expect(guild.guildId).toBe('1')
  })

  /* Properties: ranks */
  it('Property ranks return the ranks', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [{ nameplate: 'test', color: 'Red', max: 2, min: 3, priority: 1 }], achievements: [], users: [] })

    expect(guild.ranks).instanceOf(RankManager)
  })

  /* Properties: achievements */
  it('Property achievements return the achievements', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [{ name: 'test', description: 'test', reward: 100, type: 1 }], users: [] })

    expect(guild.achievements).instanceOf(AchievementManager)
  })

  /* Properties: users */
  it('Property users return the users', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [{ id: '1', username: 'ikaros', xp: 100, achievements: [], level: 1, maxXpToLevelUp: 2, messages: [], rank: [] }] })

    expect(guild.users).toBeInstanceOf(UserManager)
  })

  /* appendRank */
  it('Throw an error if rank is not provided or is not an instance of Rank', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })

    expect(async () => await guild.appendRank()).rejects.toThrow('Missing argument: rank')
    expect(async () => await guild.appendRank('rank')).rejects.toThrow('Rank must be a RankBuilder instance.')
  })

  it('Throw an error if rank is already in the guild', () => {
    const rank = new RankBuilder({ nameplate: 'test', color: 'Red', max: 2, min: 3, priority: 1 })
    const guild = new Guild(client, { guildId: '1', ranks: [rank.toJSON()], achievements: [], users: [] })

    expect(async () => await guild.appendRank(rank)).rejects.toThrow('Rank is already in the guild (choose other priority).')
  })

  it('Append a rank to the guild', async () => {
    const rank = new RankBuilder({ nameplate: 'test', color: 'Red', max: 2, min: 3, priority: 1 })
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })

    await guild.appendRank(rank)

    expect(guild.ranks.cache.size).toBe(1)
  })

  /* appendAchievement */
  it('Throw an error if rank is not provided or is not an instance of Rank', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })

    expect(async () => await guild.appendAchievement()).rejects.toThrow('Missing argument: achievement')
    expect(async () => await guild.appendAchievement('achievement')).rejects.toThrow('Achievement must be a AchievementBuilder instance.')
  })

  it('Throw an error if rank is already in the guild', () => {
    const achievement = new AchievementBuilder({ name: 'test', description: 'test', reward: 100, type: 1 })
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [achievement.toJSON()], users: [] })

    expect(async () => await guild.appendAchievement(achievement)).rejects.toThrow('Achievement is already in the guild (choose other name).')
  })

  it('Append a rank to the guild', async () => {
    const achievement = new AchievementBuilder({ name: 'test', description: 'test', reward: 100, type: 1 })
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })

    await guild.appendAchievement(achievement)

    expect(guild.achievements.cache.size).toBe(1)
  })

  /* deleteRank */
  it('Throw an error if priority of rank is not provided or is other type ', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })

    expect(async () => await guild.deleteRank()).rejects.toThrow('Missing argument: priority')
    expect(async () => await guild.deleteRank('priority')).rejects.toThrow('Priority must be a number.')
  })

  it('Throw an error if rank is not in the guild', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })

    expect(async () => await guild.deleteRank(1)).rejects.toThrow('Rank not found.')
  })

  it('Delete a rank from the guild', async () => {
    const rank = new RankBuilder({ nameplate: 'test', color: 'Red', max: 2, min: 3, priority: 1 })
    const guild = new Guild(client, { guildId: '1', ranks: [rank.toJSON()], achievements: [], users: [] })

    expect(guild.ranks.cache.size).toBe(1)

    await guild.deleteRank(1)

    expect(guild.ranks.cache.size).toBe(0)
  })

  /* deleteAchievement */
  it('Throw an error if name of achievement is not provided or is other type ', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })

    expect(async () => await guild.deleteAchievement()).rejects.toThrow('Missing argument: name')
    expect(async () => await guild.deleteAchievement(1)).rejects.toThrow('Name must be a string.')
  })

  it('Throw an error if achievement is not in the guild', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })

    expect(async () => await guild.deleteAchievement('test')).rejects.toThrow('Achievement not found.')
  })

  it('Delete a achievement from the guild', async () => {
    const achievement = new AchievementBuilder({ name: 'test', description: 'test', reward: 100, type: 1 })
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [achievement.toJSON()], users: [] })

    expect(guild.achievements.cache.size).toBe(1)

    await guild.deleteAchievement('test')

    expect(guild.achievements.cache.size).toBe(0)
  })

  /* toJSON */
  it('Return the guild as JSON', () => {
    const rank = new RankBuilder({ nameplate: 'test', color: 'Red', max: 2, min: 3, priority: 1 })
    const achievement = new AchievementBuilder({ name: 'test', description: 'test', reward: 100, type: 1 })
    const guild = new Guild(client, { guildId: '1', ranks: [rank.toJSON()], achievements: [achievement.toJSON()], users: [] })

    expect(guild.toJSON()).toEqual({ guildId: '1', ranks: [rank.toJSON()], achievements: [achievement.toJSON()], users: [] })
  })
}, { timeout: 1000 * 60 * 5 })
