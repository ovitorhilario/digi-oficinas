import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { dashboardQuery } from '../-lib/dashboard'
import { WorkshopsPanel } from './-components/workshops-panel'

export const Route = createFileRoute('/app/oficinas/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQuery),
  component: WorkshopsRoute,
})

function WorkshopsRoute() {
  const { data } = useSuspenseQuery(dashboardQuery)

  return <WorkshopsPanel data={data} />
}
