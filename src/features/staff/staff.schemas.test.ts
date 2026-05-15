import { describe, expect, it } from 'vitest'
import { staffInputSchema } from './staff.schemas'

describe('staff schemas', () => {
  it('normalizes optional text fields from blank strings', () => {
    expect(
      staffInputSchema.parse({
        name: '  Ada Lovelace  ',
        email: '   ',
        phone: '',
        type: 'teacher',
      }),
    ).toEqual({
      name: 'Ada Lovelace',
      email: undefined,
      phone: undefined,
      type: 'teacher',
    })
  })
})
