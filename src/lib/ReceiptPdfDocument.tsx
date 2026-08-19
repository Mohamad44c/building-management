import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import { amountToEnglishWords } from './numberToWords'

export type ReceiptPdfProps = {
  receiptNumber: string
  issueDate: string
  tenantName: string
  buildingName: string
  periodMonth: number
  periodYear: number
  amountPaid: number
  totalAmount: number
  remainingBalance: number
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
const ACCENT = '#15803d'

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
  cellLabel: {
    flex: 1,
  },
  cellAmount: {
    width: 110,
    textAlign: 'right',
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
    color: ACCENT,
    textAlign: 'center',
    letterSpacing: 4,
  },
})

const formatCurrency = (n: number): string => `$${n.toFixed(2)} ${CURRENCY_CODE}`

const formatDate = (isoDate: string): string => {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return '—'
  const month = MONTH_NAMES[d.getUTCMonth()]
  return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

export const ReceiptPdfDocument = ({
  receiptNumber,
  issueDate,
  tenantName,
  buildingName,
  periodMonth,
  periodYear,
  amountPaid,
  totalAmount,
  remainingBalance,
}: ReceiptPdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.brandFixed} fixed>
        Elissar Building
      </Text>

      <View style={styles.banner}>
        <View>
          <Text style={styles.title}>Receipt</Text>
          <Text style={styles.subtitle}>
            For {MONTH_NAMES[periodMonth - 1] ?? periodMonth} {periodYear} invoice
          </Text>
        </View>
        <View style={styles.bannerRight}>
          <Text style={styles.bannerRightLabel}>Receipt No.</Text>
          <Text style={styles.bannerRightValue}>{receiptNumber}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerBlock}>
            <Text style={styles.headerLabel}>Received From</Text>
            <Text style={styles.headerValue}>{tenantName}</Text>
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.headerLabel}>Building</Text>
            <Text style={styles.headerValue}>{buildingName}</Text>
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.headerLabel}>Date Issued</Text>
            <Text style={styles.headerValue}>{formatDate(issueDate)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Invoice Total</Text>
            <Text style={styles.cellAmount}>{formatCurrency(totalAmount)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellLabel}>Remaining Balance</Text>
            <Text style={styles.cellAmount}>{formatCurrency(remainingBalance)}</Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Amount Received</Text>
          <Text style={styles.totalAmount}>{formatCurrency(amountPaid)}</Text>
        </View>
        <Text style={styles.amountInWords}>Amount in words: {amountToEnglishWords(amountPaid)}</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your payment.</Text>
          {remainingBalance <= 0 ? <Text style={styles.paidStamp}>PAID IN FULL</Text> : null}
        </View>
      </View>
    </Page>
  </Document>
)

export async function renderReceiptPdfBuffer(props: ReceiptPdfProps): Promise<Buffer> {
  return renderToBuffer(<ReceiptPdfDocument {...props} />)
}
