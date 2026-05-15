import { z } from 'zod'

export const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined))
  .optional()

export const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined))
  .optional()

export const idSchema = z.object({
  id: z.uuid(),
})

export type IdInput = z.infer<typeof idSchema>
