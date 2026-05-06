import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import {
  ArrowLeft,
  Award,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react'
import { getSessionOptions } from '~/features/auth/auth.queries'
import { cn } from '~/lib/utils'

const navigationItems = [
  {
    to: '/app/oficinas',
    label: 'Oficinas',
    description: 'Programas, datas e vagas',
    icon: ClipboardList,
    accent:
      'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/60',
  },
  {
    to: '/app/equipe',
    label: 'Professores e tutores',
    description: 'Equipe vinculada',
    icon: UsersRound,
    accent:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60',
  },
  {
    to: '/app/alunos',
    label: 'Alunos',
    description: 'Participantes cadastrados',
    icon: GraduationCap,
    accent:
      'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900/60',
  },
  {
    to: '/app/inscricoes',
    label: 'Inscrições',
    description: 'Solicitações e aprovações',
    icon: UserRoundPlus,
    accent:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
  },
  {
    to: '/app/presenca',
    label: 'Presença',
    description: 'Chamadas por oficina',
    icon: CalendarCheck,
    accent:
      'bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:ring-cyan-900/60',
  },
  {
    to: '/app/certificados',
    label: 'Certificados',
    description: 'Emissão e controle',
    icon: Award,
    accent:
      'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60',
  },
] as const

export const Route = createFileRoute('/app')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData({
      ...getSessionOptions(),
      revalidateIfStale: true,
    })
    if (!session) {
      throw redirect({ to: '/' })
    }

    if (session.role !== 'admin') {
      throw redirect({ to: '/' })
    }

    return { auth: session }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { auth } = Route.useRouteContext()
  const adminInitials = auth.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0))
    .join('')
    .toUpperCase()

  return (
    <main className="min-h-svh bg-linear-to-b from-muted/70 via-background to-background">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm underline-offset-4 underline hover:text-muted-foreground"
          >
            <ArrowLeft className="size-4" />
            Oficinas públicas
          </Link>
        </div>
        <header className="overflow-hidden rounded-[2rem] border border-border/70 bg-background shadow-sm">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_20rem] lg:p-8">
            <div className="flex min-w-0 flex-col justify-between gap-8">
              <div className="grid gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                    <LayoutDashboard className="size-3.5" />
                    Painel administrativo
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <ShieldCheck className="size-3.5" />
                    Acesso admin
                  </span>
                </div>
                <div className="grid max-w-3xl gap-3">
                  <h1 className="text-3xl font-semibold tracking-normal text-balance sm:text-4xl">
                    DIGIOFICINAS
                  </h1>
                  <p className="text-base/relaxed text-muted-foreground sm:text-lg/relaxed">
                    Gestão centralizada das oficinas, inscrições,
                    equipe, presença e certificados.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="rounded-full border border-border/70 px-3 py-1">
                  Oficinas públicas e internas
                </span>
                <span className="rounded-full border border-border/70 px-3 py-1">
                  Fluxo de inscrições
                </span>
                <span className="rounded-full border border-border/70 px-3 py-1">
                  Controle de presença
                </span>
              </div>
            </div>

            <aside className="flex min-w-0 flex-col justify-between gap-5 rounded-[1.5rem] border border-border/70 bg-muted/35 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                  {adminInitials || 'AD'}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{auth.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {auth.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl border border-border/70 bg-background p-3">
                  <p className="text-xs text-muted-foreground">
                    Perfil
                  </p>
                  <p className="mt-1 font-medium capitalize">
                    {auth.role ?? 'admin'}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background p-3">
                  <p className="text-xs text-muted-foreground">
                    Módulos
                  </p>
                  <p className="mt-1 font-medium">
                    {navigationItems.length}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{
                  className:
                    'border-primary/40 bg-primary text-primary-foreground shadow-md ring-primary/20 hover:bg-primary/90 [&_[data-slot=nav-icon]]:bg-primary-foreground/15 [&_[data-slot=nav-icon]]:text-primary-foreground [&_[data-slot=nav-icon]]:ring-primary-foreground/20 [&_[data-slot=nav-description]]:text-primary-foreground/75',
                }}
                className="group flex min-h-24 items-center gap-4 rounded-[1.5rem] border border-border/70 bg-background p-4 text-left shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:border-border hover:bg-muted/40 hover:shadow-md"
              >
                <span
                  data-slot="nav-icon"
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1 transition-colors',
                    item.accent,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="grid min-w-0 gap-1">
                  <span className="truncate font-medium">
                    {item.label}
                  </span>
                  <span
                    data-slot="nav-description"
                    className="line-clamp-2 text-sm text-muted-foreground"
                  >
                    {item.description}
                  </span>
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="pb-6">
          <Outlet />
        </div>
      </section>
    </main>
  )
}
