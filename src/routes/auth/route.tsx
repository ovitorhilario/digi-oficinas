import {
  createFileRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { getSessionOptions } from '~/features/auth/auth.queries'

export const Route = createFileRoute('/auth')({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      ...getSessionOptions(),
      revalidateIfStale: true,
    })

    if (user) {
      throw redirect({ to: '/app' })
    }
  },
  component: Outlet,
})
