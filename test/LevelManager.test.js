import Discord from 'discord.js'
import { describe, expect, it } from 'vitest'
import { AchievementBuilder, LevelManager, RankBuilder, Options } from '../src'

describe('Level manager options', () => {
  // Create a discord client instance before all tests
  const client = new Discord.Client({
    intents: [Discord.GatewayIntentBits.Guilds]
  })
  /* client */
  it('Throw an error if options does not have a discord client instance or is other type of value', () => {
    expect(() => new LevelManager()).toThrow('Missing argument: client')

    expect(() => new LevelManager(2)).toThrow('Client must be a discord client instance.')
  })

  /* Options */
  it('Throw an error if options is not a object', () => {
    expect(() => new LevelManager(client, 2)).toThrow('Options must be a object.')

    expect(() => new LevelManager(client)).toThrow('Missing argument: options')
  })

  /* Options: mongoUri */
  it('Throw an error if options does not have a mongodb uri or isn\'t a string', () => {
    expect(() => new LevelManager(client, {})).toThrow('Options must have a mongodb uri.')

    expect(() => new LevelManager(client, { mongoUri: 2 })).toThrow('Mongo uri must be a string.')

    expect(() => new LevelManager(client, { mongoUri: [] })).toThrow('Mongo uri must be a string.')
  })

  /* Options: ranks */
  it('Throw an error if in options ranks is not a array or if have length 0.', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', ranks: 2 })).toThrow('Ranks must be a array.')

    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', ranks: [] })).toThrow('Ranks must have at least one element.')
  })

  it('Throw an error if ranks is not a array of object or instance of Rank', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', ranks: [2, 'dsd'] })).toThrow('Ranks must be a array of object or instance of Rank.')
  })

  it('Throw an error if array of rank object does not have all properties or is other type of value', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', ranks: [{ nameplate: 'test' }] })).toThrow('Ranks must have all properties: nameplate, color, priority, min, and max.')

    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', ranks: [{ nameplate: 'test', color: 'test', max: 'asd', min: 'sdsd', priority: 'asds' }] })).toThrow()

    const rank = new RankBuilder().setColor('test').setNameplate('test').setMax(2).setMin(3)
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', ranks: [rank] })).toThrow()
  })

  it('Throw an error if array of rank instance does not have all properties.', () => {
    const rank = new RankBuilder({ nameplate: 'test', color: 'test', max: 2, min: 3 })
    const rank2 = new RankBuilder().setColor('test').setNameplate('test').setMax(2).setMin(3)

    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', ranks: [rank] })).toThrow('Ranks must have all properties: nameplate, color, priority, min, and max.')

    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', ranks: [rank2] })).toThrow('Ranks must have all properties: nameplate, color, priority, min, and max.')
  })

  /* Options: ranks = null | undefined */
  it('ranks must be return an array of rank object even if ranks is null or undefined', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', ranks: undefined })
    expect(levelManager.ranks).toEqual(Options.setDefaultRanks())

    const levelManager2 = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', ranks: null })
    expect(levelManager2.ranks).toEqual(Options.setDefaultRanks())
  })

  /* Options: Achievements */
  it('Throw an error if in options achievements is not a array or if have length 0.', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: 2 })).toThrow('Achievements must be a array.')

    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: [] })).toThrow('Achievements must have at least one element.')
  })

  it('Throw an error if achievements is not a array of object or instance of Achievement', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: [2, 'dsd'] })).toThrow('Achievements must be a array of object or instance of Achievement.')
  })

  it('Throw an error if array of achievement object does not have all properties or is other type of value', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: [{ name: 'test' }] })).toThrow('Achievements must have all properties: name, description, reward, and type. (thumbnail is optional)')

    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: [{ name: 'test', description: 'sd', reward: 'dsd', thumbnail: 'sd', type: 'sds' }] })).toThrow()

    const achievement = new AchievementBuilder().setName('test').setDescription('sd').setReward(3).setType(1)
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: [achievement] })).toThrow()
  })

  it('Throw an error if some achievement in array of doesn\'t have a valid type of achievement', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: [{ name: 'test', description: 'sd', reward: 3, thumbnail: 'sd', type: 3 }] })).toThrow('Type must be a valid achievement type.')
  })

  it('Throw an error if array of achievement instance does not have all properties.', () => {
    const achievement = new AchievementBuilder({ description: 'sd', reward: 2, thumbnail: 'sd', type: 1 })
    const achievement2 = new AchievementBuilder().setDescription('sd').setReward(3).setThumbnail('sd').setType(1)

    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: [achievement] })).toThrow('Achievements must have all properties: name, description, reward, and type. (thumbnail is optional)')

    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: [achievement2] })).toThrow('Achievements must have all properties: name, description, reward, and type. (thumbnail is optional)')
  })

  /* Options: achievements = null | undefined */
  it('achievements must be return an array of achievement object even if achievements is null or undefined', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: undefined })
    expect(levelManager.achievements).toEqual(Options.setDefaultAchievements())

    const levelManager2 = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', achievements: null })
    expect(levelManager2.achievements).toEqual(Options.setDefaultAchievements())
  })

  /* Options: maxXpToLevelUp */
  it('Throw an error if in options maxXpToLevelUp is not a number', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', maxXpToLevelUp: 'test' })).toThrow('Property maxXpToLevelUp must be a number.')
  })

  /* Options: maxXpToLevelUp = null | undefined */
  it('maxXpToLevelUp must be return a number even if maxXpToLevelUp is null or undefined', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', maxXpToLevelUp: undefined })
    expect(levelManager.maxXpToLevelUp).toEqual(2500)

    const levelManager2 = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', maxXpToLevelUp: null })
    expect(levelManager2.maxXpToLevelUp).toEqual(2500)
  })

  /* maxXpFunction */
  it('Should return a number', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })
    expect(levelManager.maxXpFunction(1)).toEqual(2500)
  })

  /* Options: saveInterval */
  it('Throw an error if in options saveInterval is not a number', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', saveInterval: 'test' })).toThrow('Property saveInterval must be a number.')
  })

  /* Options: saveInterval = null | undefined */
  it('saveInterval must be return a number even if saveInterval is null or undefined', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', saveInterval: undefined })
    expect(levelManager.saveInterval).toEqual(1000 * 60 * 60 * 3)

    const levelManager2 = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', saveInterval: null })
    expect(levelManager2.saveInterval).toEqual(1000 * 60 * 60 * 3)
  })

  /* Options: autoSave */
  it('Throw an error if in options autoSave is not a boolean', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', autoSave: 'test' })).toThrow('Property autoSave must be a boolean.')
  })

  /* Options: autoSave = null | undefined */
  it('autoSave must be return a boolean even if autoSave is null or undefined', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', autoSave: undefined })
    expect(levelManager.autoSave).toEqual(true)

    const levelManager2 = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', autoSave: null })
    expect(levelManager2.autoSave).toEqual(true)
  })

  /* Options: eventsPath */
  it('Throw an error if in options eventsPath is not a string', () => {
    expect(() => new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', eventsPath: 2 })).toThrow('Property eventsPath must be a string.')
  })

  /* Options: eventsPath = null | undefined */
  it('eventsPath must be return a string even if eventsPath is null or undefined', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', eventsPath: undefined })
    expect(levelManager.eventsPath).toEqual(undefined)

    const levelManager2 = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017', eventsPath: null })
    expect(levelManager2.eventsPath).toEqual(undefined)
  })

  /* addXp */
  it('Throw an error if member is not a GuildMember', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })
    expect(async () => await levelManager.addXp()).rejects.toThrow('Member is required.')
    expect(async () => await levelManager.addXp('test', 2)).rejects.toThrow('Member must be a GuildMember.')
  })

  it('Throw an error if guildId is not a string or isn\'t valid', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })
    const member = new Discord.GuildMember()
    expect(async () => await levelManager.addXp(member, 2, 2)).rejects.toThrow('GuildId must be a string.')

    expect(async () => await levelManager.addXp(member, 2, 'test')).rejects.toThrow('GuildId must be a valid snowflake.')
  })

  it('Throw an error if xp is not a number', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })
    const member = new Discord.GuildMember()
    expect(async () => await levelManager.addXp(member)).rejects.toThrow('Xp is required.')
    expect(async () => await levelManager.addXp(member, 'test')).rejects.toThrow('Xp must be a number.')
  })

  it('Throw an error if xp is less than 0 and isn\'t a integer', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })
    const member = new Discord.GuildMember()
    expect(async () => await levelManager.addXp(member, -1)).rejects.toThrow('Xp must be greater than 0.')

    expect(async () => await levelManager.addXp(member, 1.5)).rejects.toThrow('Xp must be an integer.')
  })

  it('Should return false if the member doesn\'t has level up', async () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })

    /** @type {Discord.GuildMember} */
    const member = new Discord.GuildMember(client, { user: { id: '2', username: 'ikaros' } })

    expect(member.id).toBe('2')

    const res = await levelManager.addXp(member, 1)

    expect(res).toEqual(false)
  })

  it('Should return true if the member has level up', async () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })

    /** @type {Discord.GuildMember} */
    const member = new Discord.GuildMember(client, { user: { id: '2', username: 'ikaros' } })

    expect(member.id).toBe('2')

    const res = await levelManager.addXp(member, 2600)

    expect(res).toEqual(true)
  })

  /* levelUp */
  it('Throw an error if member is not a GuildMember', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })
    expect(async () => await levelManager.levelUp()).rejects.toThrow('Member is required.')
    expect(async () => await levelManager.levelUp('test')).rejects.toThrow('Member must be a GuildMember.')
  })

  it('Throw an error if guildId is not a string or isn\'t valid', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })
    const member = new Discord.GuildMember()
    expect(async () => await levelManager.levelUp(member, 2)).rejects.toThrow('GuildId must be a string.')

    expect(async () => await levelManager.levelUp(member, 'test')).rejects.toThrow('GuildId must be a valid snowflake.')
  })

  it('Should return new user with more level', async () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })

    /** @type {Discord.GuildMember} */
    const member = new Discord.GuildMember(client, { user: { id: '2', username: 'ikaros' } })

    const res = await levelManager.levelUp(member, '2')

    expect(res).toHaveProperty('level', 1)
  })

  /* rankUp */
  it('Throw an error if member is not a GuildMember', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })
    expect(async () => await levelManager.rankUp()).rejects.toThrow('Member is required.')
    expect(async () => await levelManager.rankUp('test')).rejects.toThrow('Member must be a GuildMember.')
  })

  it('Throw an error if guildId is not a string or isn\'t valid', () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })
    const member = new Discord.GuildMember()
    expect(async () => await levelManager.rankUp(member, 2)).rejects.toThrow('GuildId must be a string.')

    expect(async () => await levelManager.rankUp(member, 'test')).rejects.toThrow('GuildId must be a valid snowflake.')
  })

  it('Should return new user with more rank', async () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })

    /** @type {Discord.GuildMember} */
    const member = new Discord.GuildMember(client, { user: { id: '2', username: 'ikaros' } })

    const res = await levelManager.rankUp(member, '2')

    expect(res).toHaveProperty('rank.priority', 1)
  })

  /* removeLevel */
  it('Should return new user with less level', async () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })

    /** @type {Discord.GuildMember} */
    const member = new Discord.GuildMember(client, { user: { id: '2', username: 'ikaros' } })

    await levelManager.rankUp(member, '2')

    const res = await levelManager.removeLevel(member, '2')

    expect(res).toHaveProperty('level', 0)
  })

  /* degradeRank */
  it('Should return new user with less rank', async () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })

    /** @type {Discord.GuildMember} */
    const member = new Discord.GuildMember(client, { user: { id: '2', username: 'ikaros' } })

    await levelManager.rankUp(member, '2')

    await levelManager.rankUp(member, '2')

    const res = await levelManager.degradeRank(member, '2')

    expect(res).toHaveProperty('rank.priority', 1)
  })

  /* leaderboard */
  it('Should return the leaderboard even if there is no users', async () => {
    const levelManager = new LevelManager(client, { mongoUri: 'mongodb://localhost:27017' })

    /** @type {Discord.GuildMember} */
    const member = new Discord.GuildMember(client, { user: { id: '2', username: 'ikaros' } })

    const res = await levelManager.leaderboard()

    expect(res).toStrictEqual([])

    await levelManager.addXp(member, 2600)

    const res2 = await levelManager.leaderboard()

    expect(res2).toHaveProperty('length', 1)
  })
}, { timeout: 1000 * 60 * 5 })
