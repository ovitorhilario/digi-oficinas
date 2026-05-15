import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { dashboardQuery } from '../-lib/dashboard'
import { RequestsPanel } from './-components/requests-panel'

export const Route = createFileRoute('/app/inscricoes/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQuery),
  component: RequestsRoute,
})

function RequestsRoute() {
  const { data } = useSuspenseQuery(dashboardQuery)

  return <RequestsPanel data={data} />
}
