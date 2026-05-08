import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQuery } from '~/test/drizzle-test-query'

const mocks = vi.hoisted(() => {
  const db = {
    delete: vi.fn(),
    insert: vi.fn(),
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
import { deleteStaff, saveStaff } from './staff.server'

const adminContext: AdminContext = {
  admin: {
    id: 'admin-1',
  },
}

describe('staff server functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates staff with nullable optional fields', async () => {
    const insertQuery = createQuery([{ id: 'staff-1' }])
    mocks.db.insert.mockReturnValueOnce(insertQuery)

    await expect(
      saveStaff(adminContext, {
        email: undefined,
        name: 'Ada Lovelace',
        phone: undefined,
        type: 'teacher',
      }),
    ).resolves.toEqual({ ok: true })

    expect(insertQuery.values).toHaveBeenCalledWith({
      adminId: 'admin-1',
      email: null,
      name: 'Ada Lovelace',
      phone: null,
      type: 'teacher',
    })
  })

  it('reports missing staff on delete', async () => {
    mocks.db.delete.mockReturnValueOnce(createQuery([]))

    await expect(
      deleteStaff(adminContext, { id: 'staff-1' }),
    ).rejects.toThrow('Professor ou tutor nÃ£o encontrado.')

    expect(mocks.setResponseStatus).toHaveBeenCalledWith(404)
  })
})
