import { z } from 'zod'
import { optionalText } from '~/lib/validation'

export const staffTypes = ['teacher', 'tutor'] as const

export const staffInputSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(160),
  email: optionalText,
  phone: optionalText,
  type: z.enum(staffTypes),
})

export type StaffInput = z.infer<typeof staffInputSchema>
