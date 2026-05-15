import { getRequestHeader } from '@tanstack/react-start/server'
import { and, eq, ne } from 'drizzle-orm'
import { db } from '~/db'
import {
  students,
  workshopParticipants,
  workshops,
} from '~/db/schema/digioficinas.schema'
import type { AdminContext } from '~/lib/admin-context'
import { getAdminId } from '~/lib/admin-context'
import { fail } from '~/lib/server-response'
import { requireStudentForAdmin } from '../student/student.server'
import {
  assertVacancyAvailable,
  requireWorkshopForAdmin,
} from '../workshop/workshop.server'
import type {
  ManualEnrollmentInput,
  ParticipationDecisionInput,
  PublicSignupInput,
} from './participation.schemas'

const publicSignupHits = new Map<string, number[]>()

export async function assertParticipantBelongsToWorkshop(
  workshopId: string,
  studentId: string,
) {
  const [participant] = await db
    .select({ id: workshopParticipants.id })
    .from(workshopParticipants)
    .where(
      and(
        eq(workshopParticipants.workshopId, workshopId),
        eq(workshopParticipants.studentId, studentId),
      ),
    )
    .limit(1)

  if (!participant) {
    fail(400, 'Aluno nÃ£o estÃ¡ vinculado Ã  oficina.')
  }
}

export async function enrollStudent(
  context: AdminContext,
  data: ManualEnrollmentInput,
) {
  const adminId = getAdminId(context)
  const workshop = await requireWorkshopForAdmin(
    data.workshopId,
    adminId,
  )
  await requireStudentForAdmin(data.studentId, adminId)
  await assertVacancyAvailable(workshop.id, workshop.vacancies)

  await db
    .insert(workshopParticipants)
    .values({
      workshopId: data.workshopId,
      studentId: data.studentId,
      status: data.status,
    })
    .onConflictDoUpdate({
      target: [
        workshopParticipants.workshopId,
        workshopParticipants.studentId,
      ],
      set: { status: data.status },
    })

  return { ok: true }
}

export async function decideParticipation(
  context: AdminContext,
  data: ParticipationDecisionInput,
) {
  const adminId = getAdminId(context)
  const [participation] = await db
    .select({
      id: workshopParticipants.id,
      workshopId: workshopParticipants.workshopId,
      vacancies: workshops.vacancies,
    })
    .from(workshopParticipants)
    .innerJoin(
      workshops,
      eq(workshops.id, workshopParticipants.workshopId),
    )
    .where(
      and(
        eq(workshopParticipants.id, data.participationId),
        eq(workshops.adminId, adminId),
      ),
    )
    .limit(1)

  if (!participation) {
    fail(404, 'InscriÃ§Ã£o nÃ£o encontrada.')
  }

  if (data.decision === 'approve') {
    await assertVacancyAvailable(
      participation.workshopId,
      participation.vacancies,
    )
  }

  await db
    .update(workshopParticipants)
    .set({
      status:
        data.decision === 'approve' ? 'participant' : 'rejected',
    })
    .where(eq(workshopParticipants.id, participation.id))

  return { ok: true }
}

export async function publicSignup(data: PublicSignupInput) {
  const forwardedFor =
    getRequestHeader('x-forwarded-for') ?? 'unknown'
  const ip = forwardedFor.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const windowStart = now - 60_000
  const hits = (publicSignupHits.get(ip) ?? []).filter(
    (hit) => hit > windowStart,
  )

  if (hits.length >= 5) {
    fail(429, 'Muitas tentativas. Tente novamente em instantes.')
  }

  hits.push(now)
  publicSignupHits.set(ip, hits)

  const [workshop] = await db
    .select()
    .from(workshops)
    .where(
      and(
        eq(workshops.id, data.workshopId),
        eq(workshops.isPublic, true),
        ne(workshops.status, 'cancelled'),
        ne(workshops.status, 'finished'),
      ),
    )
    .limit(1)

  if (!workshop) {
    fail(404, 'Oficina nÃ£o disponÃ­vel para inscriÃ§Ã£o.')
  }

  const [student] = await db
    .insert(students)
    .values({
      adminId: workshop.adminId,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
    })
    .returning({ id: students.id })

  await db.insert(workshopParticipants).values({
    workshopId: workshop.id,
    studentId: student.id,
    status: 'pending',
    message: null,
  })

  return { ok: true }
}
