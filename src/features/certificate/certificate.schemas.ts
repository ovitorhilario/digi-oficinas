import { z } from 'zod'

export const certificateInputSchema = z.object({
  workshopId: z.uuid(),
  studentId: z.uuid(),
})

export type CertificateInput = z.infer<typeof certificateInputSchema>
