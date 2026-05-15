import { createServerFn } from '@tanstack/react-start'
import { asAdminContext } from '~/lib/admin-context'
import { adminMiddleware } from '~/lib/middleware'
import { idSchema } from '~/lib/validation'
import { workshopInputSchema } from './workshop.schemas'
import {
  deleteWorkshop,
  getPublicWorkshops,
  saveWorkshop,
} from './workshop.server'

export const saveWorkshopFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(workshopInputSchema)
  .handler(async ({ context, data }) =>
    saveWorkshop(asAdminContext(context), data),
  )

export const deleteWorkshopFn = createServerFn({ method: 'POST' })
  .middleware([adminMiddleware])
  .inputValidator(idSchema)
  .handler(async ({ context, data }) =>
    deleteWorkshop(asAdminContext(context), data),
  )

export const getPublicWorkshopsFn = createServerFn({
  method: 'GET',
}).handler(async () => getPublicWorkshops())
