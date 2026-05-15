---
name: tanstack-form-zod
description: Practical guide to implement forms in this project's standard using TanStack Form + Zod + React Query + TanStack Router, following the login and signup examples.
---

# TanStack Form + Zod (Project Standard)

Use this skill whenever you need to create or refactor forms in this project.

## When To Use

Use it when the user asks to:

- Create a new form (auth, profile, organization, etc.)
- Apply validation with Zod
- Integrate submit with React Query (mutation)
- Display field errors and submit state
- Follow the visual and structural standard of existing forms

Reference files in the project:

- `src/routes/_ghest/-components/login-form.tsx`
- `src/routes/_ghest/-components/signup-form.tsx`
- `src/components/form/index.tsx`
- `src/components/form/text-field.tsx`
- `src/components/form/security-field.tsx`

## Required Stack And Conventions

- Validation: `zod`
- Form state: `useAppForm` from `~/components/form`
- Async submit: `useMutation` from `@tanstack/react-query`
- Post-success navigation: `useNavigate` from `@tanstack/react-router`
- Global error feedback: `toast.error` (`sonner`)
- Form layout: components from `~/components/ui/field`

Code conventions:

- Always type schema with `z.infer<typeof schema>`
- Complete `defaultValues` for all fields
- `validators.onSubmit` pointing to the schema
- `onSubmit` using `safeParse` before mutation
- Submit button controlled by `form.Subscribe` (`canSubmit`, `isSubmitting`)
- Fields using `form.AppField` + `field.TextField` / `field.SecurityTextField` components

## Standard Recipe (Step By Step)

1. Define a Zod schema with clear error messages.
2. Extract the type with `z.infer`.
3. Create a mutation with `useMutation`.
4. In `onError`, show `toast.error`.
5. In `onSuccess`, invalidate/remove user query cache and navigate.
6. Create `useAppForm` with `defaultValues`, `validators.onSubmit`, and `onSubmit`.
7. In `<form>` submit, use `e.preventDefault()` + `form.handleSubmit()`.
8. Render fields with `form.AppField`.
9. Render submit with `form.Subscribe`.

## Base Template

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import z from 'zod'
import { useAppForm } from '~/components/form'
import { Button } from '~/components/ui/button'
import { Field, FieldDescription, FieldGroup } from '~/components/ui/field'
import { cn } from '~/lib/utils'

const schema = z.object({
  email: z.email(),
  password: z.string().min(8, { error: 'The password must be at least 8 characters long' }),
})

type FormValues = z.infer<typeof schema>

export function ExampleForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Call your API function here
      return data
    },
    onError: ({ message }) => {
      toast.error(message || 'An error occurred while submitting the form.')
    },
    onSuccess: () => {
      // Adjust to the correct query key(s)
      queryClient.removeQueries()
      navigate({ to: '/' })
    },
  })

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      const result = schema.safeParse(value)

      if (!result.success) {
        toast.error('Please fix the errors in the form and try again.')
        return
      }

      await mutation.mutateAsync(result.data)
    },
  })

  return (
    <div className={cn('w-full max-w-sm', className)} {...props}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.AppField name="email">
            {(field) => (
              <field.TextField label="Email" type="email" placeholder="m@example.com" />
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

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Field>
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? '...' : 'Submit'}
                </Button>
                <FieldDescription className="text-center">
                  Adjust this text for your use case
                </FieldDescription>
              </Field>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>
    </div>
  )
}
```

## Cross-Field Validation Example (Password Confirmation)

When there are dependent fields (for example, `password` and `confirmPassword`), use `refine`:

```ts
const signupSchema = z
  .object({
    password: z.string().min(8, { error: 'The password must be at least 8 characters long' }),
    confirmPassword: z.string().min(1, { error: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword'],
  })
```

## Review Checklist

Before finishing, validate:

- `schema`, `FormValues`, and `defaultValues` are consistent
- `validators.onSubmit` uses the correct schema
- `safeParse` blocks invalid submits
- Error messages are user-friendly
- `mutation.isPending` and/or `isSubmitting` control the UI
- Navigation and cache (`queryClient`) are correct on success
- Labels, placeholders, and links are correct for the route

## Common Mistakes

- Forgetting `e.preventDefault()` in `<form>`
- Not using `safeParse` before calling mutation
- A field in schema without a matching key in `defaultValues`
- Field name in `form.AppField` different from schema
- Not showing submit state in the button

## How To Respond When This Skill Is Triggered

1. Reuse the structure from `login-form.tsx` and `signup-form.tsx`.
2. Keep the same visual components (`FieldGroup`, `Field`, `Button`, `field.*Field`).
3. Deliver ready-to-use code in the correct route/component file.
4. If possible, run typecheck/lint to validate.
