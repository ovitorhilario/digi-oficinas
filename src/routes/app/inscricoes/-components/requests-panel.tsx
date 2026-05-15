import { Check, Inbox, X } from 'lucide-react'
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
import { decideParticipationFn } from '~/features/participation/participation.functions'
import {
  type DashboardData,
  useRefreshMutation,
} from '../../-lib/dashboard'

export function RequestsPanel({ data }: { data: DashboardData }) {
  const pending = data.participants.filter(
    (participant) => participant.status === 'pending',
  )
  const decisionMutation = useRefreshMutation(
    (values: {
      participationId: string
      decision: 'approve' | 'reject'
    }) => decideParticipationFn({ data: values }),
  )

  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CardTitle>Inscricoes pendentes</CardTitle>
          <span className="inline-flex items-center rounded-full border border-border/70 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {pending.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {pending.length ? (
          pending.map((participant) => (
            <div
              key={participant.id}
              className="flex min-h-52 flex-col justify-between gap-4 rounded-lg border border-border/70 bg-background p-4 transition-colors hover:border-border hover:bg-muted/30"
            >
              <div className="grid min-w-0 gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-base">
                    {participant.studentName}
                  </strong>
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                    Aguardando avaliacao
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border/70 px-2.5 py-1">
                    {participant.workshopName}
                  </span>
                  <span className="rounded-full border border-border/70 px-2.5 py-1">
                    {participant.studentEmail}
                  </span>
                  <span className="rounded-full border border-border/70 px-2.5 py-1">
                    {participant.studentPhone}
                  </span>
                </div>
                {participant.message ? (
                  <p className="rounded-md border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
                    {participant.message}
                  </p>
                ) : null}
              </div>
              <footer className="mt-auto flex flex-wrap justify-end gap-2 border-t border-border/70 pt-3">
                <Button
                  type="button"
                  onClick={() =>
                    decisionMutation.mutate({
                      participationId: participant.id,
                      decision: 'approve',
                    })
                  }
                >
                  <Check />
                  Aprovar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    decisionMutation.mutate({
                      participationId: participant.id,
                      decision: 'reject',
                    })
                  }
                >
                  <X />
                  Recusar
                </Button>
              </footer>
            </div>
          ))
        ) : (
          <Empty className="col-span-full rounded-lg shadow-none">
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Nenhuma inscricao pendente</EmptyTitle>
              <EmptyDescription>
                As novas solicitacoes de participacao vao aparecer
                aqui para aprovacao ou recusa.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
