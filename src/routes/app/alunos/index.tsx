import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { dashboardQuery } from '../-lib/dashboard'
import { StudentsPanel } from './-components/students-panel'

export const Route = createFileRoute('/app/alunos/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQuery),
  component: StudentsRoute,
})

function StudentsRoute() {
  const { data } = useSuspenseQuery(dashboardQuery)

  return <StudentsPanel data={data} />
}
