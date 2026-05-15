import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '~/db'
import {
  certificates,
  workshopParticipants,
} from '~/db/schema/digioficinas.schema'
import type { AdminContext } from '~/lib/admin-context'
import { getAdminId } from '~/lib/admin-context'
import { fail } from '~/lib/server-response'
import { activeParticipantStatuses } from '../participation/participation.schemas'
import { requireStudentForAdmin } from '../student/student.server'
import { requireWorkshopForAdmin } from '../workshop/workshop.server'
import type { CertificateInput } from './certificate.schemas'

export async function issueCertificate(
  context: AdminContext,
  data: CertificateInput,
) {
  const adminId = getAdminId(context)
  await requireWorkshopForAdmin(data.workshopId, adminId)
  await requireStudentForAdmin(data.studentId, adminId)

  const [participant] = await db
    .select({ status: workshopParticipants.status })
    .from(workshopParticipants)
    .where(
      and(
        eq(workshopParticipants.workshopId, data.workshopId),
        eq(workshopParticipants.studentId, data.studentId),
      ),
    )
    .limit(1)

  if (
    !participant ||
    !activeParticipantStatuses.some(
      (status) => status === participant.status,
    )
  ) {
    fail(
      400,
      'Certificado permitido apenas para participantes aprovados.',
    )
  }

  const code = `DIGI-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`

  await db.insert(certificates).values({
    workshopId: data.workshopId,
    studentId: data.studentId,
    certificateCode: code,
  })

  return { ok: true, code }
}
