const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
]

const SCALES = ['', 'Thousand', 'Million', 'Billion']

const chunkToWords = (n: number): string => {
  const parts: string[] = []
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`)
    n %= 100
  }
  if (n >= 20) {
    const tens = TENS[Math.floor(n / 10)]
    const ones = n % 10
    parts.push(ones ? `${tens}-${ONES[ones]}` : tens)
  } else if (n > 0) {
    parts.push(ONES[n])
  }
  return parts.join(' ')
}

const integerToWords = (value: number): string => {
  if (value === 0) return 'Zero'

  const chunks: number[] = []
  let remaining = value
  while (remaining > 0) {
    chunks.push(remaining % 1000)
    remaining = Math.floor(remaining / 1000)
  }

  const words = chunks
    .map((chunk, index) => (chunk === 0 ? '' : `${chunkToWords(chunk)} ${SCALES[index]}`.trim()))
    .filter(Boolean)
    .reverse()

  return words.join(' ')
}

export const amountToEnglishWords = (amount: number, currency = 'US Dollars'): string => {
  const safeAmount = Number.isFinite(amount) ? Math.abs(amount) : 0
  const dollars = Math.floor(safeAmount)
  const cents = Math.round((safeAmount - dollars) * 100)

  const dollarsWords = `${integerToWords(dollars)} ${currency}`
  const centsWords = cents > 0 ? ` and ${integerToWords(cents)} Cents` : ''

  return `${dollarsWords}${centsWords} Only`
}
