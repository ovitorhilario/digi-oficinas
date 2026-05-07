import { and, count, desc, eq, inArray } from 'drizzle-orm'
import { db } from '~/db'
import {
  staff,
  students,
  workshopParticipants,
  workshopStaff,
  workshops,
} from '~/db/schema/digioficinas.schema'
import type { AdminContext } from '~/lib/admin-context'
import { getAdminId } from '~/lib/admin-context'
import { fail, serializeDate } from '~/lib/server-response'
import type { IdInput } from '~/lib/validation'
import { activeParticipantStatuses } from '../participation/participation.schemas'
import { assertStaffBelongsToAdmin } from '../staff/staff.server'
import type { WorkshopInput } from './workshop.schemas'

export async function requireWorkshopForAdmin(
  workshopId: string,
  adminId: string,
) {
  const [workshop] = await db
    .select()
    .from(workshops)
    .where(
      and(
        eq(workshops.id, workshopId),
        eq(workshops.adminId, adminId),
      ),
    )
    .limit(1)

  if (!workshop) {
    fail(404, 'Oficina nÃ£o encontrada.')
  }

  return workshop
}

export async function assertVacancyAvailable(
  workshopId: string,
  vacancies: number | null,
) {
  if (!vacancies) {
    return
  }

  const [activeCount] = await db
    .select({ total: count() })
    .from(workshopParticipants)
    .where(
      and(
        eq(workshopParticipants.workshopId, workshopId),
        inArray(
          workshopParticipants.status,
          activeParticipantStatuses,
        ),
      ),
    )

  if ((activeCount?.total ?? 0) >= vacancies) {
    fail(400, 'A oficina nÃ£o possui vagas disponÃ­veis.')
  }
}

export async function saveWorkshop(
  context: AdminContext,
  data: WorkshopInput,
) {
  const adminId = getAdminId(context)
  await assertStaffBelongsToAdmin(data.staffIds, adminId)

  await db.transaction(async (tx) => {
    const values = {
      adminId,
      name: data.name,
      description: data.description,
      theme: data.theme,
      imageUrl: data.imageUrl ?? null,
      startDate: data.startDate,
      endDate: data.endDate,
      workload: data.workload,
      status: data.status,
      vacancies: data.vacancies ?? null,
      isPublic: data.isPublic,
      showParticipants: data.showParticipants,
    }

    const [workshop] = data.id
      ? await tx
          .update(workshops)
          .set(values)
          .where(
            and(
              eq(workshops.id, data.id),
              eq(workshops.adminId, adminId),
            ),
          )
          .returning({ id: workshops.id })
      : await tx
          .insert(workshops)
          .values(values)
          .returning({ id: workshops.id })

    if (!workshop) {
      fail(404, 'Oficina nÃ£o encontrada.')
    }

    await tx
      .delete(workshopStaff)
      .where(eq(workshopStaff.workshopId, workshop.id))

    if (data.staffIds.length) {
      await tx.insert(workshopStaff).values(
        data.staffIds.map((staffId) => ({
          workshopId: workshop.id,
          staffId,
        })),
      )
    }
  })

  return { ok: true }
}

export async function deleteWorkshop(
  context: AdminContext,
  data: IdInput,
) {
  const [deleted] = await db
    .delete(workshops)
    .where(
      and(
        eq(workshops.id, data.id),
        eq(workshops.adminId, getAdminId(context)),
      ),
    )
    .returning({ id: workshops.id })

  if (!deleted) {
    fail(404, 'Oficina nÃ£o encontrada.')
  }

  return { ok: true }
}

export async function getPublicWorkshops() {
  const rows = await db
    .select()
    .from(workshops)
    .where(eq(workshops.isPublic, true))
    .orderBy(desc(workshops.createdAt))

  const publicRows = rows.filter(
    (workshop) =>
      workshop.status !== 'cancelled' &&
      workshop.status !== 'finished',
  )
  const workshopIds = publicRows.map((workshop) => workshop.id)

  const [staffRows, participantRows] = workshopIds.length
    ? await Promise.all([
        db
          .select({
            workshopId: workshopStaff.workshopId,
            name: staff.name,
            type: staff.type,
          })
          .from(workshopStaff)
          .innerJoin(staff, eq(staff.id, workshopStaff.staffId))
          .where(inArray(workshopStaff.workshopId, workshopIds)),
        db
          .select({
            workshopId: workshopParticipants.workshopId,
            name: students.name,
            status: workshopParticipants.status,
          })
          .from(workshopParticipants)
          .innerJoin(
            students,
            eq(students.id, workshopParticipants.studentId),
          )
          .where(
            and(
              inArray(workshopParticipants.workshopId, workshopIds),
              inArray(
                workshopParticipants.status,
                activeParticipantStatuses,
              ),
            ),
          ),
      ])
    : [[], []]

  return publicRows.map((workshop) => ({
    ...workshop,
    startDate: serializeDate(workshop.startDate),
    endDate: serializeDate(workshop.endDate),
    createdAt: serializeDate(workshop.createdAt),
    updatedAt: serializeDate(workshop.updatedAt),
    staff: staffRows.filter(
      (person) => person.workshopId === workshop.id,
    ),
    participants: workshop.showParticipants
      ? participantRows.filter(
          (participant) => participant.workshopId === workshop.id,
        )
      : [],
  }))
}
