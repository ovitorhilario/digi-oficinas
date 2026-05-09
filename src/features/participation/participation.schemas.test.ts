import { describe, expect, it } from 'vitest'
import {
  manualEnrollmentSchema,
  publicSignupSchema,
} from './participation.schemas'

const uuid = '11111111-1111-4111-8111-111111111111'

describe('participation schemas', () => {
  it('defaults manual enrollment status to participant', () => {
    expect(
      manualEnrollmentSchema.parse({
        workshopId: uuid,
        studentId: uuid,
      }),
    ).toEqual({
      workshopId: uuid,
      studentId: uuid,
      status: 'participant',
    })
  })

  it('accepts the public signup honeypot only when empty', () => {
    expect(
      publicSignupSchema.parse({
        workshopId: uuid,
        name: 'Linus Torvalds',
        email: 'linus@example.com',
        phone: '',
        company: '',
      }),
    ).toMatchObject({
      phone: undefined,
      company: '',
    })

    expect(() =>
      publicSignupSchema.parse({
        workshopId: uuid,
        name: 'Linus Torvalds',
        email: 'linus@example.com',
        company: 'bot-value',
      }),
    ).toThrow()
  })
})
