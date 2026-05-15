import { createServerFn } from '@tanstack/react-start'
import { asAdminContext } from '~/lib/admin-context'
import { adminMiddleware } from '~/lib/middleware'
import { idSchema } from '~/lib/validation'
import { staffInputSchema } from './staff.schemas'
import { deleteStaff, saveStaff } from './staff.server'

export const saveStaffFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(staffInputSchema)
  .handler(async ({ context, data }) =>
    saveStaff(asAdminContext(context), data),
  )

export const deleteStaffFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(idSchema)
  .handler(async ({ context, data }) =>
    deleteStaff(asAdminContext(context), data),
  )
