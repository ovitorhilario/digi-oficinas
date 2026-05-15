import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/')({
  component: undefined,
  beforeLoad: () => {
    throw redirect({ to: '/auth/login' })
  },
})
