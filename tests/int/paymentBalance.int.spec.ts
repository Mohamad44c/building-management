import { describe, expect, it } from 'vitest'
import { effectiveAmountPaid, remainingBalance, resolvePaidState } from '@/lib/dieselExpenseBalance'

describe('effectiveAmountPaid', () => {
  it('treats legacy rows (isPaid true, amountPaid backfilled to 0) as fully paid', () => {
    expect(effectiveAmountPaid({ totalAmount: 1050, amountPaid: 0, isPaid: true })).toBe(1050)
    expect(remainingBalance({ totalAmount: 1050, amountPaid: 0, isPaid: true })).toBe(0)
  })

  it('uses amountPaid for partial payments', () => {
    expect(effectiveAmountPaid({ totalAmount: 2900, amountPaid: 1450, isPaid: false })).toBe(1450)
    expect(remainingBalance({ totalAmount: 2900, amountPaid: 1450, isPaid: false })).toBe(1450)
  })

  it('clamps amountPaid to [0, total]', () => {
    expect(effectiveAmountPaid({ totalAmount: 100, amountPaid: 150, isPaid: false })).toBe(100)
    expect(effectiveAmountPaid({ totalAmount: 100, amountPaid: -5, isPaid: false })).toBe(0)
  })
})

describe('resolvePaidState', () => {
  const paid = { totalAmount: 700, amountPaid: 700, isPaid: true }

  it('create: ticking isPaid pays in full', () => {
    expect(resolvePaidState(700, { isPaid: true, amountPaid: 0 }, undefined)).toEqual({ amountPaid: 700, isPaid: true })
  })

  it('create: partial amount', () => {
    expect(resolvePaidState(700, { isPaid: false, amountPaid: 300 }, undefined)).toEqual({ amountPaid: 300, isPaid: false })
  })

  it('total grows on a paid invoice (admin resubmits isPaid true) → becomes partial', () => {
    expect(resolvePaidState(1400, { isPaid: true, amountPaid: 700 }, paid)).toEqual({ amountPaid: 700, isPaid: false })
  })

  it('unticking isPaid in the admin form (amount resubmitted unchanged) reopens the invoice', () => {
    expect(resolvePaidState(700, { isPaid: false, amountPaid: 700 }, paid)).toEqual({ amountPaid: 0, isPaid: false })
  })

  it('unticking isPaid while entering a new amount keeps that amount', () => {
    expect(resolvePaidState(700, { isPaid: false, amountPaid: 300 }, paid)).toEqual({ amountPaid: 300, isPaid: false })
  })

  it('ticking isPaid on a partial invoice pays in full', () => {
    const partial = { totalAmount: 700, amountPaid: 300, isPaid: false }
    expect(resolvePaidState(700, { isPaid: true, amountPaid: 300 }, partial)).toEqual({ amountPaid: 700, isPaid: true })
  })

  it('editing the amount on a paid invoice while isPaid stays ticked uses the new amount', () => {
    expect(resolvePaidState(700, { isPaid: true, amountPaid: 500 }, paid)).toEqual({ amountPaid: 500, isPaid: false })
  })

  it('saving a legacy row unchanged keeps it paid', () => {
    const legacy = { totalAmount: 1050, amountPaid: 0, isPaid: true }
    expect(resolvePaidState(1050, { isPaid: true, amountPaid: 0 }, legacy)).toEqual({ amountPaid: 1050, isPaid: true })
  })

  it('partial API update without payment fields keeps the existing payment', () => {
    const partial = { totalAmount: 700, amountPaid: 300, isPaid: false }
    expect(resolvePaidState(700, {}, partial)).toEqual({ amountPaid: 300, isPaid: false })
  })

  it('API update { isPaid: false } reopens, { isPaid: true } pays in full', () => {
    expect(resolvePaidState(700, { isPaid: false }, paid)).toEqual({ amountPaid: 0, isPaid: false })
    const unpaid = { totalAmount: 700, amountPaid: 0, isPaid: false }
    expect(resolvePaidState(700, { isPaid: true }, unpaid)).toEqual({ amountPaid: 700, isPaid: true })
  })

  it('total shrinks below what was paid → clamped and paid', () => {
    const partial = { totalAmount: 1400, amountPaid: 700, isPaid: false }
    expect(resolvePaidState(600, { isPaid: false, amountPaid: 700 }, partial)).toEqual({ amountPaid: 600, isPaid: true })
  })

  it('zero total is never paid', () => {
    expect(resolvePaidState(0, { isPaid: true }, undefined)).toEqual({ amountPaid: 0, isPaid: false })
  })
})
