import { createServerFn } from '@tanstack/react-start'
import { asAdminContext } from '~/lib/admin-context'
import { adminMiddleware } from '~/lib/middleware'
import { getAdminDashboard } from './dashboard.server'

export const getAdminDashboardFn = createServerFn({ method: 'GET' })
  .middleware([adminMiddleware])
  .handler(async ({ context }) =>
    getAdminDashboard(asAdminContext(context)),
  )
