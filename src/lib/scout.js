export const RESEARCH_LEADS = [
  {
    id: 'cj-1',
    title: 'Wholesale Makeup Tools Lead',
    marketplace: 'CJdropshipping',
    url: 'https://www.cjdropshipping.com/list/wholesale-makeup-l-7EAF3E36-620B-4D78-818F-EE80955462A4.html',
    status: 'Draft',
    purchasePrice: 8,
    shipping: 3,
    dutyRate: 0.06,
    taxRate: 0.08,
    packaging: 1.2,
    processing: 0.85,
    adSpend: null,
    refundRisk: 0.05,
    stock: 'Unverified',
    evidence: 'Listing text captured; supplier identity and customs docs pending.',
    destination: 'EU',
    category: 'Beauty accessories',
    reviewNotes: 'Lead is useful for brush and organizer product ranges. Missing supplier verification and shipping quote evidence.'
  },
  {
    id: 'alibaba-1',
    title: 'Beauty Brush Supplier Lead',
    marketplace: 'Alibaba',
    url: 'https://www.alibaba.com/',
    status: 'Needs evidence',
    purchasePrice: 6.5,
    shipping: null,
    dutyRate: 0.07,
    taxRate: 0.08,
    packaging: 1,
    processing: 0.75,
    adSpend: 0.9,
    refundRisk: null,
    stock: 'Unknown',
    evidence: 'Marketplace lead source only; no verified listing, no supplier identity, no customs documentation.',
    destination: 'Morocco',
    category: 'Makeup brushes',
    reviewNotes: 'High potential but must not be approved without a concrete listing URL, supplier proof, and shipping quote.'
  },
  {
    id: '1688-1',
    title: 'Cosmetic Bag Supplier Lead',
    marketplace: '1688',
    url: 'https://www.1688.com/',
    status: 'Draft',
    purchasePrice: 5.2,
    shipping: 2.8,
    dutyRate: null,
    taxRate: 0.07,
    packaging: 1,
    processing: 0.8,
    adSpend: 1.1,
    refundRisk: 0.04,
    stock: 'Unknown',
    evidence: 'Source captured, but no exporter proof or destination shipping docs.',
    destination: 'FR',
    category: 'Cosmetic bags',
    reviewNotes: 'Potentially attractive margin. Supplier evidence and shipping guarantee remain incomplete.'
  }
];

export function formatCurrency(value, currency = 'EUR') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'Unknown';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(Number(value));
}

export function calculateLandedCost({
  purchasePrice,
  supplierShipping,
  duties,
  taxes,
  packaging,
  paymentFees,
  ads,
  refunds,
  sellingPrice,
  currency = 'EUR'
}) {
  const known = {
    purchasePrice: Number(purchasePrice ?? 0),
    supplierShipping: Number(supplierShipping ?? 0),
    duties: Number(duties ?? 0),
    taxes: Number(taxes ?? 0),
    packaging: Number(packaging ?? 0),
    paymentFees: Number(paymentFees ?? 0),
    ads: Number(ads ?? 0),
    refunds: Number(refunds ?? 0)
  };

  const missingCosts = [];
  if (purchasePrice === null || purchasePrice === undefined) missingCosts.push('Product purchase price');
  if (supplierShipping === null || supplierShipping === undefined) missingCosts.push('Supplier shipping');
  if (duties === null || duties === undefined) missingCosts.push('Duties and import charges');
  if (taxes === null || taxes === undefined) missingCosts.push('Taxes handled by the merchant');
  if (packaging === null || packaging === undefined) missingCosts.push('Packaging');
  if (paymentFees === null || paymentFees === undefined) missingCosts.push('Payment processing fees');
  if (ads === null || ads === undefined) missingCosts.push('Advertising costs');
  if (refunds === null || refunds === undefined) missingCosts.push('Expected refunds and defects');

  const totalLandedCost =
    known.purchasePrice +
    known.supplierShipping +
    known.duties +
    known.taxes +
    known.packaging +
    known.paymentFees +
    known.ads +
    known.refunds;

  const contributionPerOrder = Number(sellingPrice ?? 0) - totalLandedCost;
  const contributionMargin = sellingPrice ? (contributionPerOrder / Number(sellingPrice)) * 100 : 0;

  return {
    totalLandedCost,
    contributionPerOrder,
    contributionMargin,
    missingCosts,
    assumptions: [
      'Unknown costs are never treated as zero.',
      'Costs are summed once per order only.',
      'The contribution metric excludes unknown values from the total.'
    ],
    calculation: {
      ...known,
      currency
    }
  };
}

export function evaluateCompliance(candidate) {
  const required = [
    'listingUrl',
    'supplier',
    'destination',
    'category',
    'evidence',
    'shippingQuote',
    'supplierDocuments'
  ];

  const missing = [];
  required.forEach((field) => {
    const value = candidate[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(field);
    }
  });

  const approved = missing.length === 0 && candidate.status === 'Approved';
  return {
    approved,
    missing,
    result: approved ? 'Ready for approval' : 'Evidence missing or review incomplete'
  };
}

export function buildCsv(rows) {
  const headers = Object.keys(rows[0] || {});
  const csvRows = [headers.join(',')];
  rows.forEach((row) => {
    csvRows.push(
      headers
        .map((key) => {
          const value = row[key] ?? '';
          const safe = String(value).replace(/"/g, '""');
          return `"${safe}"`;
        })
        .join(',')
    );
  });
  return csvRows.join('\n');
}

export function buildJson(rows) {
  return JSON.stringify(rows, null, 2);
}

export function isDuplicateListing(listings, candidate) {
  const normalized = candidate.url?.trim().toLowerCase();
  if (!normalized) return false;
  return listings.some((item) => item.url?.trim().toLowerCase() === normalized);
}

export function isShippingQuoteStale(lastUpdated, days = 14) {
  if (!lastUpdated) return true;
  const delta = Date.now() - new Date(lastUpdated).getTime();
  return delta > days * 24 * 60 * 60 * 1000;
}

export function createAccessToken(user, password) {
  return `${user}:${password}`;
}

export function isAdminAuthorized(user, password) {
  const envUser = import.meta.env?.VITE_ADMIN_USER || 'velour-admin';
  const envPass = import.meta.env?.VITE_ADMIN_PASS || 'change-me-in-production';
  return user === envUser && password === envPass;
}
