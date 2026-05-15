import {
  ImageIcon,
  Inbox,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
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
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '~/components/ui/combobox'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'
import {
  Field,
  FieldDescription,
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
import {
  deleteWorkshopFn,
  saveWorkshopFn,
} from '~/features/workshop/workshop.functions'
import {
  workshopInputSchema,
  workshopStatuses,
} from '~/features/workshop/workshop.schemas'
import {
  BooleanField,
  SubmitStateButton,
} from '../../-components/form-controls'
import {
  type DashboardData,
  useRefreshMutation,
} from '../../-lib/dashboard'

type Workshop = DashboardData['workshops'][number]
type WorkshopFormValues = z.input<typeof workshopInputSchema>

const emptyWorkshop: WorkshopFormValues = {
  name: '',
  description: '',
  theme: '',
  imageUrl: null,
  startDate: '',
  endDate: '',
  workload: 20,
  status: 'planned',
  vacancies: null,
  isPublic: true,
  showParticipants: false,
  staffIds: [],
}

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const maxImageSize = 5 * 1024 * 1024

const statusItems = workshopStatuses.map((status) => ({
  value: status,
  label:
    status === 'planned'
      ? 'Planejada'
      : status === 'in_progress'
        ? 'Em andamento'
        : status === 'finished'
          ? 'Finalizada'
          : 'Cancelada',
}))

function getWorkshopStatusMeta(status: Workshop['status']) {
  switch (status) {
    case 'planned':
      return {
        label: 'Planejada',
        className:
          'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300',
      }
    case 'in_progress':
      return {
        label: 'Em andamento',
        className:
          'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
      }
    case 'finished':
      return {
        label: 'Finalizada',
        className:
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      }
    case 'cancelled':
      return {
        label: 'Cancelada',
        className:
          'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300',
      }
  }
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null,
) {
  if (!startDate && !endDate) return 'Datas nao informadas'
  if (startDate && endDate) return `${startDate} ate ${endDate}`
  return startDate ?? endDate ?? 'Datas nao informadas'
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function uploadWorkshopImage(file: File) {
  const formData = new FormData()
  formData.set('image', file)

  const response = await fetch('/api/workshop-images', {
    method: 'POST',
    body: formData,
  })
  const payload = (await response.json()) as {
    imageUrl?: string
    message?: string
  }

  if (!response.ok || !payload.imageUrl) {
    throw new Error(
      payload.message ?? 'Nao foi possivel enviar a imagem.',
    )
  }

  return payload.imageUrl
}

export function WorkshopsPanel({ data }: { data: DashboardData }) {
  const [editing, setEditing] = useState<WorkshopFormValues | null>(
    null,
  )
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedImageFile, setSelectedImageFile] =
    useState<File | null>(null)
  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageInputKey, setImageInputKey] = useState(0)
  const saveMutation = useRefreshMutation(
    (values: WorkshopFormValues) => saveWorkshopFn({ data: values }),
  )
  const deleteMutation = useRefreshMutation((id: string) =>
    deleteWorkshopFn({ data: { id } }),
  )

  const form = useAppForm({
    defaultValues: editing ?? emptyWorkshop,
    validators: {
      onSubmit: workshopInputSchema,
    },
    onSubmit: async ({ value }) => {
      const result = workshopInputSchema.safeParse(value)

      if (!result.success) {
        toast.error('Revise os campos da oficina e tente novamente.')
        return
      }

      try {
        setIsUploadingImage(true)
        const imageUrl = selectedImageFile
          ? await uploadWorkshopImage(selectedImageFile)
          : result.data.imageUrl

        await saveMutation.mutateAsync({
          ...result.data,
          imageUrl: imageUrl ?? null,
        })
        resetForm()
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel salvar a oficina.',
        )
      } finally {
        setIsUploadingImage(false)
      }
    },
  })

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview)
      }
    }
  }, [selectedImagePreview])

  function clearSelectedImageFile() {
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview)
    }

    setSelectedImageFile(null)
    setSelectedImagePreview(null)
    setImageInputKey((key) => key + 1)
  }

  function selectImageFile(file: File | null) {
    clearSelectedImageFile()

    if (!file) {
      return
    }

    if (!allowedImageTypes.includes(file.type)) {
      toast.error('Use uma imagem JPG, PNG, WebP ou GIF.')
      return
    }

    if (file.size > maxImageSize) {
      toast.error('A imagem deve ter ate 5 MB.')
      return
    }

    setSelectedImageFile(file)
    setSelectedImagePreview(URL.createObjectURL(file))
  }

  function resetForm() {
    setEditing(null)
    clearSelectedImageFile()
    form.reset(emptyWorkshop)
    setSheetOpen(false)
  }

  function create() {
    setEditing(null)
    clearSelectedImageFile()
    form.reset(emptyWorkshop)
    setSheetOpen(true)
  }

  function edit(workshop: Workshop) {
    const values = {
      id: workshop.id,
      name: workshop.name,
      description: workshop.description,
      theme: workshop.theme,
      imageUrl: workshop.imageUrl,
      startDate: workshop.startDate ?? '',
      endDate: workshop.endDate ?? '',
      workload: workshop.workload,
      status: workshop.status,
      vacancies: workshop.vacancies,
      isPublic: workshop.isPublic,
      showParticipants: workshop.showParticipants,
      staffIds: workshop.staffIds,
    } satisfies WorkshopFormValues

    setEditing(values)
    clearSelectedImageFile()
    form.reset(values)
    setSheetOpen(true)
  }

  return (
    <>
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CardTitle>Oficinas</CardTitle>
            <span className="inline-flex items-center rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {data.workshops.length}
            </span>
          </div>
          <Button type="button" onClick={create}>
            <Plus />
            Nova oficina
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {data.workshops.length ? (
            data.workshops.map((workshop) => {
              const statusMeta = getWorkshopStatusMeta(
                workshop.status,
              )

              return (
                <div
                  key={workshop.id}
                  className="flex h-full min-h-72 flex-col gap-4 rounded-lg border border-border/70 bg-background p-4 transition-colors hover:border-border hover:bg-muted/30"
                >
                  <div className="grid min-w-0 gap-3">
                    <div className="grid gap-3">
                      {workshop.imageUrl ? (
                        <img
                          src={workshop.imageUrl}
                          alt=""
                          className="aspect-video w-full rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/40 text-muted-foreground">
                          <ImageIcon className="size-8" />
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold">
                          {workshop.name}
                        </h2>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border/70 px-2.5 py-1">
                        Tema: {workshop.theme}
                      </span>
                      <span className="rounded-full border border-border/70 px-2.5 py-1">
                        {formatDateRange(
                          workshop.startDate,
                          workshop.endDate,
                        )}
                      </span>
                      <span className="rounded-full border border-border/70 px-2.5 py-1">
                        {workshop.workload}h de carga horaria
                      </span>
                      <span className="rounded-full border border-border/70 px-2.5 py-1">
                        {workshop.vacancies ?? 'Sem limite'} vagas
                      </span>
                      <span className="rounded-full border border-border/70 px-2.5 py-1">
                        {workshop.isPublic ? 'Publica' : 'Interna'}
                      </span>
                    </div>
                    <p className="line-clamp-4 max-w-3xl text-sm/relaxed text-muted-foreground">
                      {workshop.description}
                    </p>
                  </div>
                  <footer className="mt-auto flex flex-wrap justify-end gap-2 border-t border-border/70 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => edit(workshop)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() =>
                        deleteMutation.mutate(workshop.id)
                      }
                    >
                      <Trash2 />
                    </Button>
                  </footer>
                </div>
              )
            })
          ) : (
            <Empty className="col-span-full rounded-lg shadow-none">
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>Nenhuma oficina cadastrada</EmptyTitle>
                <EmptyDescription>
                  Crie a primeira oficina para comecar a organizar
                  turmas, equipe e presencas.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

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
              {editing?.id ? 'Editar oficina' : 'Nova oficina'}
            </SheetTitle>
            <SheetDescription>
              Cadastre a oficina e defina equipe, datas e
              visibilidade.
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
              <form.AppField name="theme">
                {(field) => <field.TextField label="Tema" />}
              </form.AppField>
              <form.AppField name="description">
                {(field) => <field.TextareaField label="Descricao" />}
              </form.AppField>
              <form.Field name="imageUrl">
                {(field) => {
                  const previewUrl =
                    selectedImagePreview ?? field.state.value
                  const imageState = selectedImageFile
                    ? `${selectedImageFile.name} - ${formatFileSize(
                        selectedImageFile.size,
                      )}`
                    : field.state.value
                      ? 'Imagem atual da oficina'
                      : 'Nenhuma imagem selecionada'

                  return (
                    <Field className="gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid gap-1">
                          <label htmlFor="workshop-image">
                            Imagem
                          </label>
                          <FieldDescription>
                            JPG, PNG, WebP ou GIF ate 5 MB.
                          </FieldDescription>
                        </div>
                        {previewUrl ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              clearSelectedImageFile()
                              field.handleChange(null)
                            }}
                          >
                            <X />
                            Remover
                          </Button>
                        ) : null}
                      </div>
                      <div className="overflow-hidden rounded-md border border-border/70 bg-muted/30">
                        <div className="relative aspect-video">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-3 border border-dashed border-border/70 bg-linear-to-br from-background via-muted/30 to-muted/70 p-6 text-center text-muted-foreground">
                              <span className="flex size-12 items-center justify-center rounded-md bg-background shadow-sm ring-1 ring-border/70">
                                <ImageIcon className="size-5" />
                              </span>
                              <span className="max-w-64 text-sm/relaxed">
                                Adicione uma imagem para destacar a
                                oficina na pagina publica.
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-3 border-t border-border/70 bg-background p-3">
                          <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                            <ImageIcon className="size-4 shrink-0 text-foreground" />
                            <span className="truncate">
                              {imageState}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                              key={imageInputKey}
                              id="workshop-image"
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              className="sr-only"
                              onChange={(event) => {
                                selectImageFile(
                                  event.target.files?.item(0) ?? null,
                                )
                              }}
                            />
                            <label
                              htmlFor="workshop-image"
                              className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-4xl border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                            >
                              <Upload className="size-4" />
                              {previewUrl
                                ? 'Trocar imagem'
                                : 'Selecionar imagem'}
                            </label>
                            {selectedImageFile ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={clearSelectedImageFile}
                              >
                                Cancelar troca
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </Field>
                  )
                }}
              </form.Field>
              <div className="grid grid-cols-2 gap-2">
                <form.AppField name="startDate">
                  {(field) => (
                    <field.TextField label="Inicio" type="date" />
                  )}
                </form.AppField>
                <form.AppField name="endDate">
                  {(field) => (
                    <field.TextField label="Fim" type="date" />
                  )}
                </form.AppField>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <form.Field name="workload">
                  {(field) => (
                    <Field>
                      <label htmlFor={field.name}>
                        Carga horaria
                      </label>
                      <Input
                        id={field.name}
                        type="number"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(
                            Number(event.target.value),
                          )
                        }
                      />
                    </Field>
                  )}
                </form.Field>
                <form.Field name="vacancies">
                  {(field) => (
                    <Field>
                      <label htmlFor={field.name}>Vagas</label>
                      <Input
                        id={field.name}
                        type="number"
                        value={field.state.value ?? ''}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value
                              ? Number(event.target.value)
                              : null,
                          )
                        }
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
              <form.AppField name="status">
                {(field) => (
                  <field.SelectField
                    label="Status"
                    items={statusItems}
                  />
                )}
              </form.AppField>
              <form.Field name="isPublic">
                {(field) => (
                  <BooleanField
                    label="Publicar oficina"
                    checked={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>
              <form.Field name="showParticipants">
                {(field) => (
                  <BooleanField
                    label="Exibir participantes publicamente"
                    checked={field.state.value}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>
              <form.Field name="staffIds">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Equipe
                    </FieldLabel>
                    {data.staff.length ? (
                      <Combobox
                        items={data.staff.map((person) => person.id)}
                        multiple
                        autoHighlight
                        value={field.state.value ?? []}
                        onValueChange={field.handleChange}
                      >
                        <ComboboxChips>
                          <ComboboxValue>
                            {(field.state.value ?? []).map(
                              (staffId) => {
                                const person = data.staff.find(
                                  (item) => item.id === staffId,
                                )

                                return (
                                  <ComboboxChip key={staffId}>
                                    {person?.name ??
                                      'Pessoa removida'}
                                  </ComboboxChip>
                                )
                              },
                            )}
                          </ComboboxValue>
                          <ComboboxChipsInput placeholder="Adicionar pessoa" />
                        </ComboboxChips>
                        <ComboboxContent>
                          <ComboboxEmpty>
                            Nenhuma pessoa encontrada.
                          </ComboboxEmpty>
                          <ComboboxList>
                            {(staffId) => {
                              const person = data.staff.find(
                                (item) => item.id === staffId,
                              )

                              if (!person) return null

                              return (
                                <ComboboxItem
                                  key={person.id}
                                  value={person.id}
                                >
                                  <span className="grid gap-0.5">
                                    <span>{person.name}</span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                      {person.type === 'teacher'
                                        ? 'Professor'
                                        : 'Tutor'}
                                    </span>
                                  </span>
                                </ComboboxItem>
                              )
                            }}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Cadastre pessoas na equipe para vincula-las a
                        esta oficina.
                      </p>
                    )}
                  </Field>
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
                    canSubmit={canSubmit && !isUploadingImage}
                    isSubmitting={isSubmitting || isUploadingImage}
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
