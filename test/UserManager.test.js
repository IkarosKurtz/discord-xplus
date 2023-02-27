import Discord from 'discord.js'
import { UserDoc, UserManager } from '../src'
import { describe, it, expect } from 'vitest'

describe('UserManager', () => {
  const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] })

  /* Arguments: client */
  it('should throw an error if client is not provided or is other type', () => {
    expect(() => new UserManager()).toThrowError('Missing argument: client')

    expect(() => new UserManager('client')).toThrowError('Client must be a Discord Client instance.')
  })

  /* Arguments: iterable */
  it('should throw an error if iterable is not provided or is other type', () => {
    expect(() => new UserManager(client)).toThrowError('Missing argument: iterable')

    expect(() => new UserManager(client, 'iterable')).toThrowError('Iterable must be an array.')
  })

  /* _add */
  it('_add should return a new entry in the cache, must be the same class as holds', () => {
    const user2 = new UserDoc(client, { id: '24234', achievements: [], level: 0, xp: 0, maxXpToLevelUp: 200, messages: [], rank: {}, username: 'test2' })

    const manager = new UserManager(client, [])

    expect(manager._add(user2)).instanceOf(UserDoc)
  })

  /* Properties: cache */
  it('cache should return a collection of the users', () => {
    const user1 = new UserDoc(client, { id: '12345', achievements: [], level: 0, xp: 0, maxXpToLevelUp: 200, messages: [], rank: {}, username: 'test1' })

    const user2 = new UserDoc(client, { id: '24234', achievements: [], level: 0, xp: 0, maxXpToLevelUp: 200, messages: [], rank: {}, username: 'test2' })

    const manager = new UserManager(client, [user1, user2])

    expect(manager.cache).instanceOf(Discord.Collection)
    expect(manager.cache.size).toBe(2)
  })
})
