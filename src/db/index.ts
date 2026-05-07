import { drizzle } from 'drizzle-orm/node-postgres'
import * as authSchema from './schema/auth.schema'
import * as digioficinasSchema from './schema/digioficinas.schema'
import * as todosSchema from './schema/todos.shema'

export function createDb() {
  return drizzle(process.env.DATABASE_URL!, {
    schema: {
      ...todosSchema,
      ...authSchema,
      ...digioficinasSchema,
    },
  })
}

export const db = createDb()
