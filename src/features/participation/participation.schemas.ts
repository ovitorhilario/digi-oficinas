import { z } from 'zod'
import { optionalText } from '~/lib/validation'

export const participantStatuses = [
  'pending',
  'approved',
  'rejected',
  'participant',
  'completed',
  'cancelled',
] as const

export const activeParticipantStatuses = [
  'approved',
  'participant',
  'completed',
] as const

export const manualEnrollmentSchema = z.object({
  workshopId: z.uuid(),
  studentId: z.uuid(),
  status: z.enum(['approved', 'participant']).default('participant'),
})

export const participationDecisionSchema = z.object({
  participationId: z.uuid(),
  decision: z.enum(['approve', 'reject']),
})

export const publicSignupSchema = z.object({
  workshopId: z.uuid(),
  name: z.string().trim().min(2).max(160),
  email: z.email().max(220),
  phone: optionalText,
  company: z.string().max(0).optional(),
})

export type ManualEnrollmentInput = z.infer<
  typeof manualEnrollmentSchema
>
export type ParticipationDecisionInput = z.infer<
  typeof participationDecisionSchema
>
export type PublicSignupInput = z.infer<typeof publicSignupSchema>
