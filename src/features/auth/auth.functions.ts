import { createServerFn } from '@tanstack/react-start'
import {
  getRequestHeaders,
  setResponseHeader,
} from '@tanstack/react-start/server'
import { auth } from '~/lib/auth'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({
      headers,
      returnHeaders: true,
    })

    const cookies = session.headers?.getSetCookie() ?? []

    if (!session.response?.user) {
      return null
    }

    // Forward any Set-Cookie headers to the client, e.g. for session/cache refresh
    if (cookies.length) {
      setResponseHeader('Set-Cookie', cookies)
    }

    return session.response.user
  },
)
