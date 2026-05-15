import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ImageIcon,
  Tag,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

export type PublicWorkshop = {
  id: string
  name: string
  description: string
  theme: string
  imageUrl: string | null
  startDate: string | null
  endDate: string | null
  workload: number
  vacancies: number | null
  showParticipants: boolean
  staff: {
    name: string
    type: 'teacher' | 'tutor'
  }[]
  participants: {
    name: string
  }[]
}

export function PublicWorkshopsGrid({
  workshops,
  onSignup,
}: {
  workshops: PublicWorkshop[]
  onSignup: (workshopId: string) => void
}) {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {workshops.map((workshop) => (
        <Card
          key={workshop.id}
          className="h-full gap-0 group/workshop overflow-hidden py-0 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="relative aspect-video overflow-hidden bg-muted">
            {workshop.imageUrl ? (
              <img
                src={workshop.imageUrl}
                alt=""
                className="h-full w-full object-cover group-hover/workshop:scale-110 transition-transform duration-200"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted via-background to-muted/60 text-muted-foreground">
                <ImageIcon className="size-10" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent p-4">
              <span className="inline-flex max-w-full items-center rounded-full bg-background/95 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                <Tag className="mr-1.5 size-3.5" />
                <span className="truncate">{workshop.theme}</span>
              </span>
            </div>
          </div>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-lg font-semibold leading-snug">
              {workshop.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 px-5 pb-5">
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {workshop.description}
            </p>
            <div className="grid gap-2 text-sm">
              <InfoLine
                icon={<CalendarDays />}
                label={formatDateRange(
                  workshop.startDate,
                  workshop.endDate,
                )}
              />
              <div className="grid grid-cols-2 gap-2">
                <InfoLine
                  icon={<Clock3 />}
                  label={`${workshop.workload}h`}
                />
                <InfoLine
                  icon={<UserRoundCheck />}
                  label={
                    workshop.vacancies
                      ? `${workshop.vacancies} vagas`
                      : 'Sem limite'
                  }
                />
              </div>
            </div>
            <PeopleGroup
              title="Professores"
              people={workshop.staff
                .filter((person) => person.type === 'teacher')
                .map((person) => person.name)}
            />
            <PeopleGroup
              title="Tutores"
              people={workshop.staff
                .filter((person) => person.type === 'tutor')
                .map((person) => person.name)}
            />
            {workshop.showParticipants ? (
              <PeopleGroup
                title="Participantes"
                people={workshop.participants.map(
                  (participant) => participant.name,
                )}
              />
            ) : null}
          </CardContent>
          <CardFooter className="mt-auto border-t px-5 py-4">
            <Button
              type="button"
              className="w-full justify-between"
              onClick={() => onSignup(workshop.id)}
            >
              Inscrever-se
              <ArrowRight />
            </Button>
          </CardFooter>
        </Card>
      ))}
      {!workshops.length ? (
        <Card className="sm:col-span-2 xl:col-span-3">
          <CardContent className="py-8 text-muted-foreground">
            Nenhuma oficina publica disponivel no momento.
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null,
) {
  if (!startDate && !endDate) return 'Datas nao informadas'
  if (startDate && endDate) {
    return `${formatDate(startDate)} a ${formatDate(endDate)}`
  }
  return formatDate(startDate ?? endDate)
}

function formatDate(date: string | null) {
  if (!date) return 'Datas nao informadas'

  const [year, month, day] = date.split('-')

  if (!year || !month || !day) return date

  return `${day}/${month}/${year}`
}

function InfoLine({
  icon,
  label,
}: {
  icon?: React.ReactNode
  label: string
}) {
  return (
    <span className="flex min-w-0 items-center gap-2 rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-muted-foreground">
      {icon ? (
        <span className="shrink-0 text-foreground [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      <span className="truncate">{label}</span>
    </span>
  )
}

function PeopleGroup({
  title,
  people,
}: {
  title: string
  people: string[]
}) {
  if (!people.length) {
    return null
  }

  return (
    <div className="grid gap-2 text-sm">
      <span className="flex items-center gap-2 font-medium text-foreground">
        <UsersRound className="size-4" />
        {title}
      </span>
      <div className="flex flex-wrap gap-2">
        {people.map((person) => (
          <span
            key={person}
            className="max-w-full truncate rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
          >
            {person}
          </span>
        ))}
      </div>
    </div>
  )
}
