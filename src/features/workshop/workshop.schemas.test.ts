import { describe, expect, it } from 'vitest'
import { workshopInputSchema } from './workshop.schemas'

describe('workshop schemas', () => {
  it('coerces numeric fields and defaults staff ids', () => {
    const parsed = workshopInputSchema.parse({
      name: 'Introducao ao React',
      description: 'Oficina pratica para iniciantes',
      theme: 'Frontend',
      startDate: '2026-06-01',
      endDate: '2026-06-02',
      workload: '12',
      status: 'planned',
      vacancies: '20',
      isPublic: true,
      showParticipants: false,
    })

    expect(parsed.workload).toBe(12)
    expect(parsed.vacancies).toBe(20)
    expect(parsed.staffIds).toEqual([])
  })

  it('rejects invalid dates and non-positive capacity', () => {
    expect(() =>
      workshopInputSchema.parse({
        name: 'A',
        description: 'Oficina pratica',
        theme: 'Frontend',
        startDate: '01/06/2026',
        endDate: '2026-06-02',
        workload: 0,
        status: 'planned',
        vacancies: 0,
        isPublic: true,
        showParticipants: false,
        staffIds: [],
      }),
    ).toThrow()
  })
})
