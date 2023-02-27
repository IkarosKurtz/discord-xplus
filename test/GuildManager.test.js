import Discord from 'discord.js'
import { Guild, GuildManager } from '../src'
import { describe, it, expect } from 'vitest'

describe('GuildManager', () => {
  const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] })

  /* Arguments: client */
  it('Throw an error if client is not provided or is other type', () => {
    expect(() => new GuildManager()).toThrow('Missing argument: client')
    expect(() => new GuildManager('client')).toThrow('Client must be a Discord Client instance.')
  })

  /* Arguments: iterable */
  it('Throw an error if iterable is not provided or is other type', () => {
    expect(() => new GuildManager(client)).toThrow('Missing argument: iterable')
    expect(() => new GuildManager(client, 'iterable')).toThrow('Iterable must be an array.')
  })

  /* Properties: cache */
  it('Property cache return a Collection of guilds', () => {
    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })
    const guild2 = new Guild(client, { guildId: '3', ranks: [], achievements: [], users: [] })
    const guild3 = new Guild(client, { guildId: '2', ranks: [], achievements: [], users: [] })

    const manager = new GuildManager(client, [guild, guild2, guild3])

    expect(manager.cache).toBeInstanceOf(Discord.Collection)

    expect(manager.cache.size).toBe(3)
  })

  /* _add */
  it('_add should return a new entry in the cache, must be the same object as iterable', () => {
    const manager = new GuildManager(client, [])

    const guild = new Guild(client, { guildId: '1', ranks: [], achievements: [], users: [] })

    expect(manager._add(guild).guildId).toBe(guild.guildId)
  })
})
