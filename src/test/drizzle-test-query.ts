import { vi } from 'vitest'

export type QueryResult = unknown[]

export function createQuery(result: QueryResult) {
  const query = {
    from: vi.fn(() => query),
    innerJoin: vi.fn(() => query),
    limit: vi.fn(() => query),
    onConflictDoUpdate: vi.fn(() => Promise.resolve(result)),
    orderBy: vi.fn(() => query),
    returning: vi.fn(() => Promise.resolve(result)),
    set: vi.fn(() => query),
    // biome-ignore lint/suspicious/noThenProperty: Drizzle queries are awaitable, so this test double mirrors that contract.
    then: (
      resolve: (value: QueryResult) => unknown,
      reject: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(resolve, reject),
    values: vi.fn(() => query),
    where: vi.fn(() => query),
  }

  return query
}
