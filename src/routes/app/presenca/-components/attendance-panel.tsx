import { CalendarCheck, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type z from 'zod'
import { useAppForm } from '~/components/form'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'
import { FieldGroup } from '~/components/ui/field'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import { saveAttendanceFn } from '~/features/attendance/attendance.functions'
import { attendanceInputSchema } from '~/features/attendance/attendance.schemas'
import {
  BooleanField,
  SubmitStateButton,
} from '../../-components/form-controls'
import {
  type DashboardData,
  useRefreshMutation,
} from '../../-lib/dashboard'

type AttendanceFormValues = z.infer<typeof attendanceInputSchema>

export function AttendancePanel({ data }: { data: DashboardData }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const saveMutation = useRefreshMutation(
    (values: AttendanceFormValues) =>
      saveAttendanceFn({ data: values }),
  )

  const form = useAppForm({
    defaultValues: {
      workshopId: data.workshops[0]?.id ?? '',
      studentId: '',
      date: new Date().toISOString().slice(0, 10),
      isPresent: true,
    } as AttendanceFormValues,
    validators: {
      onSubmit: attendanceInputSchema,
    },
    onSubmit: async ({ value }) => {
      const result = attendanceInputSchema.safeParse(value)

      if (!result.success) {
        toast.error('Selecione oficina, aluno e data.')
        return
      }

      await saveMutation.mutateAsync(result.data)
      setSheetOpen(false)
    },
  })

  function openSheet() {
    form.reset({
      workshopId: data.workshops[0]?.id ?? '',
      studentId: '',
      date: new Date().toISOString().slice(0, 10),
      isPresent: true,
    } as AttendanceFormValues)
    setSheetOpen(true)
  }

  return (
    <>
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CardTitle>Presencas registradas</CardTitle>
            <span className="inline-flex items-center rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {data.attendance.length}
            </span>
          </div>
          <Button type="button" onClick={openSheet}>
            <Plus />
            Registrar presenca
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {data.attendance.length ? (
            data.attendance.map((record) => (
              <div
                key={record.id}
                className="flex min-h-32 flex-col gap-3 rounded-lg border border-border/70 bg-background p-4 transition-colors hover:border-border hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="grid min-w-0 gap-2">
                  <strong className="text-base">
                    {record.studentName}
                  </strong>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border/70 px-2.5 py-1">
                      {record.workshopName}
                    </span>
                    <span className="rounded-full border border-border/70 px-2.5 py-1">
                      {record.date}
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex h-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                    record.isPresent
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}
                >
                  {record.isPresent ? 'Presente' : 'Ausente'}
                </span>
              </div>
            ))
          ) : (
            <Empty className="col-span-full rounded-lg shadow-none">
              <EmptyMedia variant="icon">
                <CalendarCheck />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Nenhuma presenca registrada</EmptyTitle>
                <EmptyDescription>
                  Registre a primeira chamada para acompanhar a
                  participacao dos alunos.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl!">
          <SheetHeader>
            <SheetTitle>Registrar presenca</SheetTitle>
            <SheetDescription>
              Selecione oficina, aluno, data e situacao.
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
              <form.AppField name="workshopId">
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
              </form.AppField>
              <form.Subscribe
                selector={(state) => state.values.workshopId}
              >
                {(workshopId) => {
                  const participants = data.participants.filter(
                    (participant) =>
                      participant.workshopId === workshopId &&
                      [
                        'approved',
                        'participant',
                        'completed',
                      ].includes(participant.status),
                  )

                  return (
                    <form.AppField name="studentId">
                      {(field) => (
                        <field.SelectField
                          label="Aluno"
                          placeholder="Selecione"
                          items={participants.map((participant) => ({
                            value: participant.studentId,
                            label: participant.studentName,
                          }))}
                        />
                      )}
                    </form.AppField>
                  )
                }}
              </form.Subscribe>
              <form.AppField name="date">
                {(field) => (
                  <field.TextField label="Data" type="date" />
                )}
              </form.AppField>
              <form.Field name="isPresent">
                {(field) => (
                  <BooleanField
                    label="Presente"
                    checked={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>
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
                    label="Registrar"
                    busyLabel="Registrando..."
                    icon={<CalendarCheck />}
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
