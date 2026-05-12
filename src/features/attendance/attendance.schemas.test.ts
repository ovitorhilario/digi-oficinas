import { describe, expect, it } from 'vitest'
import { attendanceInputSchema } from './attendance.schemas'

const uuid = '11111111-1111-4111-8111-111111111111'

describe('attendance schemas', () => {
  it('accepts a valid attendance payload', () => {
    expect(
      attendanceInputSchema.parse({
        workshopId: uuid,
        studentId: uuid,
        date: '2026-06-01',
        isPresent: true,
      }),
    ).toEqual({
      workshopId: uuid,
      studentId: uuid,
      date: '2026-06-01',
      isPresent: true,
    })
  })

  it('rejects non-ISO dates', () => {
    expect(() =>
      attendanceInputSchema.parse({
        workshopId: uuid,
        studentId: uuid,
        date: '01/06/2026',
        isPresent: true,
      }),
    ).toThrow()
  })
})
