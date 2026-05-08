import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type z from 'zod'
import { useAppForm } from '~/components/form'
import { Button } from '~/components/ui/button'
import { FieldGroup } from '~/components/ui/field'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import {
  deleteStaffFn,
  saveStaffFn,
} from '~/features/staff/staff.functions'
import {
  staffInputSchema,
  staffTypes,
} from '~/features/staff/staff.schemas'
import { SimpleListCard } from '../../-components/admin-list'
import { SubmitStateButton } from '../../-components/form-controls'
import {
  type DashboardData,
  useRefreshMutation,
} from '../../-lib/dashboard'

type Staff = DashboardData['staff'][number]
type StaffFormValues = z.infer<typeof staffInputSchema>

const emptyStaff: StaffFormValues = {
  name: '',
  email: '',
  phone: '',
  type: 'teacher',
}

const typeItems = staffTypes.map((type) => ({
  value: type,
  label: type === 'teacher' ? 'Professor' : 'Tutor',
}))

export function StaffPanel({ data }: { data: DashboardData }) {
  const [editing, setEditing] = useState<StaffFormValues | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const saveMutation = useRefreshMutation((values: StaffFormValues) =>
    saveStaffFn({ data: values }),
  )
  const deleteMutation = useRefreshMutation((id: string) =>
    deleteStaffFn({ data: { id } }),
  )

  const form = useAppForm({
    defaultValues: editing ?? emptyStaff,
    validators: {
      onSubmit: staffInputSchema,
    },
    onSubmit: async ({ value }) => {
      const result = staffInputSchema.safeParse(value)

      if (!result.success) {
        toast.error('Revise os dados da equipe e tente novamente.')
        return
      }

      await saveMutation.mutateAsync(result.data)
      resetForm()
    },
  })

  function resetForm() {
    setEditing(null)
    form.reset(emptyStaff)
    setSheetOpen(false)
  }

  function create() {
    setEditing(null)
    form.reset(emptyStaff)
    setSheetOpen(true)
  }

  function edit(person: Staff) {
    const values = {
      id: person.id,
      name: person.name,
      email: person.email ?? '',
      phone: person.phone ?? '',
      type: person.type,
    } satisfies StaffFormValues

    setEditing(values)
    form.reset(values)
    setSheetOpen(true)
  }

  return (
    <>
      <SimpleListCard
        title="Professores e tutores"
        items={data.staff}
        headerAction={
          <Button type="button" onClick={create}>
            <Plus />
            Nova pessoa
          </Button>
        }
        emptyTitle="Nenhuma pessoa na equipe"
        emptyDescription="Adicione professores e tutores para vincular responsaveis as oficinas."
        renderItem={(person) => (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <strong className="text-base">{person.name}</strong>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {person.type === 'teacher' ? 'Professor' : 'Tutor'}
              </span>
            </div>
            <p className="text-muted-foreground">
              {person.email ?? 'Sem e-mail informado'}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/70 px-2.5 py-1">
                {person.phone ?? 'Sem telefone'}
              </span>
              <span className="rounded-full border border-border/70 px-2.5 py-1">
                {person.type === 'teacher'
                  ? 'Responsavel por aulas'
                  : 'Apoio e acompanhamento'}
              </span>
            </div>
          </>
        )}
        onEdit={edit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm()
            return
          }

          setSheetOpen(true)
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-xl!">
          <SheetHeader>
            <SheetTitle>
              {editing?.id ? 'Editar pessoa' : 'Nova pessoa'}
            </SheetTitle>
            <SheetDescription>
              Atualize os dados de professores e tutores.
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
              <form.AppField name="name">
                {(field) => <field.TextField label="Nome" />}
              </form.AppField>
              <form.AppField name="email">
                {(field) => (
                  <field.TextField label="E-mail" type="email" />
                )}
              </form.AppField>
              <form.AppField name="phone">
                {(field) => <field.TextField label="Telefone" />}
              </form.AppField>
              <form.AppField name="type">
                {(field) => (
                  <field.SelectField label="Tipo" items={typeItems} />
                )}
              </form.AppField>
              <form.Subscribe
                selector={(state) => [
                  state.canSubmit,
                  state.isSubmitting,
                ]}
              >
                {([canSubmit, isSubmitting]) => (
                  <SubmitStateButton
                    canSubmit={canSubmit}
                    isSubmitting={isSubmitting}
                  />
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
