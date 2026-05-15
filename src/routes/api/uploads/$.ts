import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createFileRoute } from '@tanstack/react-router'

const uploadRoot = resolve(process.cwd(), 'src/server/uploads')

const contentTypes: Record<string, string> = {
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export const Route = createFileRoute('/api/uploads/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const pathFromUrl = new URL(request.url).pathname.replace(
          /^\/api\/uploads\/?/,
          '',
        )
        const relativePath = decodeURIComponent(pathFromUrl)
        const filePath = resolve(uploadRoot, relativePath)
        const normalizedRoot = resolve(uploadRoot).toLowerCase()
        const normalizedFile = filePath.toLowerCase()

        if (
          !relativePath ||
          relativePath.includes('..') ||
          !normalizedFile.startsWith(normalizedRoot)
        ) {
          return new Response('Not Found', { status: 404 })
        }

        try {
          const file = await readFile(filePath)
          const extension =
            filePath.split('.').pop()?.toLowerCase() ?? ''

          return new Response(file, {
            headers: {
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Content-Type':
                contentTypes[extension] ?? 'application/octet-stream',
            },
          })
        } catch {
          return new Response('Not Found', { status: 404 })
        }
      },
    },
  },
})
