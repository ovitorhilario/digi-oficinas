import { Award, FileText, Plus } from 'lucide-react'
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
import { issueCertificateFn } from '~/features/certificate/certificate.functions'
import { certificateInputSchema } from '~/features/certificate/certificate.schemas'
import { SubmitStateButton } from '../../-components/form-controls'
import {
  type DashboardData,
  useRefreshMutation,
} from '../../-lib/dashboard'
import {
  buildIssuedCertificateData,
  type CertificatePrintData,
  openCertificatePdf,
} from './certificate-pdf'

type CertificateFormValues = z.infer<typeof certificateInputSchema>

export function CertificatesPanel({ data }: { data: DashboardData }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const issueMutation = useRefreshMutation(
    (values: CertificateFormValues) =>
      issueCertificateFn({ data: values }),
  )

  const form = useAppForm({
    defaultValues: {
      workshopId: data.workshops[0]?.id ?? '',
      studentId: '',
    } satisfies CertificateFormValues,
    validators: {
      onSubmit: certificateInputSchema,
    },
    onSubmit: async ({ value }) => {
      const result = certificateInputSchema.safeParse(value)

      if (!result.success) {
        toast.error('Selecione oficina e aluno para emitir.')
        return
      }

      const printWindow = window.open('', '_blank')
      printWindow?.document.write(
        '<!doctype html><title>Gerando certificado</title><p style="font-family: Arial, sans-serif; padding: 24px;">Gerando certificado...</p>',
      )

      let mutationResult: { code?: string }

      try {
        mutationResult = (await issueMutation.mutateAsync(
          result.data,
        )) as { code?: string }
      } catch (error) {
        printWindow?.close()
        throw error
      }

      const certificate = mutationResult.code
        ? buildIssuedCertificateData(
            data,
            result.data,
            mutationResult.code,
          )
        : null

      setSheetOpen(false)

      if (certificate) {
        openCertificate(certificate, printWindow)
      } else {
        printWindow?.close()
      }
    },
  })

  function openSheet() {
    form.reset({
      workshopId: data.workshops[0]?.id ?? '',
      studentId: '',
    })
    setSheetOpen(true)
  }

  function openCertificate(
    certificate: CertificatePrintData,
    targetWindow?: Window | null,
  ) {
    const opened = openCertificatePdf(certificate, targetWindow)

    if (!opened) {
      toast.error(
        'Nao foi possivel abrir o PDF. Verifique o bloqueador de pop-ups.',
      )
    }
  }

  return (
    <>
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CardTitle>Certificados</CardTitle>
            <span className="inline-flex items-center rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {data.certificates.length}
            </span>
          </div>
          <Button type="button" onClick={openSheet}>
            <Plus />
            Emitir certificado
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {data.certificates.length ? (
            data.certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="flex min-h-40 flex-col justify-between gap-3 rounded-lg border border-border/70 bg-background p-4 transition-colors hover:border-border hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <strong className="text-base">
                    {certificate.studentName}
                  </strong>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Certificado emitido
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {certificate.workshopName}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border/70 px-2.5 py-1">
                    Tema: {certificate.theme}
                  </span>
                  <span className="rounded-full border border-border/70 px-2.5 py-1">
                    {certificate.workload}h
                  </span>
                  <span className="rounded-full border border-border/70 px-2.5 py-1">
                    Codigo {certificate.certificateCode}
                  </span>
                </div>
                <footer className="mt-auto flex flex-wrap justify-end gap-2 border-t border-border/70 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openCertificate(certificate)}
                  >
                    <FileText />
                    PDF
                  </Button>
                </footer>
              </div>
            ))
          ) : (
            <Empty className="col-span-full rounded-lg shadow-none">
              <EmptyMedia variant="icon">
                <Award />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Nenhum certificado emitido</EmptyTitle>
                <EmptyDescription>
                  Gere certificados para os participantes concluintes
                  e acompanhe o historico por aqui.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl!">
          <SheetHeader>
            <SheetTitle>Emitir certificado</SheetTitle>
            <SheetDescription>
              Escolha a oficina e o aluno para gerar o certificado.
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
                    label="Emitir"
                    busyLabel="Emitindo..."
                    icon={<Award />}
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
