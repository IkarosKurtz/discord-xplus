import Discord from 'discord.js'
import { describe, it, expect } from 'vitest'
import { BaseManager, UserDoc } from '../src'

describe('BaseManager', () => {
  const client = new Discord.Client({
    intents: [Discord.GatewayIntentBits.Guilds]
  })

  /* Arguments: client */
  it('Should throw an error if client is not provided', () => {
    expect(() => new BaseManager()).toThrowError('Missing argument: client')

    expect(() => new BaseManager(null)).toThrowError('Missing argument: client')

    expect(() => new BaseManager(2)).toThrowError('Client must be a Discord Client instance.')
  })

  /* Cache */
  it('Should have a cache property', () => {
    const manager = new BaseManager(client, UserDoc)

    expect(manager.cache).toBeInstanceOf(Discord.Collection)
  })

  /* Client */
  it('Should have a client property', () => {
    const manager = new BaseManager(client, UserDoc)

    expect(manager.client).instanceOf(Discord.Client)
  })

  /* Holds */
  it('Should have a holds property and it should return the name of the class that holds the cache', () => {
    const manager = new BaseManager(client, BaseManager)

    expect(manager.holds).toBe('BaseManager')

    const manager2 = new BaseManager(client, UserDoc)

    expect(manager2.holds).toBe('UserDoc')
  })
})
