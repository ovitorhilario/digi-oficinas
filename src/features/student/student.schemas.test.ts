import { describe, expect, it } from 'vitest'
import { studentInputSchema } from './student.schemas'

describe('student schemas', () => {
  it('normalizes optional text and date fields from blank strings', () => {
    expect(
      studentInputSchema.parse({
        name: 'Grace Hopper',
        email: '',
        phone: '  11999999999  ',
        document: '   ',
        birthDate: '',
      }),
    ).toMatchObject({
      email: undefined,
      phone: '11999999999',
      document: undefined,
      birthDate: undefined,
    })
  })
})
