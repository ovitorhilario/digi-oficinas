import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQuery } from '~/test/drizzle-test-query'

const mocks = vi.hoisted(() => {
  const db = {
    delete: vi.fn(),
    insert: vi.fn(),
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
import { deleteStudent, saveStudent } from './student.server'

const adminContext: AdminContext = {
  admin: {
    id: 'admin-1',
  },
}

describe('student server functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates students with nullable optional fields', async () => {
    const insertQuery = createQuery([{ id: 'student-1' }])
    mocks.db.insert.mockReturnValueOnce(insertQuery)

    await expect(
      saveStudent(adminContext, {
        birthDate: undefined,
        document: undefined,
        email: undefined,
        name: 'Grace Hopper',
        phone: undefined,
      }),
    ).resolves.toEqual({ ok: true })

    expect(insertQuery.values).toHaveBeenCalledWith({
      adminId: 'admin-1',
      birthDate: null,
      document: null,
      email: null,
      name: 'Grace Hopper',
      phone: null,
    })
  })

  it('reports missing students on delete', async () => {
    mocks.db.delete.mockReturnValueOnce(createQuery([]))

    await expect(
      deleteStudent(adminContext, { id: 'student-1' }),
    ).rejects.toThrow('Aluno nÃ£o encontrado.')

    expect(mocks.setResponseStatus).toHaveBeenCalledWith(404)
  })
})
