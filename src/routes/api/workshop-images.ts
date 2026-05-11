import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { createFileRoute } from '@tanstack/react-router'
import { auth } from '~/lib/auth'

const uploadDir = resolve(
  process.cwd(),
  'src/server/uploads/workshops',
)

const allowedTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
])

const maxUploadSize = 5 * 1024 * 1024

export const Route = createFileRoute('/api/workshop-images')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
          query: { disableCookieCache: true },
        })

        if (
          !session?.user ||
          (session.user as { role?: string | null }).role !== 'admin'
        ) {
          return Response.json(
            { message: 'Unauthorized' },
            { status: 401 },
          )
        }

        const formData = await request.formData()
        const file = formData.get('image')

        if (!(file instanceof File)) {
          return Response.json(
            { message: 'Imagem nao enviada.' },
            { status: 400 },
          )
        }

        if (!allowedTypes.has(file.type)) {
          return Response.json(
            { message: 'Use uma imagem JPG, PNG, WebP ou GIF.' },
            { status: 400 },
          )
        }

        if (file.size > maxUploadSize) {
          return Response.json(
            { message: 'A imagem deve ter ate 5 MB.' },
            { status: 400 },
          )
        }

        const originalExt = extname(file.name).toLowerCase()
        const extension = allowedTypes.get(file.type) ?? originalExt
        const filename = `${randomUUID()}${extension}`

        await mkdir(uploadDir, { recursive: true })
        await writeFile(
          `${uploadDir}/${filename}`,
          Buffer.from(await file.arrayBuffer()),
        )

        return Response.json({
          imageUrl: `/api/uploads/workshops/${filename}`,
        })
      },
    },
  },
})
