import { and, eq } from 'drizzle-orm'
import { db } from '~/db'
import { students } from '~/db/schema/digioficinas.schema'
import type { AdminContext } from '~/lib/admin-context'
import { getAdminId } from '~/lib/admin-context'
import { fail } from '~/lib/server-response'
import type { IdInput } from '~/lib/validation'
import type { StudentInput } from './student.schemas'

export async function requireStudentForAdmin(
  studentId: string,
  adminId: string,
) {
  const [student] = await db
    .select()
    .from(students)
    .where(
      and(eq(students.id, studentId), eq(students.adminId, adminId)),
    )
    .limit(1)

  if (!student) {
    fail(404, 'Aluno nÃ£o encontrado.')
  }

  return student
}

export async function saveStudent(
  context: AdminContext,
  data: StudentInput,
) {
  const adminId = getAdminId(context)
  const values = {
    adminId,
    name: data.name,
    email: data.email ?? null,
    phone: data.phone ?? null,
    document: data.document ?? null,
    birthDate: data.birthDate ?? null,
  }

  const [student] = data.id
    ? await db
        .update(students)
        .set(values)
        .where(
          and(
            eq(students.id, data.id),
            eq(students.adminId, adminId),
          ),
        )
        .returning({ id: students.id })
    : await db
        .insert(students)
        .values(values)
        .returning({ id: students.id })

  if (!student) {
    fail(404, 'Aluno nÃ£o encontrado.')
  }

  return { ok: true }
}

export async function deleteStudent(
  context: AdminContext,
  data: IdInput,
) {
  const [deleted] = await db
    .delete(students)
    .where(
      and(
        eq(students.id, data.id),
        eq(students.adminId, getAdminId(context)),
      ),
    )
    .returning({ id: students.id })

  if (!deleted) {
    fail(404, 'Aluno nÃ£o encontrado.')
  }

  return { ok: true }
}
