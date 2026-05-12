import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createQuery,
  type QueryResult,
} from '~/test/drizzle-test-query'

const mocks = vi.hoisted(() => {
  const db = {
    insert: vi.fn(),
    select: vi.fn(),
  }

  return { db }
})

vi.mock('~/db', () => ({
  db: mocks.db,
}))

import type { AdminContext } from '~/lib/admin-context'
import { saveAttendance } from './attendance.server'

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

describe('attendance server functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('upserts attendance after validating ownership and participation', async () => {
    const attendanceInsert = createQuery([])
    queueSelects([
      [{ id: 'workshop-1' }],
      [{ id: 'student-1' }],
      [{ id: 'participant-1' }],
    ])
    mocks.db.insert.mockReturnValueOnce(attendanceInsert)

    await expect(
      saveAttendance(adminContext, {
        date: '2026-08-01',
        isPresent: true,
        studentId: 'student-1',
        workshopId: 'workshop-1',
      }),
    ).resolves.toEqual({ ok: true })

    expect(attendanceInsert.values).toHaveBeenCalledWith({
      date: '2026-08-01',
      isPresent: true,
      studentId: 'student-1',
      workshopId: 'workshop-1',
    })
    expect(attendanceInsert.onConflictDoUpdate).toHaveBeenCalled()
  })
})
