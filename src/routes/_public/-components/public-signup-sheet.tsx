import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import type z from 'zod'
import { useAppForm } from '~/components/form'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import { publicSignupFn } from '~/features/participation/participation.functions'
import { publicSignupSchema } from '~/features/participation/participation.schemas'
import type { PublicWorkshop } from './public-workshops-grid'

type PublicSignupFormValues = z.infer<typeof publicSignupSchema>

const emptySignup: PublicSignupFormValues = {
  workshopId: '',
  name: '',
  email: '',
  phone: '',
  company: '',
}

export function PublicSignupSheet({
  workshop,
  open,
  onOpenChange,
  queryKey,
}: {
  workshop: PublicWorkshop | null
  open: boolean
  onOpenChange: (open: boolean) => void
  queryKey: readonly unknown[]
}) {
  const queryClient = useQueryClient()
  const signupMutation = useMutation({
    mutationFn: (data: PublicSignupFormValues) =>
      publicSignupFn({
        data,
      }),
    onError: ({ message }) => {
      toast.error(
        message || 'Nao foi possivel enviar sua solicitacao.',
      )
    },
    onSuccess: async () => {
      toast.success('Solicitacao enviada para analise.')
      await queryClient.invalidateQueries({ queryKey })
      form.reset({
        ...emptySignup,
        workshopId: workshop?.id ?? '',
      })
      onOpenChange(false)
    },
  })

  const form = useAppForm({
    defaultValues: {
      ...emptySignup,
      workshopId: workshop?.id ?? '',
    },
    validators: {
      onSubmit: publicSignupSchema,
    },
    onSubmit: async ({ value }) => {
      const values = {
        ...value,
        workshopId: workshop?.id ?? value.workshopId,
      }
      const result = publicSignupSchema.safeParse(values)

      if (!result.success) {
        toast.error('Revise seus dados e tente novamente.')
        return
      }

      await signupMutation.mutateAsync(result.data)
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset({
      ...emptySignup,
      workshopId: workshop?.id ?? '',
    })
  }, [open, workshop?.id])

  function resetAndClose() {
    form.reset(emptySignup)
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetAndClose()
          return
        }

        onOpenChange(true)
      }}
    >
      <SheetContent className="overflow-y-auto sm:max-w-lg!">
        <SheetHeader>
          <SheetTitle>Solicitar inscricao</SheetTitle>
          <SheetDescription>
            Preencha seus dados para a oficina selecionada.
          </SheetDescription>
        </SheetHeader>
        <form
          className="px-6 pb-6"
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.AppField name="company">
              {(field) => (
                <label className="hidden">
                  Empresa
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={field.state.value ?? ''}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                  />
                </label>
              )}
            </form.AppField>
            <form.AppField name="workshopId">
              {(field) => (
                <DisabledWorkshopField
                  label="Oficina"
                  value={workshop?.name ?? ''}
                  errors={field.state.meta.errors}
                  isInvalid={
                    field.state.meta.isTouched &&
                    !field.state.meta.isValid
                  }
                />
              )}
            </form.AppField>
            <form.AppField name="name">
              {(field) => <field.TextField label="Nome completo" />}
            </form.AppField>
            <form.AppField name="email">
              {(field) => (
                <field.TextField label="E-mail" type="email" />
              )}
            </form.AppField>
            <form.AppField name="phone">
              {(field) => (
                <field.TextField label="Telefone (opcional)" />
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
                  <Button
                    type="submit"
                    disabled={
                      !canSubmit ||
                      isSubmitting ||
                      signupMutation.isPending ||
                      !workshop
                    }
                  >
                    <Send />
                    {isSubmitting || signupMutation.isPending
                      ? 'Enviando...'
                      : 'Enviar solicitacao'}
                  </Button>
                </Field>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function DisabledWorkshopField({
  label,
  value,
  isInvalid,
  errors,
}: {
  label: string
  value: string
  isInvalid: boolean
  errors: Array<{ message?: string } | undefined>
}) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel>{label}</FieldLabel>
      <Input
        value={value}
        disabled
        aria-invalid={isInvalid}
        className="disabled:cursor-not-allowed disabled:opacity-70"
      />
      {isInvalid ? <FieldError errors={errors} /> : null}
    </Field>
  )
}
