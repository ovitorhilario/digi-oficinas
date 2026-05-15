import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import z from 'zod'
import { useAppForm } from '~/components/form'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
} from '~/components/ui/field'
import { getSessionOptions } from '~/features/auth/auth.queries'
import { authClient } from '~/lib/auth-client'
import { cn } from '~/lib/utils'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, {
    error: 'The password must be at least 8 characters long',
  }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const redirectURL = '/app' as const

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        throw result.error
      }

      return result
    },
    onError: () => {
      toast.error(
        'Unable to sign in. Check your credentials and try again.',
      )
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: getSessionOptions().queryKey,
      })
      navigate({ to: redirectURL })
    },
  })

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      const result = loginSchema.safeParse(value)

      if (!result.success) {
        toast.error(
          'Please fix the errors in the form and try again.',
        )
        return
      }

      await loginMutation.mutateAsync(result.data)
    },
  })

  return (
    <div className={cn('w-full max-w-sm', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    label="Email"
                    type="email"
                    placeholder="m@example.com"
                  />
                )}
              </form.AppField>
              <form.AppField name="password">
                {(field) => (
                  <field.SecurityTextField label="Password" />
                )}
              </form.AppField>

              <form.Subscribe
                selector={(state) => [
                  state.canSubmit,
                  state.isSubmitting,
                ]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Field>
                    <Button type="submit" disabled={!canSubmit}>
                      {isSubmitting ? '...' : 'Submit'}
                    </Button>
                    <FieldDescription className="text-center">
                      Acesso exclusivo para administradores
                      cadastrados.
                    </FieldDescription>
                  </Field>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
