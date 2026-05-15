import { db } from '~/db'
import { attendance } from '~/db/schema/digioficinas.schema'
import type { AdminContext } from '~/lib/admin-context'
import { getAdminId } from '~/lib/admin-context'
import { assertParticipantBelongsToWorkshop } from '../participation/participation.server'
import { requireStudentForAdmin } from '../student/student.server'
import { requireWorkshopForAdmin } from '../workshop/workshop.server'
import type { AttendanceInput } from './attendance.schemas'

export async function saveAttendance(
  context: AdminContext,
  data: AttendanceInput,
) {
  const adminId = getAdminId(context)
  await requireWorkshopForAdmin(data.workshopId, adminId)
  await requireStudentForAdmin(data.studentId, adminId)
  await assertParticipantBelongsToWorkshop(
    data.workshopId,
    data.studentId,
  )

  await db
    .insert(attendance)
    .values(data)
    .onConflictDoUpdate({
      target: [
        attendance.workshopId,
        attendance.studentId,
        attendance.date,
      ],
      set: { isPresent: data.isPresent },
    })

  return { ok: true }
}
