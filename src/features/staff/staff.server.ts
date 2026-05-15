import { and, eq, inArray } from 'drizzle-orm'
import { db } from '~/db'
import { staff } from '~/db/schema/digioficinas.schema'
import type { AdminContext } from '~/lib/admin-context'
import { getAdminId } from '~/lib/admin-context'
import { fail } from '~/lib/server-response'
import type { IdInput } from '~/lib/validation'
import type { StaffInput } from './staff.schemas'

export async function assertStaffBelongsToAdmin(
  staffIds: string[],
  adminId: string,
) {
  if (!staffIds.length) {
    return
  }

  const owned = await db
    .select({ id: staff.id })
    .from(staff)
    .where(
      and(eq(staff.adminId, adminId), inArray(staff.id, staffIds)),
    )

  if (owned.length !== new Set(staffIds).size) {
    fail(403, 'Professor ou tutor invÃ¡lido para este administrador.')
  }
}

export async function saveStaff(
  context: AdminContext,
  data: StaffInput,
) {
  const adminId = getAdminId(context)
  const values = {
    adminId,
    name: data.name,
    email: data.email ?? null,
    phone: data.phone ?? null,
    type: data.type,
  }

  const [person] = data.id
    ? await db
        .update(staff)
        .set(values)
        .where(and(eq(staff.id, data.id), eq(staff.adminId, adminId)))
        .returning({ id: staff.id })
    : await db
        .insert(staff)
        .values(values)
        .returning({ id: staff.id })

  if (!person) {
    fail(404, 'Professor ou tutor nÃ£o encontrado.')
  }

  return { ok: true }
}

export async function deleteStaff(
  context: AdminContext,
  data: IdInput,
) {
  const [deleted] = await db
    .delete(staff)
    .where(
      and(
        eq(staff.id, data.id),
        eq(staff.adminId, getAdminId(context)),
      ),
    )
    .returning({ id: staff.id })

  if (!deleted) {
    fail(404, 'Professor ou tutor nÃ£o encontrado.')
  }

  return { ok: true }
}
