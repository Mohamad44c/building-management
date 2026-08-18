import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import type { InvoiceLineItem } from './invoiceCalc'
import { amountToEnglishWords } from './numberToWords'

export type InvoicePdfProps = {
  tenantName: string
  buildingName: string
  periodMonth: number
  periodYear: number
  dueDate?: string | null
  lineItems: InvoiceLineItem[]
  totalAmount: number
  isPaid?: boolean | null
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const CURRENCY_CODE = 'USD'
const ACCENT = '#1d4ed8'

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  brandFixed: {
    position: 'absolute',
    top: 24,
    left: 40,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
  },
  banner: {
    paddingHorizontal: 40,
    paddingTop: 56,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
  },
  subtitle: {
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
  },
  bannerRight: {
    alignItems: 'flex-end',
  },
  bannerRightLabel: {
    fontSize: 9,
    color: '#888888',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  bannerRightValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
  },
  body: {
    padding: 40,
    paddingTop: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBlock: {
    flexDirection: 'column',
  },
  headerLabel: {
    fontSize: 9,
    color: '#888888',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  headerValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    marginTop: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1a1a1a',
  },
  cellLabel: {
    flex: 1,
  },
  cellAmount: {
    width: 110,
    textAlign: 'right',
  },
  headerCellText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#1a1a1a',
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderTopWidth: 1.5,
    borderTopColor: ACCENT,
  },
  totalLabel: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: ACCENT,
  },
  totalAmount: {
    width: 110,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: ACCENT,
  },
  amountInWords: {
    marginTop: 8,
    paddingHorizontal: 12,
    fontSize: 9,
    fontFamily: 'Helvetica-Oblique',
    color: '#555555',
  },
  footer: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 9,
    color: '#999999',
    textAlign: 'center',
  },
  paidStamp: {
    marginTop: 20,
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
    textAlign: 'center',
    letterSpacing: 4,
  },
})

const formatCurrency = (n: number): string => `$${n.toFixed(2)} ${CURRENCY_CODE}`

const formatDueDate = (dueDate?: string | null): string => {
  if (!dueDate) return '—'
  const d = new Date(dueDate)
  if (Number.isNaN(d.getTime())) return '—'
  const month = MONTH_NAMES[d.getUTCMonth()]
  return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

export const InvoicePdfDocument = ({
  tenantName,
  buildingName,
  periodMonth,
  periodYear,
  dueDate,
  lineItems,
  totalAmount,
  isPaid,
}: InvoicePdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.brandFixed} fixed>
        Elissar Building
      </Text>

      <View style={styles.banner}>
        <View>
          <Text style={styles.title}>Invoice</Text>
          <Text style={styles.subtitle}>
            {MONTH_NAMES[periodMonth - 1] ?? periodMonth} {periodYear}
          </Text>
        </View>
        <View style={styles.bannerRight}>
          <Text style={styles.bannerRightLabel}>Due Date</Text>
          <Text style={styles.bannerRightValue}>{formatDueDate(dueDate)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerBlock}>
            <Text style={styles.headerLabel}>Billed To</Text>
            <Text style={styles.headerValue}>{tenantName}</Text>
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.headerLabel}>Building</Text>
            <Text style={styles.headerValue}>{buildingName}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.cellLabel, styles.headerCellText]}>Description</Text>
            <Text style={[styles.cellAmount, styles.headerCellText]}>Amount ({CURRENCY_CODE})</Text>
          </View>
          {lineItems.map((item, index) => (
            <View style={styles.tableRow} key={`${item.label}-${index}`}>
              <Text style={styles.cellLabel}>{item.label}</Text>
              <Text style={styles.cellAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>
        <Text style={styles.amountInWords}>
          Amount in words: {amountToEnglishWords(totalAmount)}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business.</Text>
          {isPaid ? <Text style={styles.paidStamp}>PAID</Text> : null}
        </View>
      </View>
    </Page>
  </Document>
)

export async function renderInvoicePdfBuffer(props: InvoicePdfProps): Promise<Buffer> {
  return renderToBuffer(<InvoicePdfDocument {...props} />)
}
