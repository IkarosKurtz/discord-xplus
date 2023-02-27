import { RankBuilder } from '../src'
import { describe, it, expect } from 'vitest'

describe('RankBuilder', () => {
  it('Throw an error if data is not a object', () => {
    expect(() => new RankBuilder(2)).toThrow('Data must be a object.')
  })

  it('throw an error if the passed data is not the correct type', () => {
    expect(() => new RankBuilder({ nameplate: 2 })).toThrow()

    expect(() => new RankBuilder({ color: 2 })).toThrow()

    expect(() => new RankBuilder({ min: 'sds' })).toThrow()
  })

  it('Throw an error if the method to set some property is not a the correct type', () => {
    expect(() => new RankBuilder().setNameplate(2)).toThrow('Nameplate must be a string.')

    expect(() => new RankBuilder().setColor(2)).toThrow('Color must be a string.')

    expect(() => new RankBuilder().setMin('sds')).toThrow('Min must be a number.')

    expect(() => new RankBuilder().setMax('sds')).toThrow('Max must be a number.')

    expect(() => new RankBuilder().setPriority('sds')).toThrow('Priority must be a number.')
  })

  it('Each method should return itself', () => {
    expect(new RankBuilder().setColor('White')).toBeInstanceOf(RankBuilder)

    expect(new RankBuilder().setNameplate('Test')).toBeInstanceOf(RankBuilder)

    expect(new RankBuilder().setMin(0)).toBeInstanceOf(RankBuilder)

    expect(new RankBuilder().setMax(100)).toBeInstanceOf(RankBuilder)

    expect(new RankBuilder().setPriority(50)).toBeInstanceOf(RankBuilder)
  })

  it('toJSON should return a object with all properties', () => {
    expect(new RankBuilder().setColor('White').setNameplate('Test').setMin(0).setMax(100).setPriority(50).toJSON()).toEqual({
      nameplate: 'Test',
      color: 'White',
      priority: 50,
      min: 0,
      max: 100
    })

    expect(new RankBuilder({ nameplate: 'Test', color: 'White', priority: 50, min: 0, max: 100 }).toJSON()).toEqual({
      nameplate: 'Test',
      color: 'White',
      priority: 50,
      min: 0,
      max: 100
    })

    expect(new RankBuilder({ nameplate: 'Test', min: 0, max: 100 }).setColor('Black').setPriority(50).toJSON()).toEqual({
      nameplate: 'Test',
      color: 'Black',
      priority: 50,
      min: 0,
      max: 100
    })
  })
})
