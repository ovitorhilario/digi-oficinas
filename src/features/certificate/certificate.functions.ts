import { createServerFn } from '@tanstack/react-start'
import { asAdminContext } from '~/lib/admin-context'
import { adminMiddleware } from '~/lib/middleware'
import { certificateInputSchema } from './certificate.schemas'
import { issueCertificate } from './certificate.server'

export const issueCertificateFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(certificateInputSchema)
  .handler(async ({ context, data }) =>
    issueCertificate(asAdminContext(context), data),
  )
