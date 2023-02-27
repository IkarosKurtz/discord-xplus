import Discord from 'discord.js'
import { AchievementBuilder, AchievementManager } from '../src'
import { describe, it, expect } from 'vitest'

describe('AchievementManager', () => {
  const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] })

  /* Arguments: client */
  it('Throw an error if client is not provided or is other type', () => {
    expect(() => new AchievementManager()).toThrow('Missing argument: client')
    expect(() => new AchievementManager('client')).toThrow('Client must be a Discord Client instance.')
  })

  /* Arguments: iterable */
  it('Throw an error if iterable is not provided or is other type', () => {
    expect(() => new AchievementManager(client)).toThrow('Missing argument: iterable')
    expect(() => new AchievementManager(client, 'iterable')).toThrow('Iterable must be an array.')
  })

  /* Properties: cache */
  it('Property cache return a Collection of achievements', () => {
    const achievement = new AchievementBuilder().setName('test').setDescription('test').setReward(100).setType(1)

    const manager = new AchievementManager(client, [achievement.toJSON()])

    expect(manager.cache).toBeInstanceOf(Discord.Collection)

    expect(manager.cache.size).toBe(1)

    expect(manager.cache.map(a => a)).toStrictEqual([achievement.toJSON()])
  })

  /* _add */
  it('_add should return a new entry in the cache, must be the same object as iterable', () => {
    const manager = new AchievementManager(client, [])

    const achievement = new AchievementBuilder().setName('test').setDescription('test').setReward(100).setType(1)

    expect(manager._add(achievement.toJSON())).toBe(achievement.toJSON())
  })
})
