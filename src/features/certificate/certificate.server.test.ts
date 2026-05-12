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
  }

  return {
    db,
    randomUUID: vi.fn(() => 'abcdef12-3456-4789-9abc-def012345678'),
    setResponseStatus: vi.fn(),
  }
})

vi.mock('node:crypto', () => ({
  randomUUID: mocks.randomUUID,
}))

vi.mock('@tanstack/react-start/server', () => ({
  setResponseStatus: mocks.setResponseStatus,
}))

vi.mock('~/db', () => ({
  db: mocks.db,
}))

import type { AdminContext } from '~/lib/admin-context'
import { issueCertificate } from './certificate.server'

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

describe('certificate server functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.randomUUID.mockReturnValue(
      'abcdef12-3456-4789-9abc-def012345678',
    )
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('issues certificates only for active participants and persists a deterministic code', async () => {
    const certificateInsert = createQuery([])
    queueSelects([
      [{ id: 'workshop-1', vacancies: null }],
      [{ id: 'student-1' }],
      [{ status: 'completed' }],
    ])
    mocks.db.insert.mockReturnValueOnce(certificateInsert)

    await expect(
      issueCertificate(adminContext, {
        studentId: 'student-1',
        workshopId: 'workshop-1',
      }),
    ).resolves.toEqual({
      code: 'DIGI-2026-ABCDEF12',
      ok: true,
    })

    expect(certificateInsert.values).toHaveBeenCalledWith({
      certificateCode: 'DIGI-2026-ABCDEF12',
      studentId: 'student-1',
      workshopId: 'workshop-1',
    })
  })

  it('rejects certificates for pending participants', async () => {
    queueSelects([
      [{ id: 'workshop-1', vacancies: null }],
      [{ id: 'student-1' }],
      [{ status: 'pending' }],
    ])

    await expect(
      issueCertificate(adminContext, {
        studentId: 'student-1',
        workshopId: 'workshop-1',
      }),
    ).rejects.toThrow(
      'Certificado permitido apenas para participantes aprovados.',
    )

    expect(mocks.setResponseStatus).toHaveBeenCalledWith(400)
    expect(mocks.db.insert).not.toHaveBeenCalled()
  })
})
