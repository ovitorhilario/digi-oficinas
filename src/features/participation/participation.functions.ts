import { createServerFn } from '@tanstack/react-start'
import { asAdminContext } from '~/lib/admin-context'
import { adminMiddleware } from '~/lib/middleware'
import {
  manualEnrollmentSchema,
  participationDecisionSchema,
  publicSignupSchema,
} from './participation.schemas'
import {
  decideParticipation,
  enrollStudent,
  publicSignup,
} from './participation.server'

export const enrollStudentFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(manualEnrollmentSchema)
  .handler(async ({ context, data }) =>
    enrollStudent(asAdminContext(context), data),
  )

export const decideParticipationFn = createServerFn({
  method: 'POST',
})
  .middleware([adminMiddleware])
  .inputValidator(participationDecisionSchema)
  .handler(async ({ context, data }) =>
    decideParticipation(asAdminContext(context), data),
  )

export const publicSignupFn = createServerFn({ method: 'POST' })
  .inputValidator(publicSignupSchema)
  .handler(async ({ data }) => publicSignup(data))
