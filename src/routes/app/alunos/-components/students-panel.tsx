import { Plus, UserRoundPlus } from 'lucide-react'
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
import { enrollStudentFn } from '~/features/participation/participation.functions'
import { manualEnrollmentSchema } from '~/features/participation/participation.schemas'
import {
  deleteStudentFn,
  saveStudentFn,
} from '~/features/student/student.functions'
import { studentInputSchema } from '~/features/student/student.schemas'
import { SimpleListCard } from '../../-components/admin-list'
import { SubmitStateButton } from '../../-components/form-controls'
import {
  type DashboardData,
  useRefreshMutation,
} from '../../-lib/dashboard'

type Student = DashboardData['students'][number]
type StudentFormValues = z.infer<typeof studentInputSchema>
type EnrollmentFormValues = z.input<typeof manualEnrollmentSchema>

const emptyStudent: StudentFormValues = {
  name: '',
  email: '',
  phone: '',
  document: '',
  birthDate: '',
}

export function StudentsPanel({ data }: { data: DashboardData }) {
  const [editing, setEditing] = useState<StudentFormValues | null>(
    null,
  )
  const [activeSheet, setActiveSheet] = useState<
    'student' | 'enrollment' | null
  >(null)

  const saveMutation = useRefreshMutation(
    (values: StudentFormValues) =>
      saveStudentFn({
        data: {
          name: values.name,
          email: values.email ?? undefined,
          phone: values.phone ?? undefined,
          document: values.document ?? undefined,
          birthDate: values.birthDate ?? undefined,
          id: values.id ?? undefined,
        },
      }),
  )
  const deleteMutation = useRefreshMutation((id: string) =>
    deleteStudentFn({ data: { id } }),
  )
  const enrollMutation = useRefreshMutation(
    (values: EnrollmentFormValues) =>
      enrollStudentFn({ data: values }),
  )

  const studentForm = useAppForm({
    defaultValues: editing ?? emptyStudent,
    validators: {
      onSubmit: studentInputSchema,
    },
    onSubmit: async ({ value }) => {
      const result = studentInputSchema.safeParse(value)

      if (!result.success) {
        toast.error('Revise os dados do aluno e tente novamente.')
        return
      }

      await saveMutation.mutateAsync(result.data)
      resetStudentForm()
    },
  })

  const enrollmentForm = useAppForm({
    defaultValues: {
      workshopId: data.workshops[0]?.id ?? '',
      studentId: data.students[0]?.id ?? '',
      status: 'participant',
    } as EnrollmentFormValues,
    validators: {
      onSubmit: manualEnrollmentSchema,
    },
    onSubmit: async ({ value }) => {
      const result = manualEnrollmentSchema.safeParse(value)

      if (!result.success) {
        toast.error('Selecione uma oficina e um aluno.')
        return
      }

      await enrollMutation.mutateAsync(result.data)
      setActiveSheet(null)
    },
  })

  function resetStudentForm() {
    setEditing(null)
    studentForm.reset(emptyStudent)
    setActiveSheet(null)
  }

  function openStudentCreate() {
    setEditing(null)
    studentForm.reset(emptyStudent)
    setActiveSheet('student')
  }

  function openEnrollmentSheet() {
    enrollmentForm.reset({
      workshopId: data.workshops[0]?.id ?? '',
      studentId: data.students[0]?.id ?? '',
      status: 'participant',
    } as EnrollmentFormValues)
    setActiveSheet('enrollment')
  }

  function edit(student: Student) {
    const values = {
      id: student.id,
      name: student.name,
      email: student.email ?? '',
      phone: student.phone ?? '',
      document: student.document ?? '',
      birthDate: student.birthDate ?? '',
    } satisfies StudentFormValues

    setEditing(values)
    studentForm.reset(values)
    setActiveSheet('student')
  }

  return (
    <>
      <SimpleListCard
        title="Alunos"
        items={data.students}
        headerAction={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={openEnrollmentSheet}
            >
              <UserRoundPlus />
              Vincular aluno
            </Button>
            <Button type="button" onClick={openStudentCreate}>
              <Plus />
              Novo aluno
            </Button>
          </div>
        }
        emptyTitle="Nenhum aluno cadastrado"
        emptyDescription="Cadastre alunos para organizar turmas, matriculas e presencas em um unico lugar."
        emptyIcon={UserRoundPlus}
        renderItem={(student) => (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <strong className="text-base">{student.name}</strong>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Aluno
              </span>
            </div>
            <p className="text-muted-foreground">
              {student.email ?? 'Sem e-mail informado'}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border/70 px-2.5 py-1">
                {student.phone ?? 'Sem telefone'}
              </span>
              <span className="rounded-full border border-border/70 px-2.5 py-1">
                {student.document ?? 'Sem documento'}
              </span>
              <span className="rounded-full border border-border/70 px-2.5 py-1">
                {student.birthDate ?? 'Nascimento nao informado'}
              </span>
            </div>
          </>
        )}
        onEdit={edit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <Sheet
        open={activeSheet === 'student'}
        onOpenChange={(open) => {
          if (!open) {
            resetStudentForm()
          }
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-xl!">
          <SheetHeader>
            <SheetTitle>
              {editing?.id ? 'Editar aluno' : 'Novo aluno'}
            </SheetTitle>
            <SheetDescription>
              Atualize os dados cadastrais do aluno.
            </SheetDescription>
          </SheetHeader>
          <form
            className="px-6 pb-6"
            onSubmit={(event) => {
              event.preventDefault()
              studentForm.handleSubmit()
            }}
          >
            <FieldGroup>
              <studentForm.AppField name="name">
                {(field) => <field.TextField label="Nome" />}
              </studentForm.AppField>
              <studentForm.AppField name="email">
                {(field) => (
                  <field.TextField label="E-mail" type="email" />
                )}
              </studentForm.AppField>
              <studentForm.AppField name="phone">
                {(field) => <field.TextField label="Telefone" />}
              </studentForm.AppField>
              <studentForm.AppField name="document">
                {(field) => <field.TextField label="Documento" />}
              </studentForm.AppField>
              <studentForm.AppField name="birthDate">
                {(field) => (
                  <field.TextField label="Nascimento" type="date" />
                )}
              </studentForm.AppField>
              <studentForm.Subscribe
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
              </studentForm.Subscribe>
            </FieldGroup>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={activeSheet === 'enrollment'}
        onOpenChange={(open) => {
          if (!open) {
            setActiveSheet(null)
          }
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-xl!">
          <SheetHeader>
            <SheetTitle>Vincular aluno</SheetTitle>
            <SheetDescription>
              Relacione um aluno a uma oficina existente.
            </SheetDescription>
          </SheetHeader>
          <form
            className="px-6 pb-6"
            onSubmit={(event) => {
              event.preventDefault()
              enrollmentForm.handleSubmit()
            }}
          >
            <FieldGroup>
              <enrollmentForm.AppField name="workshopId">
                {(field) => (
                  <field.SelectField
                    label="Oficina"
                    placeholder="Selecione"
                    items={data.workshops.map((workshop) => ({
                      value: workshop.id,
                      label: workshop.name,
                    }))}
                  />
                )}
              </enrollmentForm.AppField>
              <enrollmentForm.AppField name="studentId">
                {(field) => (
                  <field.SelectField
                    label="Aluno"
                    placeholder="Selecione"
                    items={data.students.map((student) => ({
                      value: student.id,
                      label: student.name,
                    }))}
                  />
                )}
              </enrollmentForm.AppField>
              <enrollmentForm.Subscribe
                selector={(state) => [
                  state.canSubmit,
                  state.isSubmitting,
                ]}
              >
                {([canSubmit, isSubmitting]) => (
                  <SubmitStateButton
                    canSubmit={canSubmit}
                    isSubmitting={isSubmitting}
                    label="Vincular"
                    busyLabel="Vinculando..."
                    icon={<UserRoundPlus />}
                  />
                )}
              </enrollmentForm.Subscribe>
            </FieldGroup>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
