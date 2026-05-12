import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  buildIssuedCertificateData,
  openCertificatePdf,
} from './certificate-pdf'

function createDashboardData() {
  return {
    workshops: [
      {
        id: 'workshop-1',
        name: 'Programacao Web',
        theme: 'React & TypeScript',
        workload: 16,
        startDate: '2026-06-01',
        endDate: '2026-06-02',
      },
    ],
    participants: [
      {
        workshopId: 'workshop-1',
        studentId: 'student-1',
        studentName: 'Ada Lovelace',
      },
    ],
    students: [
      {
        id: 'student-1',
        name: 'Fallback Student',
      },
    ],
  }
}

describe('certificate-pdf helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-03T10:30:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('builds printable certificate data from dashboard selection', () => {
    expect(
      buildIssuedCertificateData(
        createDashboardData() as never,
        {
          workshopId: 'workshop-1',
          studentId: 'student-1',
        },
        'DIGI-2026-ABC12345',
      ),
    ).toEqual({
      certificateCode: 'DIGI-2026-ABC12345',
      endDate: '2026-06-02',
      issuedAt: '2026-07-03T10:30:00.000Z',
      startDate: '2026-06-01',
      studentName: 'Ada Lovelace',
      theme: 'React & TypeScript',
      workload: 16,
      workshopName: 'Programacao Web',
    })
  })

  it('falls back to the student name when participant data is absent', () => {
    const data = {
      ...createDashboardData(),
      participants: [],
    }

    expect(
      buildIssuedCertificateData(
        data as never,
        {
          workshopId: 'workshop-1',
          studentId: 'student-1',
        },
        'DIGI-2026-ABC12345',
      )?.studentName,
    ).toBe('Fallback Student')
  })

  it('returns null when certificate selection is incomplete', () => {
    expect(
      buildIssuedCertificateData(
        createDashboardData() as never,
        {
          workshopId: 'missing-workshop',
          studentId: 'student-1',
        },
        'DIGI-2026-ABC12345',
      ),
    ).toBeNull()
  })

  it('writes escaped certificate html to the target window', () => {
    const write = vi.fn()
    const targetWindow = {
      document: {
        open: vi.fn(),
        write,
        close: vi.fn(),
      },
    } as unknown as Window

    expect(
      openCertificatePdf(
        {
          certificateCode: 'DIGI-2026-<ABC>',
          endDate: '2026-06-02',
          issuedAt: '2026-07-03T10:30:00.000Z',
          startDate: '2026-06-01',
          studentName: '<Ada>',
          theme: 'React & TypeScript',
          workload: 16,
          workshopName: 'Programacao Web',
        },
        targetWindow,
      ),
    ).toBe(true)

    const html = write.mock.calls[0]?.[0]
    expect(html).toContain('&lt;Ada&gt;')
    expect(html).toContain('React &amp; TypeScript')
    expect(html).toContain('DIGI-2026-&lt;ABC&gt;')
    expect(html).toContain('1 de junho de 2026 a 2 de junho de 2026')
  })

  it('returns false when a print window cannot be opened', () => {
    const windowMock = { open: vi.fn(() => null) }
    vi.stubGlobal('window', windowMock)

    expect(
      openCertificatePdf({
        certificateCode: 'DIGI-2026-ABC12345',
        endDate: '2026-06-02',
        issuedAt: '2026-07-03T10:30:00.000Z',
        startDate: '2026-06-01',
        studentName: 'Ada Lovelace',
        theme: 'React',
        workload: 16,
        workshopName: 'Programacao Web',
      }),
    ).toBe(false)

    expect(windowMock.open).toHaveBeenCalledWith('', '_blank')
  })
})
