import { randomUUID } from 'node:crypto'
import { hashPassword } from 'better-auth/crypto'
import { config } from 'dotenv'
import { eq, sql } from 'drizzle-orm'
import { createDb } from '..'
import { accounts, users } from '../schema/auth.schema'
import {
  attendance,
  certificates,
  staff,
  students,
  workshopParticipants,
  workshopStaff,
  workshops,
} from '../schema/digioficinas.schema'

config({ path: ['.env.local', '.env'] })

const admin = {
  id: '0d0f48de-6de4-4f0f-9120-a908e7a0c001',
  name: 'Administrador DIGIOFICINAS',
  email: 'admin@digioficinas.local',
  password: 'Admin123456',
}

const seededStaff = [
  {
    id: '3e01fd72-16a8-4f1b-9f40-061da0071001',
    name: 'Marina Costa',
    email: 'marina.costa@digioficinas.local',
    phone: '(11) 98888-1001',
    type: 'teacher',
  },
  {
    id: '3e01fd72-16a8-4f1b-9f40-061da0071002',
    name: 'Rafael Nogueira',
    email: 'rafael.nogueira@digioficinas.local',
    phone: '(11) 98888-1002',
    type: 'teacher',
  },
  {
    id: '3e01fd72-16a8-4f1b-9f40-061da0071003',
    name: 'Clara Mendez',
    email: 'clara.mendez@digioficinas.local',
    phone: '(11) 98888-1003',
    type: 'teacher',
  },
  {
    id: '3e01fd72-16a8-4f1b-9f40-061da0071004',
    name: 'Diego Alves',
    email: 'diego.alves@digioficinas.local',
    phone: '(11) 97777-1004',
    type: 'tutor',
  },
  {
    id: '3e01fd72-16a8-4f1b-9f40-061da0071005',
    name: 'Bianca Torres',
    email: 'bianca.torres@digioficinas.local',
    phone: '(11) 97777-1005',
    type: 'tutor',
  },
  {
    id: '3e01fd72-16a8-4f1b-9f40-061da0071006',
    name: 'Otavio Lima',
    email: 'otavio.lima@digioficinas.local',
    phone: '(11) 97777-1006',
    type: 'tutor',
  },
] satisfies Array<{
  id: string
  name: string
  email: string
  phone: string
  type: 'teacher' | 'tutor'
}>

const seededStudents = [
  {
    id: '7b3d31f5-6a3e-44f7-9df8-2c611d002001',
    name: 'Ana Beatriz Rocha',
    email: 'ana.rocha@example.com',
    phone: '(11) 96666-2001',
    document: '123.456.789-01',
    birthDate: '2000-04-12',
  },
  {
    id: '7b3d31f5-6a3e-44f7-9df8-2c611d002002',
    name: 'Bruno Henrique Souza',
    email: 'bruno.souza@example.com',
    phone: '(11) 96666-2002',
    document: '123.456.789-02',
    birthDate: '1998-09-25',
  },
  {
    id: '7b3d31f5-6a3e-44f7-9df8-2c611d002003',
    name: 'Camila Ferreira',
    email: 'camila.ferreira@example.com',
    phone: '(11) 96666-2003',
    document: '123.456.789-03',
    birthDate: '2002-02-03',
  },
  {
    id: '7b3d31f5-6a3e-44f7-9df8-2c611d002004',
    name: 'Daniel Martins',
    email: 'daniel.martins@example.com',
    phone: '(11) 96666-2004',
    document: '123.456.789-04',
    birthDate: '1997-11-18',
  },
  {
    id: '7b3d31f5-6a3e-44f7-9df8-2c611d002005',
    name: 'Eduarda Pires',
    email: 'eduarda.pires@example.com',
    phone: '(11) 96666-2005',
    document: '123.456.789-05',
    birthDate: '2001-07-30',
  },
  {
    id: '7b3d31f5-6a3e-44f7-9df8-2c611d002006',
    name: 'Felipe Andrade',
    email: 'felipe.andrade@example.com',
    phone: '(11) 96666-2006',
    document: '123.456.789-06',
    birthDate: '1999-12-07',
  },
  {
    id: '7b3d31f5-6a3e-44f7-9df8-2c611d002007',
    name: 'Gabriela Moura',
    email: 'gabriela.moura@example.com',
    phone: '(11) 96666-2007',
    document: '123.456.789-07',
    birthDate: '2003-05-14',
  },
  {
    id: '7b3d31f5-6a3e-44f7-9df8-2c611d002008',
    name: 'Henrique Barros',
    email: 'henrique.barros@example.com',
    phone: '(11) 96666-2008',
    document: '123.456.789-08',
    birthDate: '1996-08-21',
  },
] satisfies Array<{
  id: string
  name: string
  email: string
  phone: string
  document: string
  birthDate: string
}>

const seededWorkshops = [
  {
    id: '99f51efa-3cb9-4f4f-a7b9-c0de00003001',
    name: 'Hacking Etico: fundamentos e defesa',
    description:
      'Introducao pratica a seguranca ofensiva, reconhecimento, modelagem de ameacas e boas praticas para proteger sistemas reais.',
    theme: 'Hacking etico',
    imageUrl:
      '/api/uploads/workshops/7d157b6d-a06b-4879-8ec9-03f5b21b4a07.jpg',
    startDate: '2026-11-09',
    endDate: '2026-11-13',
    workload: 20,
    status: 'planned',
    vacancies: 24,
    isPublic: true,
    showParticipants: true,
    staffIds: [
      '3e01fd72-16a8-4f1b-9f40-061da0071001',
      '3e01fd72-16a8-4f1b-9f40-061da0071004',
    ],
  },
  {
    id: '99f51efa-3cb9-4f4f-a7b9-c0de00003002',
    name: 'Macintosh Lab: historia, design e produtividade',
    description:
      'Uma oficina para explorar a evolucao do Macintosh, fundamentos de interface, organizacao de fluxo de trabalho e uso criativo do ecossistema Apple.',
    theme: 'Macintosh',
    imageUrl:
      '/api/uploads/workshops/500e9849-87d9-49c8-9dc9-27ddd9404de3.jpg',
    startDate: '2026-11-16',
    endDate: '2026-11-18',
    workload: 12,
    status: 'in_progress',
    vacancies: 18,
    isPublic: true,
    showParticipants: false,
    staffIds: [
      '3e01fd72-16a8-4f1b-9f40-061da0071002',
      '3e01fd72-16a8-4f1b-9f40-061da0071005',
    ],
  },
  {
    id: '99f51efa-3cb9-4f4f-a7b9-c0de00003003',
    name: 'Claude Code para automacao de desenvolvimento',
    description:
      'Laboratorio mao na massa sobre agentes de codigo, revisao assistida, criacao de tarefas e automacoes seguras para equipes de desenvolvimento.',
    theme: 'Claude Code',
    imageUrl:
      '/api/uploads/workshops/eaead8e3-afc3-4a96-a9bc-eacbce1b45f6.jpg',
    startDate: '2026-04-06',
    endDate: '2026-04-10',
    workload: 16,
    status: 'finished',
    vacancies: 20,
    isPublic: true,
    showParticipants: true,
    staffIds: [
      '3e01fd72-16a8-4f1b-9f40-061da0071003',
      '3e01fd72-16a8-4f1b-9f40-061da0071006',
    ],
  },
  {
    id: '99f51efa-3cb9-4f4f-a7b9-c0de00003004',
    name: 'Apolo 11: tecnologia, ciencia e missao lunar',
    description:
      'Oficina sobre a missao Apolo 11, explorando a corrida espacial, o computador de bordo, os desafios de navegacao e o legado cientifico do primeiro pouso humano na Lua.',
    theme: 'Apolo 11',
    imageUrl:
      '/api/uploads/workshops/498a536f-959f-460f-af0e-964bc68164f8.png',
    startDate: '2026-12-07',
    endDate: '2026-12-11',
    workload: 16,
    status: 'planned',
    vacancies: 30,
    isPublic: true,
    showParticipants: true,
    staffIds: [
      '3e01fd72-16a8-4f1b-9f40-061da0071002',
      '3e01fd72-16a8-4f1b-9f40-061da0071006',
    ],
  },
] satisfies Array<{
  id: string
  name: string
  description: string
  theme: string
  imageUrl: string
  startDate: string
  endDate: string
  workload: number
  status: 'planned' | 'in_progress' | 'finished' | 'cancelled'
  vacancies: number
  isPublic: boolean
  showParticipants: boolean
  staffIds: string[]
}>

const seededParticipations = [
  {
    id: 'acd9fdd9-5f08-4639-91f1-000000004001',
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003001',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002001',
    status: 'approved',
    message: 'Tenho interesse em aprender testes de seguranca.',
  },
  {
    id: 'acd9fdd9-5f08-4639-91f1-000000004002',
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003001',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002002',
    status: 'pending',
    message: 'Quero entender como proteger projetos web.',
  },
  {
    id: 'acd9fdd9-5f08-4639-91f1-000000004003',
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003002',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002003',
    status: 'participant',
    message: 'Uso Mac no trabalho e quero melhorar meu fluxo.',
  },
  {
    id: 'acd9fdd9-5f08-4639-91f1-000000004004',
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003002',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002004',
    status: 'participant',
    message: 'Tenho curiosidade sobre a historia do Macintosh.',
  },
  {
    id: 'acd9fdd9-5f08-4639-91f1-000000004005',
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003003',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002005',
    status: 'completed',
    message: 'Quero usar agentes para acelerar revisoes.',
  },
  {
    id: 'acd9fdd9-5f08-4639-91f1-000000004006',
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003003',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002006',
    status: 'completed',
    message: 'Busco exemplos praticos para meu time.',
  },
  {
    id: 'acd9fdd9-5f08-4639-91f1-000000004007',
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003003',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002007',
    status: 'completed',
    message: 'Participei para montar fluxos de automacao.',
  },
] satisfies Array<{
  id: string
  workshopId: string
  studentId: string
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'participant'
    | 'completed'
    | 'cancelled'
  message: string
}>

const seededAttendance = [
  {
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003002',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002003',
    date: '2026-11-16',
    isPresent: true,
  },
  {
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003002',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002004',
    date: '2026-11-16',
    isPresent: false,
  },
  {
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003003',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002005',
    date: '2026-04-06',
    isPresent: true,
  },
  {
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003003',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002006',
    date: '2026-04-06',
    isPresent: true,
  },
  {
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003003',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002007',
    date: '2026-04-06',
    isPresent: true,
  },
] satisfies Array<{
  workshopId: string
  studentId: string
  date: string
  isPresent: boolean
}>

const seededCertificates = [
  {
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003003',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002005',
    certificateCode: 'DIGI-CLAUDE-2026-001',
  },
  {
    workshopId: '99f51efa-3cb9-4f4f-a7b9-c0de00003003',
    studentId: '7b3d31f5-6a3e-44f7-9df8-2c611d002006',
    certificateCode: 'DIGI-CLAUDE-2026-002',
  },
] satisfies Array<{
  workshopId: string
  studentId: string
  certificateCode: string
}>

async function upsertAdmin() {
  const db = createDb()
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, admin.email))
    .limit(1)

  const userId = existingUser[0]?.id ?? admin.id
  const passwordHash = await hashPassword(admin.password)

  await db
    .insert(users)
    .values({
      id: userId,
      name: admin.name,
      email: admin.email,
      emailVerified: true,
      role: 'admin',
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: admin.name,
        emailVerified: true,
        role: 'admin',
      },
    })

  await db.delete(accounts).where(eq(accounts.userId, userId))

  await db.insert(accounts).values({
    id: randomUUID(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: passwordHash,
    updatedAt: new Date(),
  })

  return userId
}

async function seedDigioficinas(adminId: string) {
  const db = createDb()

  await db.transaction(async (tx) => {
    await tx
      .insert(staff)
      .values(seededStaff.map((person) => ({ ...person, adminId })))
      .onConflictDoUpdate({
        target: staff.id,
        set: {
          adminId,
          name: sql.raw('excluded.name'),
          email: sql.raw('excluded.email'),
          phone: sql.raw('excluded.phone'),
          type: sql.raw('excluded.type'),
        },
      })

    await tx
      .insert(students)
      .values(
        seededStudents.map((student) => ({ ...student, adminId })),
      )
      .onConflictDoUpdate({
        target: students.id,
        set: {
          adminId,
          name: sql.raw('excluded.name'),
          email: sql.raw('excluded.email'),
          phone: sql.raw('excluded.phone'),
          document: sql.raw('excluded.document'),
          birthDate: sql.raw('excluded.birth_date'),
        },
      })

    await tx
      .insert(workshops)
      .values(
        seededWorkshops.map(({ staffIds, ...workshop }) => ({
          ...workshop,
          adminId,
        })),
      )
      .onConflictDoUpdate({
        target: workshops.id,
        set: {
          adminId,
          name: sql.raw('excluded.name'),
          description: sql.raw('excluded.description'),
          theme: sql.raw('excluded.theme'),
          imageUrl: sql.raw('excluded.image_url'),
          startDate: sql.raw('excluded.start_date'),
          endDate: sql.raw('excluded.end_date'),
          workload: sql.raw('excluded.workload'),
          status: sql.raw('excluded.status'),
          vacancies: sql.raw('excluded.vacancies'),
          isPublic: sql.raw('excluded.is_public'),
          showParticipants: sql.raw('excluded.show_participants'),
        },
      })

    await tx
      .insert(workshopStaff)
      .values(
        seededWorkshops.flatMap((workshop) =>
          workshop.staffIds.map((staffId) => ({
            id: randomUUID(),
            workshopId: workshop.id,
            staffId,
          })),
        ),
      )
      .onConflictDoNothing({
        target: [workshopStaff.workshopId, workshopStaff.staffId],
      })

    await tx
      .insert(workshopParticipants)
      .values(seededParticipations)
      .onConflictDoUpdate({
        target: [
          workshopParticipants.workshopId,
          workshopParticipants.studentId,
        ],
        set: {
          status: sql.raw('excluded.status'),
          message: sql.raw('excluded.message'),
        },
      })

    await tx
      .insert(attendance)
      .values(seededAttendance)
      .onConflictDoUpdate({
        target: [
          attendance.workshopId,
          attendance.studentId,
          attendance.date,
        ],
        set: {
          isPresent: sql.raw('excluded.is_present'),
        },
      })

    await tx
      .insert(certificates)
      .values(seededCertificates)
      .onConflictDoNothing({
        target: [certificates.workshopId, certificates.studentId],
      })
  })
}

async function runSeed() {
  const adminId = await upsertAdmin()
  await seedDigioficinas(adminId)

  console.log('Seed DIGIOFICINAS concluida:')
  console.log(`Admin: ${admin.email}`)
  console.log(`Senha: ${admin.password}`)
  console.log(`Oficinas: ${seededWorkshops.length}`)
  console.log(`Equipe: ${seededStaff.length}`)
  console.log(`Alunos: ${seededStudents.length}`)
  console.log(`Inscricoes: ${seededParticipations.length}`)
}

runSeed()
  .then(() => {
    console.log('Seed finalizada com sucesso.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro ao gerar seed:', error)
    process.exit(1)
  })
