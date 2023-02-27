import { AchievementBuilder } from '../src'
import { describe, it, expect } from 'vitest'

describe('AchievementBuilder', () => {
  it('Throw an error if data is not a object', () => {
    expect(() => new AchievementBuilder(2)).toThrow('Data must be a object.')
  })

  it('throw an error if the passed data is not the correct type', () => {
    expect(() => new AchievementBuilder({ name: 2 })).toThrow()

    expect(() => new AchievementBuilder({ thumbnail: 2 })).toThrow()

    expect(() => new AchievementBuilder({ reward: 'sds' })).toThrow()

    expect(() => new AchievementBuilder({ type: 'sds' })).toThrow()
  })

  it('Throw an error if the method to set some property is not a the correct type', () => {
    expect(() => new AchievementBuilder().setName(2)).toThrow('Name must be a string.')

    expect(() => new AchievementBuilder().setDescription(2)).toThrow('Description must be a string.')

    expect(() => new AchievementBuilder().setReward('sds')).toThrow('Reward must be a number.')

    expect(() => new AchievementBuilder().setThumbnail(2)).toThrow('Thumbnail must be a string.')

    expect(() => new AchievementBuilder().setType('sds')).toThrow('Type must be a valid achievement type.')
  })

  it('Each method should return itself', () => {
    expect(new AchievementBuilder().setType(1)).toBeInstanceOf(AchievementBuilder)

    expect(new AchievementBuilder().setName('sds')).toBeInstanceOf(AchievementBuilder)

    expect(new AchievementBuilder().setDescription('sds')).toBeInstanceOf(AchievementBuilder)

    expect(new AchievementBuilder().setReward(1)).toBeInstanceOf(AchievementBuilder)

    expect(new AchievementBuilder().setThumbnail('sds')).toBeInstanceOf(AchievementBuilder)
  })

  it('toJSON should return a object with all properties', () => {
    expect(new AchievementBuilder().setName('Test').setDescription('White').setThumbnail('web').setReward(0).setType(1).toJSON()).toEqual({
      name: 'Test',
      description: 'White',
      thumbnail: 'web',
      reward: 0,
      type: 1
    })

    expect(new AchievementBuilder().setName('Test').setDescription('White').setReward(0).setType(1).toJSON()).toEqual({
      name: 'Test',
      description: 'White',
      thumbnail: undefined,
      reward: 0,
      type: 1
    })

    expect(new AchievementBuilder({ name: 'Test', description: 'White', thumbnail: 'web', reward: 0, type: 1 }).toJSON()).toEqual({
      name: 'Test',
      description: 'White',
      thumbnail: 'web',
      reward: 0,
      type: 1
    })

    expect(new AchievementBuilder({ name: 'Test', description: 'White', reward: 0, type: 1 }).toJSON()).toEqual({
      name: 'Test',
      description: 'White',
      thumbnail: undefined,
      reward: 0,
      type: 1
    })

    expect(new AchievementBuilder({ name: 'Test', reward: 0, type: 1 }).setDescription('White').setThumbnail('web').toJSON()).toEqual({
      name: 'Test',
      description: 'White',
      thumbnail: 'web',
      reward: 0,
      type: 1
    })
  })

  it('Type should be a valid type of achievement', () => {
    expect(() => new AchievementBuilder().setType(3)).toThrow('Type must be a valid achievement type.')
    expect(() => new AchievementBuilder({ type: 2 })).toThrow('Type must be a valid achievement type.')
  })

  it('Throw an error if progress is not numbers', () => {
    expect(() => new AchievementBuilder().setProgress('2')).toThrow('Current progress must be a number.')

    expect(() => new AchievementBuilder().setProgress(2, '2')).toThrow('Max progress must be a number.')
  })
})
