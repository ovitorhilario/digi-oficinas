import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { dashboardQuery } from '../-lib/dashboard'
import { CertificatesPanel } from './-components/certificates-panel'

export const Route = createFileRoute('/app/certificados/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQuery),
  component: CertificatesRoute,
})

function CertificatesRoute() {
  const { data } = useSuspenseQuery(dashboardQuery)

  return <CertificatesPanel data={data} />
}
