import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getSessionFn } from './auth.functions'

export const getSessionOptions = () =>
  queryOptions({
    queryKey: ['user'],
    queryFn: ({ signal }) => getSessionFn({ signal }),
  })

// suspense -> used for better ssr
export const useSuspenseAuth = () =>
  useSuspenseQuery({ ...getSessionOptions() })
