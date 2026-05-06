import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
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
import { authClient } from '~/lib/auth-client'
import { cn } from '~/lib/utils'

const signupSchema = z
  .object({
    name: z.string().min(1, { error: 'Name is required' }).max(100, {
      error: 'Name must be at most 100 characters long',
    }),
    email: z.email(),
    password: z.string().min(8, {
      error: 'The password must be at least 8 characters long',
    }),
    confirmPassword: z
      .string()
      .min(1, { error: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const redirectURL = '/app' as const

  const signUpMutation = useMutation({
    mutationFn: async (data: SignupFormValues) => {
      const result = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: redirectURL,
      })

      if (result.error) {
        throw result.error
      }

      return result
    },
    onError: () => {
      toast.error(
        'Unable to create your account right now. Please try again.',
      )
    },
    onSuccess: () => {
      toast.success(
        'Account created successfully! Please check your email to verify your account.',
      )
    },
  })

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      const result = signupSchema.safeParse(value)

      if (!result.success) {
        toast.error(
          'Please fix the errors in the form and try again.',
        )
        return
      }

      await signUpMutation.mutateAsync(result.data)
    },
  })

  return (
    <div className={cn('w-full max-w-sm', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Create your account
          </CardTitle>
          <CardDescription>
            Sign up with your Google account
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
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Name"
                    placeholder="John Doe"
                  />
                )}
              </form.AppField>
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
                  <field.SecurityTextField
                    label="Password"
                    description="Must be at least 8 characters."
                  />
                )}
              </form.AppField>
              <form.AppField name="confirmPassword">
                {(field) => (
                  <field.SecurityTextField label="Confirm password" />
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
                      Already have an account?{' '}
                      <Link to="/auth/login">Login</Link>
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
