import { createServerFn } from '@tanstack/react-start'
import { asAdminContext } from '~/lib/admin-context'
import { adminMiddleware } from '~/lib/middleware'
import { idSchema } from '~/lib/validation'
import { studentInputSchema } from './student.schemas'
import { deleteStudent, saveStudent } from './student.server'

export const saveStudentFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(studentInputSchema)
  .handler(async ({ context, data }) =>
    saveStudent(asAdminContext(context), data),
  )

export const deleteStudentFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(idSchema)
  .handler(async ({ context, data }) =>
    deleteStudent(asAdminContext(context), data),
  )
