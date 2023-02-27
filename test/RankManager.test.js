import Discord from 'discord.js'
import { RankBuilder, RankManager } from '../src'
import { describe, it, expect } from 'vitest'

describe('RankManager', () => {
  const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] })

  /* Arguments: client */
  it('Throw an error if client is not provided or is other type', () => {
    expect(() => new RankManager()).toThrow('Missing argument: client')
    expect(() => new RankManager('client')).toThrow('Client must be a Discord Client instance.')
  })

  /* Arguments: iterable */
  it('Throw an error if iterable is not provided or is other type', () => {
    expect(() => new RankManager(client)).toThrow('Missing argument: iterable')
    expect(() => new RankManager(client, 'iterable')).toThrow('Iterable must be an array.')
  })

  /* Properties: cache */
  it('Property cache return a Collection of ranks', () => {
    const rank = new RankBuilder().setNameplate('test').setColor('test').setPriority(1).setMax(24).setMin(0)

    const manager = new RankManager(client, [rank.toJSON()])

    expect(manager.cache).toBeInstanceOf(Discord.Collection)

    expect(manager.cache.size).toBe(1)

    expect(manager.cache.map(a => a)).toStrictEqual([rank.toJSON()])
  })

  /* _add */
  it('_add should return a new entry in the cache, must be the same object as iterable', () => {
    const manager = new RankManager(client, [])

    const rank = new RankBuilder().setNameplate('test').setColor('test').setPriority(1).setMax(24).setMin(0)

    expect(manager._add(rank.toJSON())).toBe(rank.toJSON())
  })
})
