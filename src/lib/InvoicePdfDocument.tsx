import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import type { InvoiceLineItem } from './invoiceCalc'

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

const ACCENT = '#1d4ed8'

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  banner: {
    backgroundColor: ACCENT,
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  issuer: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#dbeafe',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#dbeafe',
    marginTop: 4,
  },
  bannerRight: {
    alignItems: 'flex-end',
  },
  bannerRightLabel: {
    fontSize: 9,
    color: '#dbeafe',
    marginBottom: 2,
  },
  bannerRightValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
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
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 3,
  },
  cellLabel: {
    flex: 1,
  },
  cellAmount: {
    width: 100,
    textAlign: 'right',
  },
  headerCellText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#ffffff',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 3,
  },
  totalLabel: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: ACCENT,
  },
  totalAmount: {
    width: 100,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: ACCENT,
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

const formatCurrency = (n: number): string => `$${n.toFixed(2)}`

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
      <View style={styles.banner}>
        <View>
          <Text style={styles.title}>Invoice</Text>
          <Text style={styles.issuer}>Elissar Building</Text>
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
            <Text style={[styles.cellAmount, styles.headerCellText]}>Amount</Text>
          </View>
          {lineItems.map((item, index) => (
            <View
              style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
              key={`${item.label}-${index}`}
            >
              <Text style={styles.cellLabel}>{item.label}</Text>
              <Text style={styles.cellAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>

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
