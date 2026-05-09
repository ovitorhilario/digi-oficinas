import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  createQuery,
  type QueryResult,
} from '~/test/drizzle-test-query'

const mocks = vi.hoisted(() => {
  const db = {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  }

  return {
    db,
    getRequestHeader: vi.fn(),
    setResponseStatus: vi.fn(),
  }
})

vi.mock('@tanstack/react-start/server', () => ({
  getRequestHeader: mocks.getRequestHeader,
  setResponseStatus: mocks.setResponseStatus,
}))

vi.mock('~/db', () => ({
  db: mocks.db,
}))

import type { AdminContext } from '~/lib/admin-context'
import {
  decideParticipation,
  enrollStudent,
  publicSignup,
} from './participation.server'

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

function queueInserts(results: QueryResult[]) {
  for (const result of results) {
    mocks.db.insert.mockReturnValueOnce(createQuery(result))
  }
}

describe('participation server functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('enrolls a student when the workshop has vacancies available', async () => {
    const enrollmentInsert = createQuery([])
    queueSelects([
      [{ id: 'workshop-1', vacancies: 2 }],
      [{ id: 'student-1' }],
      [{ total: 1 }],
    ])
    mocks.db.insert.mockReturnValueOnce(enrollmentInsert)

    await expect(
      enrollStudent(adminContext, {
        status: 'participant',
        studentId: 'student-1',
        workshopId: 'workshop-1',
      }),
    ).resolves.toEqual({ ok: true })

    expect(enrollmentInsert.values).toHaveBeenCalledWith({
      status: 'participant',
      studentId: 'student-1',
      workshopId: 'workshop-1',
    })
    expect(enrollmentInsert.onConflictDoUpdate).toHaveBeenCalled()
  })

  it('blocks enrollment when a workshop is full', async () => {
    queueSelects([
      [{ id: 'workshop-1', vacancies: 1 }],
      [{ id: 'student-1' }],
      [{ total: 1 }],
    ])

    await expect(
      enrollStudent(adminContext, {
        status: 'participant',
        studentId: 'student-1',
        workshopId: 'workshop-1',
      }),
    ).rejects.toThrow('A oficina nÃ£o possui vagas')

    expect(mocks.setResponseStatus).toHaveBeenCalledWith(400)
    expect(mocks.db.insert).not.toHaveBeenCalled()
  })

  it('approves participation only after checking vacancy limits', async () => {
    const updateQuery = createQuery([])
    queueSelects([
      [
        {
          id: 'participation-1',
          vacancies: 3,
          workshopId: 'workshop-1',
        },
      ],
      [{ total: 2 }],
    ])
    mocks.db.update.mockReturnValueOnce(updateQuery)

    await expect(
      decideParticipation(adminContext, {
        decision: 'approve',
        participationId: 'participation-1',
      }),
    ).resolves.toEqual({ ok: true })

    expect(updateQuery.set).toHaveBeenCalledWith({
      status: 'participant',
    })
  })

  it('rejects participation without running a vacancy check', async () => {
    const updateQuery = createQuery([])
    queueSelects([
      [
        {
          id: 'participation-1',
          vacancies: 1,
          workshopId: 'workshop-1',
        },
      ],
    ])
    mocks.db.update.mockReturnValueOnce(updateQuery)

    await expect(
      decideParticipation(adminContext, {
        decision: 'reject',
        participationId: 'participation-1',
      }),
    ).resolves.toEqual({ ok: true })

    expect(mocks.db.select).toHaveBeenCalledTimes(1)
    expect(updateQuery.set).toHaveBeenCalledWith({
      status: 'rejected',
    })
  })

  it('creates a pending public signup from forwarded IP data', async () => {
    const studentInsert = createQuery([{ id: 'student-1' }])
    const participantInsert = createQuery([])
    mocks.getRequestHeader.mockReturnValueOnce('203.0.113.10, proxy')
    queueSelects([
      [
        {
          adminId: 'admin-1',
          id: 'workshop-1',
        },
      ],
    ])
    mocks.db.insert
      .mockReturnValueOnce(studentInsert)
      .mockReturnValueOnce(participantInsert)

    await expect(
      publicSignup({
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        phone: undefined,
        workshopId: 'workshop-1',
      }),
    ).resolves.toEqual({ ok: true })

    expect(studentInsert.values).toHaveBeenCalledWith({
      adminId: 'admin-1',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      phone: null,
    })
    expect(participantInsert.values).toHaveBeenCalledWith({
      message: null,
      status: 'pending',
      studentId: 'student-1',
      workshopId: 'workshop-1',
    })
  })

  it('rate-limits public signup attempts by IP', async () => {
    mocks.getRequestHeader.mockReturnValue('198.51.100.15')
    queueSelects(
      Array.from({ length: 5 }, () => [
        {
          adminId: 'admin-1',
          id: 'workshop-1',
        },
      ]),
    )
    queueInserts(
      Array.from({ length: 10 }, (_, index) =>
        index % 2 === 0 ? [{ id: `student-${index}` }] : [],
      ),
    )

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await publicSignup({
        email: `student-${attempt}@example.com`,
        name: `Student ${attempt}`,
        phone: undefined,
        workshopId: 'workshop-1',
      })
    }

    await expect(
      publicSignup({
        email: 'blocked@example.com',
        name: 'Blocked Student',
        phone: undefined,
        workshopId: 'workshop-1',
      }),
    ).rejects.toThrow('Muitas tentativas')

    expect(mocks.setResponseStatus).toHaveBeenCalledWith(429)
  })
})
