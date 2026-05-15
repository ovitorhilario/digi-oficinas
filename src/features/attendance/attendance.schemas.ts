import { z } from 'zod'

export const attendanceInputSchema = z.object({
  workshopId: z.uuid(),
  studentId: z.uuid(),
  date: z.iso.date(),
  isPresent: z.boolean(),
})

export type AttendanceInput = z.infer<typeof attendanceInputSchema>
