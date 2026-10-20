/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import { entryBalanceCents, entryFeeCents } from '../src/constants/entryFee';
import { nextActionFor } from '../src/react/hooks/useEntryStatus';
import {
  adminPaymentLabel,
  adminPaymentStatus,
} from '../src/react/utils/adminPaymentStatus';

describe('entryFeeCents', () => {
  test.each([
    [0, 0],
    [1, 2000],
    [2, 3000],
    [5, 3000],
  ])('%i categories cost %i cents', (categories, cents) => {
    expect(entryFeeCents(categories)).toBe(cents);
  });
});

describe('entryBalanceCents', () => {
  test.each([
    // categories, paid, balance
    [1, 0, 2000],
    [2, 0, 3000],
    [1, 2000, 0],
    [2, 2000, 1000], // paid for one, added a second: the top up
    [3, 2000, 1000],
    [2, 3000, 0], // the Tatsuro case once his 10 is recorded
    [1, 3000, -1000], // removed a category after paying 30: no refund
    [0, 2000, -2000],
  ])('%i categories, %i paid owes %i', (categories, paid, balance) => {
    expect(entryBalanceCents(categories, paid)).toBe(balance);
  });
});

describe('nextActionFor', () => {
  test('nothing uploaded asks for an upload', () => {
    expect(nextActionFor('active', 0, 0, 0)).toBe('upload');
  });
  test('unpaid entry asks for the first payment', () => {
    expect(nextActionFor('active', 1, 0, 2000)).toBe('pay');
  });
  test('paid entry with a new category asks for the top up', () => {
    expect(nextActionFor('active', 3, 2000, 1000)).toBe('topup');
  });
  test('fully paid entry is settled', () => {
    expect(nextActionFor('active', 3, 3000, 0)).toBe('settled');
  });
  test('overpaid entry is settled', () => {
    expect(nextActionFor('active', 1, 3000, -1000)).toBe('settled');
  });
  test('paid entrant who deleted everything is asked to upload again', () => {
    expect(nextActionFor('active', 0, 2000, -2000)).toBe('upload');
  });
  test('settled stays settled after the contest closes', () => {
    expect(nextActionFor('assessment', 2, 3000, 0)).toBe('settled');
  });
  test('unpaid or underpaid entry is closed after the contest closes', () => {
    expect(nextActionFor('assessment', 2, 0, 3000)).toBe('closed');
    expect(nextActionFor('inactive', 2, 2000, 1000)).toBe('closed');
  });
});

describe('adminPaymentStatus', () => {
  test('unpaid', () => {
    const totals = { paidCents: 0, balanceCents: 2000 };
    expect(adminPaymentStatus(totals)).toBe('unpaid');
    expect(adminPaymentLabel(totals)).toBe('Non pagato');
  });
  test('balance due', () => {
    const totals = { paidCents: 2000, balanceCents: 1000 };
    expect(adminPaymentStatus(totals)).toBe('due');
    expect(adminPaymentLabel(totals)).toBe('Da saldare €10.00');
  });
  test('paid', () => {
    const totals = { paidCents: 3000, balanceCents: 0 };
    expect(adminPaymentStatus(totals)).toBe('paid');
    expect(adminPaymentLabel(totals)).toBe('Pagato');
  });
});
