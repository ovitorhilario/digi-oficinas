import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { dashboardQuery } from '../-lib/dashboard'
import { AttendancePanel } from './-components/attendance-panel'

export const Route = createFileRoute('/app/presenca/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQuery),
  component: AttendanceRoute,
})

function AttendanceRoute() {
  const { data } = useSuspenseQuery(dashboardQuery)

  return <AttendancePanel data={data} />
}
