import { createServerFn } from '@tanstack/react-start'
import { asAdminContext } from '~/lib/admin-context'
import { adminMiddleware } from '~/lib/middleware'
import { attendanceInputSchema } from './attendance.schemas'
import { saveAttendance } from './attendance.server'

export const saveAttendanceFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(attendanceInputSchema)
  .handler(async ({ context, data }) =>
    saveAttendance(asAdminContext(context), data),
  )
