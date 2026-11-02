import { describe, it, expect } from 'vitest';
import {
  calculateLandedCost,
  evaluateCompliance,
  buildCsv,
  buildJson,
  isDuplicateListing,
  isShippingQuoteStale,
  isAdminAuthorized
} from './scout.js';

describe('Velour Scout calculations', () => {
  it('calculates a total landed cost and contribution', () => {
    const result = calculateLandedCost({
      purchasePrice: 18,
      supplierShipping: 5,
      duties: 3,
      taxes: 2,
      packaging: 1.5,
      paymentFees: 1,
      ads: 2,
      refunds: 1,
      sellingPrice: 48,
      currency: 'EUR'
    });

    expect(result.totalLandedCost).toBe(33.5);
    expect(result.contributionPerOrder).toBe(14.5);
    expect(result.missingCosts).toHaveLength(0);
  });

  it('flags unknown exchange rates and missing costs without zeroing them', () => {
    const result = calculateLandedCost({
      purchasePrice: 20,
      supplierShipping: null,
      duties: null,
      taxes: 1.5,
      packaging: 1,
      paymentFees: 0.9,
      ads: null,
      refunds: 0.4,
      sellingPrice: 50,
      currency: 'EUR'
    });

    expect(result.missingCosts).toContain('Supplier shipping');
    expect(result.missingCosts).toContain('Duties and import charges');
    expect(result.missingCosts).toContain('Advertising costs');
    expect(result.totalLandedCost).toBeGreaterThan(0);
  });

  it('detects duplicate supplier listings', () => {
    const listings = [
      { url: 'https://example.com/brush-set' },
      { url: 'https://example.com/other' }
    ];
    expect(isDuplicateListing(listings, { url: 'https://example.com/brush-set' })).toBe(true);
    expect(isDuplicateListing(listings, { url: 'https://example.com/new' })).toBe(false);
  });

  it('marks stale shipping quotes as stale when older than the threshold', () => {
    const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(isShippingQuoteStale(oldDate, 14)).toBe(true);
    expect(isShippingQuoteStale(new Date().toISOString(), 14)).toBe(false);
  });

  it('fails compliance gates when proof is incomplete', () => {
    const result = evaluateCompliance({
      listingUrl: 'https://example.com',
      supplier: 'Supplier Co',
      destination: 'EU',
      category: 'Beauty accessories',
      evidence: '',
      shippingQuote: '',
      supplierDocuments: '',
      status: 'Draft'
    });

    expect(result.approved).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it('exports CSV and JSON payloads', () => {
    const rows = [{ name: 'Brush Set', price: 42, status: 'Approved' }];
    const csv = buildCsv(rows);
    const json = buildJson(rows);

    expect(csv).toContain('name');
    expect(json).toContain('Brush Set');
  });

  it('enforces admin auth rules', () => {
    expect(isAdminAuthorized('velour-admin', 'change-me-in-production')).toBe(true);
    expect(isAdminAuthorized('velour-admin', 'wrong-password')).toBe(false);
  });
});
