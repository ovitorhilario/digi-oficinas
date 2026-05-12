import type { DashboardData } from '../../-lib/dashboard'

export type CertificatePrintData = Pick<
  DashboardData['certificates'][number],
  | 'certificateCode'
  | 'endDate'
  | 'issuedAt'
  | 'startDate'
  | 'studentName'
  | 'theme'
  | 'workload'
  | 'workshopName'
>

type CertificateSelection = {
  workshopId: string
  studentId: string
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : new Date(value)

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
  }).format(date)
}

function formatPeriod(
  startDate: string | null,
  endDate: string | null,
) {
  if (!startDate && !endDate) {
    return ''
  }

  if (startDate === endDate || !endDate) {
    return formatDate(startDate)
  }

  if (!startDate) {
    return formatDate(endDate)
  }

  return `${formatDate(startDate)} a ${formatDate(endDate)}`
}

export function buildIssuedCertificateData(
  data: DashboardData,
  selection: CertificateSelection,
  certificateCode: string,
): CertificatePrintData | null {
  const workshop = data.workshops.find(
    (item) => item.id === selection.workshopId,
  )
  const participant = data.participants.find(
    (item) =>
      item.workshopId === selection.workshopId &&
      item.studentId === selection.studentId,
  )
  const student = data.students.find(
    (item) => item.id === selection.studentId,
  )

  if (!workshop || (!participant && !student)) {
    return null
  }

  return {
    certificateCode,
    endDate: workshop.endDate,
    issuedAt: new Date().toISOString(),
    startDate: workshop.startDate,
    studentName: participant?.studentName ?? student?.name ?? '',
    theme: workshop.theme,
    workload: workshop.workload,
    workshopName: workshop.name,
  }
}

export function openCertificatePdf(
  certificate: CertificatePrintData,
  targetWindow?: Window | null,
) {
  const printWindow = targetWindow ?? window.open('', '_blank')

  if (!printWindow) {
    return false
  }

  const period = formatPeriod(
    certificate.startDate,
    certificate.endDate,
  )
  const issuedAt = formatDate(certificate.issuedAt)

  printWindow.document.open()
  printWindow.document.write(`
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Certificado ${escapeHtml(certificate.certificateCode)}</title>
    <style>
      @page {
        size: A4 landscape;
        margin: 0;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #eef2f6;
        color: #18212f;
        font-family: Inter, Arial, Helvetica, sans-serif;
      }

      .page {
        width: 297mm;
        height: 210mm;
        display: grid;
        place-items: center;
        padding: 14mm;
        background:
          linear-gradient(135deg, rgba(15, 118, 110, 0.1), transparent 34%),
          linear-gradient(315deg, rgba(37, 99, 235, 0.12), transparent 38%),
          #f8fafc;
      }

      .certificate {
        width: 100%;
        height: 100%;
        border: 2px solid #0f766e;
        outline: 1px solid rgba(15, 118, 110, 0.35);
        outline-offset: -8px;
        background: rgba(255, 255, 255, 0.92);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 18mm 20mm 14mm;
      }

      .brand {
        color: #0f766e;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .eyebrow {
        color: #64748b;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      h1 {
        margin: 16mm 0 8mm;
        color: #0f172a;
        font-size: 40px;
        font-weight: 800;
        letter-spacing: 0;
        text-align: center;
      }

      .text {
        max-width: 220mm;
        margin: 0 auto;
        color: #334155;
        font-size: 19px;
        line-height: 1.65;
        text-align: center;
      }

      .student {
        display: block;
        margin: 5mm 0;
        color: #0f172a;
        font-size: 31px;
        font-weight: 800;
      }

      .details {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4mm;
        margin-top: 12mm;
      }

      .detail {
        border-top: 1px solid #cbd5e1;
        padding-top: 3mm;
      }

      .label {
        color: #64748b;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .value {
        margin-top: 1.5mm;
        color: #0f172a;
        font-size: 13px;
        font-weight: 700;
      }

      .footer {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 8mm;
        color: #475569;
        font-size: 12px;
      }

      .signature {
        min-width: 75mm;
        border-top: 1px solid #94a3b8;
        padding-top: 3mm;
        text-align: center;
      }

      @media print {
        body {
          background: white;
        }

        .page {
          padding: 14mm;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="certificate" aria-label="Certificado">
        <header>
          <div class="brand">DigiEventos</div>
          <div class="eyebrow">Certificado de participacao</div>
        </header>

        <div>
          <h1>Certificado</h1>
          <p class="text">
            A DigiEventos certifica que
            <span class="student">${escapeHtml(certificate.studentName)}</span>
            participou da oficina <strong>${escapeHtml(certificate.workshopName)}</strong>,
            com tema <strong>${escapeHtml(certificate.theme)}</strong>,
            realizada ${period ? `no periodo de <strong>${escapeHtml(period)}</strong>` : ''},
            totalizando <strong>${escapeHtml(certificate.workload)} horas</strong> de carga horaria.
          </p>

          <div class="details">
            <div class="detail">
              <div class="label">Oficina</div>
              <div class="value">${escapeHtml(certificate.workshopName)}</div>
            </div>
            <div class="detail">
              <div class="label">Tema</div>
              <div class="value">${escapeHtml(certificate.theme)}</div>
            </div>
            <div class="detail">
              <div class="label">Carga horaria</div>
              <div class="value">${escapeHtml(certificate.workload)}h</div>
            </div>
            <div class="detail">
              <div class="label">Codigo</div>
              <div class="value">${escapeHtml(certificate.certificateCode)}</div>
            </div>
          </div>
        </div>

        <footer class="footer">
          <div>
            Emitido em ${escapeHtml(issuedAt)}<br />
            Codigo de autenticidade: ${escapeHtml(certificate.certificateCode)}
          </div>
          <div class="signature">DigiEventos</div>
        </footer>
      </section>
    </main>
    <script>
      window.addEventListener('load', () => {
        window.focus()
        setTimeout(() => window.print(), 300)
      })
    </script>
  </body>
</html>`)
  printWindow.document.close()

  return true
}
