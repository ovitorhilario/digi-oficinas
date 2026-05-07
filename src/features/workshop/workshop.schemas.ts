import { z } from 'zod'

export const workshopStatuses = [
  'planned',
  'in_progress',
  'finished',
  'cancelled',
] as const

const positiveInteger = z
  .union([z.number(), z.string()])
  .transform((value, context) => {
    const parsed = Number(value)

    if (!Number.isInteger(parsed) || parsed <= 0) {
      context.addIssue({
        code: 'custom',
        message: 'Expected a positive integer',
      })
      return z.NEVER
    }

    return parsed
  })

export const workshopInputSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(2).max(3000),
  theme: z.string().trim().min(2).max(160),
  imageUrl: z.string().trim().max(600).nullable().optional(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  workload: positiveInteger,
  status: z.enum(workshopStatuses),
  vacancies: positiveInteger.nullable().optional(),
  isPublic: z.boolean(),
  showParticipants: z.boolean(),
  staffIds: z.array(z.uuid()).default([]),
})

export type WorkshopInput = z.infer<typeof workshopInputSchema>
