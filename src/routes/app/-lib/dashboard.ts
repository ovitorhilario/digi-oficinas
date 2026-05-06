import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAdminDashboardFn } from '~/features/dashboard/dashboard.functions'

export const dashboardQuery = {
  queryKey: ['digioficinas', 'admin-dashboard'],
  queryFn: () => getAdminDashboardFn(),
}

export type DashboardData = Awaited<
  ReturnType<typeof getAdminDashboardFn>
>

export function useRefreshMutation<TData>(
  mutationFn: (data: TData) => Promise<unknown>,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onError: ({ message }) => {
      toast.error(message || 'Não foi possível salvar as alterações.')
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: dashboardQuery.queryKey,
      }),
  })
}
