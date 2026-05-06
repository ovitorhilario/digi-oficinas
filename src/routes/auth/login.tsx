import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from './-components/login-form'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-muted p-4">
      <LoginForm />
    </div>
  )
}
