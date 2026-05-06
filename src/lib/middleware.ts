import { createMiddleware } from '@tanstack/react-start'
import {
  setResponseHeader,
  setResponseStatus,
} from '@tanstack/react-start/server'
import { auth } from './auth'

export type AdminUser = {
  id: string
  name: string
  email: string
  role?: string | null
}

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const headers = request.headers
    const session = await auth.api.getSession({
      headers,
      query: { disableCookieCache: true },
      returnHeaders: true,
    })

    // Forward any Set-Cookie headers to the client, e.g. for session/cache refresh
    const cookies = session.headers?.getSetCookie()
    if (cookies?.length) {
      setResponseHeader('Set-Cookie', cookies)
    }

    if (!session.response?.user || !session.response?.session) {
      setResponseStatus(401)
      throw new Error('Unauthorized')
    }

    return next({
      context: {
        user: session.response.user,
        session: session.response.session,
      },
    })
  },
)

export const adminMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware])
  .server(async ({ context, next }) => {
    const user = context.user as AdminUser

    if (user.role !== 'admin') {
      setResponseStatus(403)
      throw new Error('Forbidden')
    }

    return next({
      context: {
        admin: user,
      },
    })
  })
