import { describe, expect, it } from 'vitest'
import { certificateInputSchema } from './certificate.schemas'

const uuid = '11111111-1111-4111-8111-111111111111'

describe('certificate schemas', () => {
  it('requires workshop and student ids', () => {
    expect(
      certificateInputSchema.parse({
        workshopId: uuid,
        studentId: uuid,
      }),
    ).toEqual({
      workshopId: uuid,
      studentId: uuid,
    })

    expect(() =>
      certificateInputSchema.parse({
        workshopId: uuid,
        studentId: 'invalid',
      }),
    ).toThrow()
  })
})
