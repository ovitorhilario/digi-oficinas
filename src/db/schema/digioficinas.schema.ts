import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from './auth.schema'

export const workshopStatusEnum = pgEnum('workshop_status', [
  'planned',
  'in_progress',
  'finished',
  'cancelled',
])

export const staffTypeEnum = pgEnum('staff_type', [
  'teacher',
  'tutor',
])

export const participantStatusEnum = pgEnum('participant_status', [
  'pending',
  'approved',
  'rejected',
  'participant',
  'completed',
  'cancelled',
])

export const workshops = pgTable(
  'workshops',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    adminId: text('admin_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull(),
    theme: text('theme').notNull(),
    imageUrl: text('image_url'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    workload: integer('workload').notNull(),
    status: workshopStatusEnum('status').default('planned').notNull(),
    vacancies: integer('vacancies'),
    isPublic: boolean('is_public').default(true).notNull(),
    showParticipants: boolean('show_participants')
      .default(false)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('workshops_admin_id_idx').on(table.adminId),
    index('workshops_public_status_idx').on(
      table.isPublic,
      table.status,
    ),
    check('workshops_workload_positive', sql`${table.workload} > 0`),
    check(
      'workshops_vacancies_positive',
      sql`${table.vacancies} is null or ${table.vacancies} > 0`,
    ),
  ],
)

export const staff = pgTable(
  'staff',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    adminId: text('admin_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    type: staffTypeEnum('type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('staff_admin_id_idx').on(table.adminId),
    index('staff_admin_type_idx').on(table.adminId, table.type),
  ],
)

export const students = pgTable(
  'students',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    adminId: text('admin_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    document: text('document'),
    birthDate: date('birth_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('students_admin_id_idx').on(table.adminId),
    index('students_admin_email_idx').on(table.adminId, table.email),
  ],
)

export const workshopStaff = pgTable(
  'workshop_staff',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workshopId: uuid('workshop_id')
      .notNull()
      .references(() => workshops.id, { onDelete: 'cascade' }),
    staffId: uuid('staff_id')
      .notNull()
      .references(() => staff.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('workshop_staff_unique_idx').on(
      table.workshopId,
      table.staffId,
    ),
    index('workshop_staff_workshop_id_idx').on(table.workshopId),
    index('workshop_staff_staff_id_idx').on(table.staffId),
  ],
)

export const workshopParticipants = pgTable(
  'workshop_participants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workshopId: uuid('workshop_id')
      .notNull()
      .references(() => workshops.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    status: participantStatusEnum('status')
      .default('pending')
      .notNull(),
    message: text('message'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('workshop_participants_unique_idx').on(
      table.workshopId,
      table.studentId,
    ),
    index('workshop_participants_workshop_status_idx').on(
      table.workshopId,
      table.status,
    ),
    index('workshop_participants_student_id_idx').on(table.studentId),
  ],
)

export const attendance = pgTable(
  'attendance',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workshopId: uuid('workshop_id')
      .notNull()
      .references(() => workshops.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    isPresent: boolean('is_present').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('attendance_unique_idx').on(
      table.workshopId,
      table.studentId,
      table.date,
    ),
    index('attendance_workshop_id_idx').on(table.workshopId),
    index('attendance_student_id_idx').on(table.studentId),
  ],
)

export const certificates = pgTable(
  'certificates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workshopId: uuid('workshop_id')
      .notNull()
      .references(() => workshops.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    issuedAt: timestamp('issued_at').defaultNow().notNull(),
    certificateCode: text('certificate_code').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('certificates_workshop_student_unique_idx').on(
      table.workshopId,
      table.studentId,
    ),
    index('certificates_workshop_id_idx').on(table.workshopId),
    index('certificates_student_id_idx').on(table.studentId),
  ],
)

export const workshopsRelations = relations(
  workshops,
  ({ many }) => ({
    staffLinks: many(workshopStaff),
    participants: many(workshopParticipants),
    attendance: many(attendance),
    certificates: many(certificates),
  }),
)

export const staffRelations = relations(staff, ({ many }) => ({
  workshopLinks: many(workshopStaff),
}))

export const studentsRelations = relations(students, ({ many }) => ({
  participations: many(workshopParticipants),
  attendance: many(attendance),
  certificates: many(certificates),
}))

export const workshopStaffRelations = relations(
  workshopStaff,
  ({ one }) => ({
    workshop: one(workshops, {
      fields: [workshopStaff.workshopId],
      references: [workshops.id],
    }),
    staff: one(staff, {
      fields: [workshopStaff.staffId],
      references: [staff.id],
    }),
  }),
)

export const workshopParticipantsRelations = relations(
  workshopParticipants,
  ({ one }) => ({
    workshop: one(workshops, {
      fields: [workshopParticipants.workshopId],
      references: [workshops.id],
    }),
    student: one(students, {
      fields: [workshopParticipants.studentId],
      references: [students.id],
    }),
  }),
)
