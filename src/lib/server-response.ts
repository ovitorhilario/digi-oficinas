import { setResponseStatus } from '@tanstack/react-start/server'

export function fail(status: number, message: string): never {
  setResponseStatus(status)
  throw new Error(message)
}

export function serializeDate(
  value: Date | string | null | undefined,
) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return value
}
