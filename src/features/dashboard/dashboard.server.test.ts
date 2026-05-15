import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createQuery,
  type QueryResult,
} from '~/test/drizzle-test-query'

const mocks = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
  }

  return { db }
})

vi.mock('~/db', () => ({
  db: mocks.db,
}))

import type { AdminContext } from '~/lib/admin-context'
import { getAdminDashboard } from './dashboard.server'

const adminContext: AdminContext = {
  admin: {
    id: 'admin-1',
  },
}

function queueSelects(results: QueryResult[]) {
  for (const result of results) {
    mocks.db.select.mockReturnValueOnce(createQuery(result))
  }
}

describe('dashboard server functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('collects admin-owned data and serializes date values', async () => {
    queueSelects([
      [
        {
          id: 'workshop-1',
          createdAt: new Date('2026-06-01T10:00:00.000Z'),
          endDate: '2026-06-02',
          startDate: '2026-06-01',
          updatedAt: null,
        },
      ],
      [
        {
          id: 'staff-1',
          createdAt: new Date('2026-05-01T10:00:00.000Z'),
          updatedAt: null,
        },
      ],
      [
        {
          id: 'student-1',
          birthDate: '2000-01-01',
          createdAt: new Date('2026-04-01T10:00:00.000Z'),
          updatedAt: null,
        },
      ],
      [
        {
          id: 'participant-1',
          createdAt: new Date('2026-07-01T10:00:00.000Z'),
          studentBirthDate: '2000-01-01',
        },
      ],
      [
        {
          id: 'attendance-1',
          date: new Date('2026-08-01T00:00:00.000Z'),
        },
      ],
      [
        {
          id: 'certificate-1',
          endDate: '2026-06-02',
          issuedAt: new Date('2026-09-01T10:00:00.000Z'),
          startDate: '2026-06-01',
        },
      ],
      [
        {
          name: 'Ada Lovelace',
          staffId: 'staff-1',
          type: 'teacher',
          workshopId: 'workshop-1',
        },
      ],
    ])

    const dashboard = await getAdminDashboard(adminContext)

    expect(dashboard.workshops[0]).toMatchObject({
      createdAt: '2026-06-01T10:00:00.000Z',
      staffIds: ['staff-1'],
      updatedAt: null,
    })
    expect(dashboard.workshops[0]?.staff).toEqual([
      {
        name: 'Ada Lovelace',
        staffId: 'staff-1',
        type: 'teacher',
        workshopId: 'workshop-1',
      },
    ])
    expect(dashboard.attendance[0]?.date).toBe(
      '2026-08-01T00:00:00.000Z',
    )
    expect(dashboard.certificates[0]?.issuedAt).toBe(
      '2026-09-01T10:00:00.000Z',
    )
  })
})
