import { z } from 'zod'
import { optionalDate, optionalText } from '~/lib/validation'

export const studentInputSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(160),
  email: optionalText,
  phone: optionalText,
  document: optionalText,
  birthDate: optionalDate,
})

export type StudentInput = z.infer<typeof studentInputSchema>
