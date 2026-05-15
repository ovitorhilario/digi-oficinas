import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createQuery,
  type QueryResult,
} from '~/test/drizzle-test-query'

const mocks = vi.hoisted(() => {
  const db = {
    delete: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
    transaction: vi.fn(),
    update: vi.fn(),
  }

  return {
    db,
    setResponseStatus: vi.fn(),
  }
})

vi.mock('@tanstack/react-start/server', () => ({
  setResponseStatus: mocks.setResponseStatus,
}))

vi.mock('~/db', () => ({
  db: mocks.db,
}))

import type { AdminContext } from '~/lib/admin-context'
import { getPublicWorkshops, saveWorkshop } from './workshop.server'

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

describe('workshop server functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only active public workshops with serialized dates and visible participants', async () => {
    queueSelects([
      [
        {
          id: 'workshop-visible',
          createdAt: new Date('2026-06-01T10:00:00.000Z'),
          endDate: '2026-06-11',
          isPublic: true,
          showParticipants: true,
          startDate: '2026-06-10',
          status: 'planned',
          updatedAt: new Date('2026-06-02T10:00:00.000Z'),
        },
        {
          id: 'workshop-hidden',
          createdAt: '2026-07-01T10:00:00.000Z',
          endDate: null,
          isPublic: true,
          showParticipants: false,
          startDate: null,
          status: 'in_progress',
          updatedAt: null,
        },
        {
          id: 'workshop-finished',
          createdAt: '2026-05-01T10:00:00.000Z',
          endDate: '2026-05-02',
          isPublic: true,
          showParticipants: true,
          startDate: '2026-05-01',
          status: 'finished',
          updatedAt: null,
        },
      ],
      [
        {
          name: 'Ada Lovelace',
          type: 'teacher',
          workshopId: 'workshop-visible',
        },
        {
          name: 'Grace Hopper',
          type: 'tutor',
          workshopId: 'workshop-hidden',
        },
      ],
      [
        {
          name: 'Linus Torvalds',
          status: 'participant',
          workshopId: 'workshop-visible',
        },
        {
          name: 'Hidden Student',
          status: 'participant',
          workshopId: 'workshop-hidden',
        },
      ],
    ])

    const workshops = await getPublicWorkshops()

    expect(workshops).toHaveLength(2)
    expect(workshops[0]).toMatchObject({
      createdAt: '2026-06-01T10:00:00.000Z',
      id: 'workshop-visible',
      participants: [
        {
          name: 'Linus Torvalds',
          status: 'participant',
        },
      ],
      staff: [
        {
          name: 'Ada Lovelace',
          type: 'teacher',
        },
      ],
      updatedAt: '2026-06-02T10:00:00.000Z',
    })
    expect(workshops[1]?.participants).toEqual([])
  })

  it('saves a workshop inside a transaction and replaces staff links', async () => {
    queueSelects([[{ id: 'staff-1' }, { id: 'staff-2' }]])

    const deleteQuery = createQuery([])
    const staffLinkInsert = createQuery([])
    const tx = {
      delete: vi.fn(() => deleteQuery),
      insert: vi
        .fn()
        .mockReturnValueOnce(createQuery([{ id: 'workshop-1' }]))
        .mockReturnValueOnce(staffLinkInsert),
      update: vi.fn(),
    }
    mocks.db.transaction.mockImplementationOnce(async (callback) =>
      callback(tx),
    )

    await expect(
      saveWorkshop(adminContext, {
        description: 'Oficina pratica',
        endDate: '2026-09-02',
        imageUrl: undefined,
        isPublic: true,
        name: 'React',
        showParticipants: false,
        staffIds: ['staff-1', 'staff-2'],
        startDate: '2026-09-01',
        status: 'planned',
        theme: 'Frontend',
        vacancies: undefined,
        workload: 12,
      }),
    ).resolves.toEqual({ ok: true })

    expect(tx.insert).toHaveBeenCalledTimes(2)
    expect(staffLinkInsert.values).toHaveBeenCalledWith([
      {
        staffId: 'staff-1',
        workshopId: 'workshop-1',
      },
      {
        staffId: 'staff-2',
        workshopId: 'workshop-1',
      },
    ])
    expect(deleteQuery.where).toHaveBeenCalled()
  })

  it('rejects saving a workshop with staff outside the admin account', async () => {
    queueSelects([[{ id: 'staff-1' }]])

    await expect(
      saveWorkshop(adminContext, {
        description: 'Oficina pratica',
        endDate: '2026-09-02',
        imageUrl: undefined,
        isPublic: true,
        name: 'React',
        showParticipants: false,
        staffIds: ['staff-1', 'staff-2'],
        startDate: '2026-09-01',
        status: 'planned',
        theme: 'Frontend',
        vacancies: null,
        workload: 12,
      }),
    ).rejects.toThrow('Professor ou tutor invÃ¡lido')

    expect(mocks.setResponseStatus).toHaveBeenCalledWith(403)
    expect(mocks.db.transaction).not.toHaveBeenCalled()
  })
})
