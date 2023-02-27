import Discord from 'discord.js'
import { UserDoc } from '../src'
import { describe, it, expect } from 'vitest'

describe('User', () => {
  const client = new Discord.Client({
    intents: [Discord.GatewayIntentBits.Guilds]
  })

  /* Arguments: Client */
  it('Throw an error if the client argument is not a Discord.Client', () => {
    expect(() => new UserDoc()).toThrow('Missing argument: client')

    expect(() => new UserDoc(2)).toThrow('Client must be a Discord Client instance.')
  })

  /* Arguments: Data */
  it('Throw an error if the data argument is not an object', () => {
    expect(() => new UserDoc(client)).toThrow('Missing argument: data')

    expect(() => new UserDoc(client, 2)).toThrow('Data must be an object')
  })

  it('Throw an error some argument is not the correct type or not exists', () => {
    expect(() => new UserDoc(client, {
      id: 2
    })).toThrow('Id must be a string')

    expect(() => new UserDoc(client, {
      id: '2',
      username: 2
    })).toThrow('Username must be a string')

    expect(() => new UserDoc(client, {
      id: '2'
    })).toThrow('Missing argument: username')

    expect(() => new UserDoc(client, {
      id: '2',
      username: 'Ikaros'
    })).toThrow('Missing argument: xp')

    expect(() => new UserDoc(client, {
      id: '2',
      username: 'Ikaros',
      xp: '2'
    })).toThrow('Xp must be a number')

    expect(() => new UserDoc(client, {
      id: '233',
      username: 'Ikaros',
      xp: 2
    })).toThrow('Missing argument: level')

    expect(() => new UserDoc(client, {
      id: '2',
      username: 'Ikaros',
      xp: 2,
      level: '2'
    })).toThrow('Level must be a number')

    expect(() => new UserDoc(client, {
      id: '2',
      username: 'Ikaros',
      xp: 2,
      level: 2
    })).toThrow('Missing argument: maxXpToLevelUp')

    expect(() => new UserDoc(client, {
      id: '2',
      username: 'Ikaros',
      xp: 2,
      level: 2,
      maxXpToLevelUp: '2'
    })).toThrow('MaxXpToLevelUp must be a number')

    expect(() => new UserDoc(client, {
      id: '2',
      username: 'Ikaros',
      xp: 2,
      level: 2,
      maxXpToLevelUp: 2
    })).toThrow('Missing argument: rank')

    expect(() => new UserDoc(client, {
      id: '2',
      username: 'Ikaros',
      xp: 2,
      level: 2,
      maxXpToLevelUp: 2,
      rank: '2'
    })).toThrow('Rank must be a object')

    expect(() => new UserDoc(client, {
      id: '2',
      username: 'Ikaros',
      xp: 2,
      level: 2,
      maxXpToLevelUp: 2,
      rank: {}
    })).toThrow('Missing argument: achievements')

    expect(() => new UserDoc(client, {
      id: '2',
      username: 'Ikaros',
      xp: 2,
      level: 2,
      maxXpToLevelUp: 2,
      rank: {},
      achievements: '2'
    })).toThrow('Achievements must be a array')
  })

  /* Properties */
  it('Id property is a string', () => {
    const user = new UserDoc(client, {
      id: '2',
      username: 'Ikaros',
      xp: 2,
      level: 2,
      maxXpToLevelUp: 2,
      rank: {},
      achievements: []
    })

    expect(user.id).toBe('2')
  })

  it('Username property is a string', () => {
    const user = new UserDoc(client, {
      id: '2',
      username: 'Ikaros',
      xp: 2,
      level: 2,
      maxXpToLevelUp: 2,
      rank: {},
      achievements: []
    })

    expect(user.username).toBe('Ikaros')
  })
})
