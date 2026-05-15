import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CalendarDays,
  LogIn,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { getPublicWorkshopsFn } from '~/features/workshop/workshop.functions'
import { PublicSignupSheet } from './-components/public-signup-sheet'
import { PublicWorkshopsGrid } from './-components/public-workshops-grid'

const publicWorkshopsQuery = {
  queryKey: ['digioficinas', 'public-workshops'],
  queryFn: () => getPublicWorkshopsFn(),
}

export const Route = createFileRoute('/_public/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(publicWorkshopsQuery),
  component: PublicHome,
})

function PublicHome() {
  const { data: workshops } = useSuspenseQuery(publicWorkshopsQuery)
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<
    string | null
  >(null)
  const selectedWorkshop =
    workshops.find(
      (workshop) => workshop.id === selectedWorkshopId,
    ) ?? null
  const totalVacancies = workshops.reduce(
    (total, workshop) => total + (workshop.vacancies ?? 0),
    0,
  )
  const showVacancies = totalVacancies > 0

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,var(--muted),transparent_34rem),linear-gradient(180deg,var(--background),var(--muted)/20)]">
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-border/70 bg-background shadow-sm">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
            <div className="grid max-w-3xl gap-5">
              <span className="inline-flex w-fit items-center gap-3 rounded-full border border-border/70 bg-muted/60 px-5 py-2 text-lg font-semibold text-foreground shadow-sm">
                <Sparkles className="size-5" />
                DigiEventos
              </span>
              <div className="grid gap-3">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
                  Encontre oficinas e eventos abertos para inscricao
                </h1>
                <p className="max-w-2xl text-base/relaxed text-muted-foreground">
                  Acompanhe atividades disponiveis, conheca as equipes
                  responsaveis e solicite sua vaga em poucos passos.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Link to="/auth/login">
                <Button type="button" variant="outline">
                  <LogIn />
                  Entrar no painel
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid border-t border-border/70 bg-muted/35 sm:grid-cols-3">
            <HeroMetric
              icon={<CalendarDays />}
              label="Eventos publicados"
              value={workshops.length.toString()}
            />
            <HeroMetric
              icon={<UsersRound />}
              label="Inscricao online"
              value="Aberta"
            />
            <HeroMetric
              icon={<Sparkles />}
              label={showVacancies ? 'Vagas anunciadas' : 'Curadoria'}
              value={
                showVacancies ? totalVacancies.toString() : 'Ativa'
              }
            />
          </div>
        </header>

        <section className="grid gap-5">
          <div className="flex flex-col gap-3 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Programacao
              </p>
              <h2 className="text-2xl font-semibold tracking-normal">
                Eventos disponiveis
              </h2>
            </div>
            <p className="max-w-xl text-sm/relaxed text-muted-foreground md:text-right">
              Escolha uma atividade para visualizar os detalhes e
              abrir o formulario de inscricao.
            </p>
          </div>

          <PublicWorkshopsGrid
            workshops={workshops}
            onSignup={setSelectedWorkshopId}
          />
        </section>

        <PublicSignupSheet
          workshop={selectedWorkshop}
          open={!!selectedWorkshop}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedWorkshopId(null)
            }
          }}
          queryKey={publicWorkshopsQuery.queryKey}
        />
      </section>
    </main>
  )
}

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-border/70 p-5 sm:border-r sm:last:border-r-0">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background text-foreground shadow-sm ring-1 ring-border/70 [&_svg]:size-4">
        {icon}
      </span>
      <span className="grid min-w-0 gap-0.5">
        <span className="truncate text-sm text-muted-foreground">
          {label}
        </span>
        <span className="truncate text-lg font-semibold">
          {value}
        </span>
      </span>
    </div>
  )
}
