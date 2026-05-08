import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { dashboardQuery } from '../-lib/dashboard'
import { StaffPanel } from './-components/staff-panel'

export const Route = createFileRoute('/app/equipe/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQuery),
  component: StaffRoute,
})

function StaffRoute() {
  const { data } = useSuspenseQuery(dashboardQuery)

  return <StaffPanel data={data} />
}
