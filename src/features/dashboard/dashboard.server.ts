import { desc, eq, inArray } from 'drizzle-orm'
import { db } from '~/db'
import {
  attendance,
  certificates,
  staff,
  students,
  workshopParticipants,
  workshopStaff,
  workshops,
} from '~/db/schema/digioficinas.schema'
import type { AdminContext } from '~/lib/admin-context'
import { getAdminId } from '~/lib/admin-context'
import { serializeDate } from '~/lib/server-response'

export async function getAdminDashboard(context: AdminContext) {
  const adminId = getAdminId(context)

  const [
    workshopRows,
    staffRows,
    studentRows,
    participantRows,
    attendanceRows,
    certificateRows,
  ] = await Promise.all([
    db
      .select()
      .from(workshops)
      .where(eq(workshops.adminId, adminId))
      .orderBy(desc(workshops.createdAt)),
    db
      .select()
      .from(staff)
      .where(eq(staff.adminId, adminId))
      .orderBy(staff.name),
    db
      .select()
      .from(students)
      .where(eq(students.adminId, adminId))
      .orderBy(students.name),
    db
      .select({
        id: workshopParticipants.id,
        workshopId: workshopParticipants.workshopId,
        studentId: workshopParticipants.studentId,
        status: workshopParticipants.status,
        message: workshopParticipants.message,
        createdAt: workshopParticipants.createdAt,
        workshopName: workshops.name,
        studentName: students.name,
        studentEmail: students.email,
        studentPhone: students.phone,
        studentDocument: students.document,
        studentBirthDate: students.birthDate,
      })
      .from(workshopParticipants)
      .innerJoin(
        workshops,
        eq(workshops.id, workshopParticipants.workshopId),
      )
      .innerJoin(
        students,
        eq(students.id, workshopParticipants.studentId),
      )
      .where(eq(workshops.adminId, adminId))
      .orderBy(desc(workshopParticipants.createdAt)),
    db
      .select({
        id: attendance.id,
        workshopId: attendance.workshopId,
        studentId: attendance.studentId,
        date: attendance.date,
        isPresent: attendance.isPresent,
        workshopName: workshops.name,
        studentName: students.name,
      })
      .from(attendance)
      .innerJoin(workshops, eq(workshops.id, attendance.workshopId))
      .innerJoin(students, eq(students.id, attendance.studentId))
      .where(eq(workshops.adminId, adminId))
      .orderBy(desc(attendance.date)),
    db
      .select({
        id: certificates.id,
        workshopId: certificates.workshopId,
        studentId: certificates.studentId,
        certificateCode: certificates.certificateCode,
        issuedAt: certificates.issuedAt,
        workshopName: workshops.name,
        theme: workshops.theme,
        workload: workshops.workload,
        startDate: workshops.startDate,
        endDate: workshops.endDate,
        studentName: students.name,
      })
      .from(certificates)
      .innerJoin(workshops, eq(workshops.id, certificates.workshopId))
      .innerJoin(students, eq(students.id, certificates.studentId))
      .where(eq(workshops.adminId, adminId))
      .orderBy(desc(certificates.issuedAt)),
  ])

  const workshopIds = workshopRows.map((workshop) => workshop.id)
  const staffLinks = workshopIds.length
    ? await db
        .select({
          workshopId: workshopStaff.workshopId,
          staffId: workshopStaff.staffId,
          name: staff.name,
          type: staff.type,
        })
        .from(workshopStaff)
        .innerJoin(staff, eq(staff.id, workshopStaff.staffId))
        .where(inArray(workshopStaff.workshopId, workshopIds))
    : []

  return {
    workshops: workshopRows.map((workshop) => ({
      ...workshop,
      startDate: serializeDate(workshop.startDate),
      endDate: serializeDate(workshop.endDate),
      createdAt: serializeDate(workshop.createdAt),
      updatedAt: serializeDate(workshop.updatedAt),
      staffIds: staffLinks
        .filter((link) => link.workshopId === workshop.id)
        .map((link) => link.staffId),
      staff: staffLinks.filter(
        (link) => link.workshopId === workshop.id,
      ),
    })),
    staff: staffRows.map((person) => ({
      ...person,
      createdAt: serializeDate(person.createdAt),
      updatedAt: serializeDate(person.updatedAt),
    })),
    students: studentRows.map((student) => ({
      ...student,
      birthDate: serializeDate(student.birthDate),
      createdAt: serializeDate(student.createdAt),
      updatedAt: serializeDate(student.updatedAt),
    })),
    participants: participantRows.map((participant) => ({
      ...participant,
      createdAt: serializeDate(participant.createdAt),
      studentBirthDate: serializeDate(participant.studentBirthDate),
    })),
    attendance: attendanceRows.map((record) => ({
      ...record,
      date: serializeDate(record.date),
    })),
    certificates: certificateRows.map((certificate) => ({
      ...certificate,
      issuedAt: serializeDate(certificate.issuedAt),
      startDate: serializeDate(certificate.startDate),
      endDate: serializeDate(certificate.endDate),
    })),
  }
}
