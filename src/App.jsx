import { useEffect, useMemo, useState } from 'react';
import { STORE_PRODUCTS } from './data/products.js';
import { useCart } from './hooks/useCart.js';
import {
  RESEARCH_LEADS,
  calculateLandedCost,
  evaluateCompliance,
  buildCsv,
  buildJson,
  isDuplicateListing,
  isShippingQuoteStale,
  isAdminAuthorized
} from './lib/scout.js';

const formatMoney = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Unknown';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(Number(value));
};

const defaultCandidate = {
  id: crypto.randomUUID(),
  title: 'New product candidate',
  marketplace: 'CJdropshipping',
  url: '',
  status: 'Draft',
  purchasePrice: '',
  shipping: '',
  dutyRate: '',
  taxRate: '',
  packaging: '',
  processing: '',
  ads: '',
  refundRisk: '',
  stock: 'Unknown',
  evidence: '',
  destination: 'EU',
  category: 'Beauty accessories',
  supplier: '',
  supplierDocuments: '',
  shippingQuote: '',
  listingUrl: '',
  reviewNotes: '',
  approved: false,
  lastUpdated: new Date().toISOString()
};

export default function App() {
  const cart = useCart();
  const [page, setPage] = useState('home');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adminAuthorized, setAdminAuthorized] = useState(false);
  const [adminForm, setAdminForm] = useState({ user: '', password: '' });
  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem('velour-scout-candidates');
    return saved ? JSON.parse(saved) : RESEARCH_LEADS;
  });
  const [candidateForm, setCandidateForm] = useState(defaultCandidate);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') || 'home';
    setPage(hash);
    const handle = () => setPage(window.location.hash.replace('#', '') || 'home');
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
  }, []);

  useEffect(() => {
    localStorage.setItem('velour-scout-candidates', JSON.stringify(candidates));
  }, [candidates]);

  const categories = ['All', ...new Set(STORE_PRODUCTS.map((item) => item.category))];

  const filteredProducts = useMemo(() => {
    const byQuery = STORE_PRODUCTS.filter((product) => {
      const haystack = [product.name, product.category, product.description, product.brand].join(' ').toLowerCase();
      return haystack.includes(query.toLowerCase());
    });

    const byCategory = activeCategory === 'All' ? byQuery : byQuery.filter((product) => product.category === activeCategory);

    if (sort === 'low-high') return [...byCategory].sort((a, b) => a.price - b.price);
    if (sort === 'high-low') return [...byCategory].sort((a, b) => b.price - a.price);
    return byCategory;
  }, [query, sort, activeCategory]);

  const handleCheckout = () => {
    window.alert('Checkout is intentionally disabled until a compliant shipping and payment flow is approved for your destination market.');
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const valid = isAdminAuthorized(adminForm.user, adminForm.password);
    if (valid) {
      setAdminAuthorized(true);
      localStorage.setItem('velour-admin-session', 'active');
      return;
    }
    window.alert('Administration access denied. Update VITE_ADMIN_USER and VITE_ADMIN_PASS in your environment.');
  };

  const handleProductToggle = (field, value) => {
    setCandidateForm((current) => ({ ...current, [field]: value }));
  };

  const handleAddCandidate = (event) => {
    event.preventDefault();
    const duplicate = isDuplicateListing(candidates, { url: candidateForm.url });
    if (duplicate) {
      window.alert('This listing URL has already been captured as a duplicate supplier listing.');
      return;
    }
    const nextCandidate = {
      ...candidateForm,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
      approved: false,
      status: candidateForm.status || 'Draft'
    };
    setCandidates((current) => [nextCandidate, ...current]);
    setCandidateForm(defaultCandidate);
  };

  const exportCsv = () => {
    const csvData = buildCsv(candidates.map((item) => ({
      title: item.title,
      marketplace: item.marketplace,
      url: item.url,
      status: item.status,
      destination: item.destination,
      category: item.category,
      purchasePrice: item.purchasePrice,
      shipping: item.shipping,
      evidence: item.evidence
    })));
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'velour-candidates.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const blob = new Blob([buildJson(candidates)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'velour-candidates.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleApprove = (id) => {
    setCandidates((current) => current.map((candidate) => {
      if (candidate.id !== id) return candidate;
      const next = { ...candidate, status: 'Approved', approved: true, reviewNotes: candidate.reviewNotes || 'Approved after review.' };
      return next;
    }));
  };

  const handleReject = (id) => {
    setCandidates((current) => current.map((candidate) => {
      if (candidate.id !== id) return candidate;
      return { ...candidate, status: 'Rejected', approved: false };
    }));
  };

  const onPublicPage = page !== 'scout';

  if (page === 'scout' && !adminAuthorized) {
    return (
      <div className="page-shell scouting-shell">
        <div className="auth-card">
          <div className="eyebrow">Velour Scout administration</div>
          <h1>Access the sourcing dashboard</h1>
          <p>Use your secure environment credentials or the provided local demo values for this workspace.</p>
          <form onSubmit={handleLogin} className="admin-form">
            <label>
              Username
              <input value={adminForm.user} onChange={(e) => setAdminForm({ ...adminForm, user: e.target.value })} placeholder="velour-admin" />
            </label>
            <label>
              Password
              <input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="change-me-in-production" />
            </label>
            <button type="submit">Open dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  if (page === 'scout' && adminAuthorized) {
    return (
      <div className="page-shell">
        <header className="topbar topbar-dark">
          <div className="container nav-row">
            <div className="brand">VELOUR</div>
            <nav className="nav-links">
              <a href="#home">Store</a>
              <a href="#scout">Scout</a>
            </nav>
            <button className="ghost" onClick={() => { setAdminAuthorized(false); localStorage.removeItem('velour-admin-session'); }}>Log out</button>
          </div>
        </header>

        <main className="container scout-layout">
          <aside className="scout-panel">
            <div className="eyebrow">Product capture</div>
            <h2>Research candidate</h2>
            <form onSubmit={handleAddCandidate} className="candidate-form">
              <label>
                Candidate title
                <input value={candidateForm.title} onChange={(e) => handleProductToggle('title', e.target.value)} />
              </label>
              <label>
                Marketplace
                <select value={candidateForm.marketplace} onChange={(e) => handleProductToggle('marketplace', e.target.value)}>
                  <option value="CJdropshipping">CJdropshipping</option>
                  <option value="Alibaba">Alibaba</option>
                  <option value="1688">1688</option>
                  <option value="Supplier portal">Supplier portal</option>
                </select>
              </label>
              <label>
                Exact listing URL
                <input value={candidateForm.url} onChange={(e) => handleProductToggle('url', e.target.value)} placeholder="https://..." />
              </label>
              <label>
                Supplier name
                <input value={candidateForm.supplier} onChange={(e) => handleProductToggle('supplier', e.target.value)} />
              </label>
              <div className="split-fields">
                <label>
                  Product price
                  <input type="number" step="0.01" value={candidateForm.purchasePrice} onChange={(e) => handleProductToggle('purchasePrice', e.target.value)} />
                </label>
                <label>
                  Shipping
                  <input type="number" step="0.01" value={candidateForm.shipping} onChange={(e) => handleProductToggle('shipping', e.target.value)} />
                </label>
              </div>
              <div className="split-fields">
                <label>
                  Duty rate
                  <input type="number" step="0.01" value={candidateForm.dutyRate} onChange={(e) => handleProductToggle('dutyRate', e.target.value)} />
                </label>
                <label>
                  Tax rate
                  <input type="number" step="0.01" value={candidateForm.taxRate} onChange={(e) => handleProductToggle('taxRate', e.target.value)} />
                </label>
              </div>
              <label>
                Destination market
                <select value={candidateForm.destination} onChange={(e) => handleProductToggle('destination', e.target.value)}>
                  <option value="EU">EU</option>
                  <option value="FR">France</option>
                  <option value="Morocco">Morocco</option>
                  <option value="US">United States</option>
                </select>
              </label>
              <label>
                Evidence summary
                <textarea value={candidateForm.evidence} onChange={(e) => handleProductToggle('evidence', e.target.value)} rows="3" />
              </label>
              <label>
                Supplier documents URL or file reference
                <input value={candidateForm.supplierDocuments} onChange={(e) => handleProductToggle('supplierDocuments', e.target.value)} />
              </label>
              <label>
                Shipping quote and outlet details
                <input value={candidateForm.shippingQuote} onChange={(e) => handleProductToggle('shippingQuote', e.target.value)} />
              </label>
              <label>
                Reviewer notes
                <textarea value={candidateForm.reviewNotes} onChange={(e) => handleProductToggle('reviewNotes', e.target.value)} rows="3" />
              </label>
              <button type="submit">Save candidate</button>
            </form>
          </aside>

          <section className="scout-panel large-panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">Product sourcing</div>
                <h2>Live shortlist</h2>
              </div>
              <div className="action-row">
                <button className="secondary" onClick={exportCsv}>Export CSV</button>
                <button className="secondary" onClick={exportJson}>Export JSON</button>
              </div>
            </div>

            <div className="candidate-list">
              {candidates.map((candidate) => {
                const compliance = evaluateCompliance({
                  listingUrl: candidate.url,
                  supplier: candidate.supplier,
                  destination: candidate.destination,
                  category: candidate.category,
                  evidence: candidate.evidence,
                  shippingQuote: candidate.shippingQuote,
                  supplierDocuments: candidate.supplierDocuments,
                  status: candidate.status
                });

                const landed = calculateLandedCost({
                  purchasePrice: candidate.purchasePrice,
                  supplierShipping: candidate.shipping,
                  duties: candidate.dutyRate ? Number(candidate.purchasePrice) * Number(candidate.dutyRate) : null,
                  taxes: candidate.taxRate ? Number(candidate.purchasePrice) * Number(candidate.taxRate) : null,
                  packaging: candidate.packaging || 1,
                  paymentFees: candidate.processing || 0.75,
                  ads: candidate.ads || null,
                  refunds: candidate.refundRisk ? Number(candidate.purchasePrice) * Number(candidate.refundRisk) : null,
                  sellingPrice: 49,
                  currency: 'EUR'
                });

                const staleShipping = isShippingQuoteStale(candidate.lastUpdated, 14);

                return (
                  <article key={candidate.id} className="candidate-item">
                    <div className="candidate-head">
                      <div>
                        <h3>{candidate.title}</h3>
                        <p>{candidate.marketplace}</p>
                      </div>
                      <span className={`status-pill ${candidate.status.toLowerCase().replace(/\s+/g, '-')}`}>{candidate.status}</span>
                    </div>
                    <div className="meta-grid">
                      <div><b>URL</b><span>{candidate.url || 'Missing URL'}</span></div>
                      <div><b>Supplier</b><span>{candidate.supplier || 'Unknown'}</span></div>
                      <div><b>Destination</b><span>{candidate.destination}</span></div>
                      <div><b>Evidence</b><span>{candidate.evidence || 'Missing evidence'}</span></div>
                    </div>
                    <div className="metric-bar">
                      <div>
                        <span>Total landed cost</span>
                        <strong>{formatMoney(landed.totalLandedCost)}</strong>
                      </div>
                      <div>
                        <span>Contribution</span>
                        <strong>{formatMoney(landed.contributionPerOrder)}</strong>
                      </div>
                      <div>
                        <span>Compliance</span>
                        <strong>{compliance.approved ? 'Approved' : 'Gated'}</strong>
                      </div>
                    </div>
                    <div className="risk-line">
                      <span>{compliance.missing.length ? `Missing evidence: ${compliance.missing.join(', ')}` : 'All required evidence present'}</span>
                      {staleShipping && <span>Shipping quote stale</span>}
                    </div>
                    <div className="review-notes">{candidate.reviewNotes || 'No reviewer notes yet.'}</div>
                    <div className="candidate-actions">
                      <button className="primary" onClick={() => handleApprove(candidate.id)}>Approve</button>
                      <button className="secondary" onClick={() => handleReject(candidate.id)}>Reject</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container nav-row">
          <a href="#home" className="brand">VELOUR</a>
          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#shop">Shop</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#scout">Scout</a>
          </nav>
          <button className="cart-button" onClick={() => cart.setIsOpen(true)}>
            Bag {cart.totalQuantity > 0 ? `(${cart.totalQuantity})` : ''}
          </button>
        </div>
      </header>

      {onPublicPage && page === 'home' && (
        <main>
          <section className="hero container">
            <div className="hero-copy">
              <div className="eyebrow">Premium beauty accessories</div>
              <h1>Beauty essentials with a softer edge.</h1>
              <p>
                Velour Beauty is a premium, internationally minded beauty accessories business focused on elegant tools, organizers, and travel-ready essentialswith a modern, feminine identity.
              </p>
              <div className="cta-row">
                <a href="#shop" className="primary-button">Shop the collection</a>
                <a href="#about" className="secondary-button">Learn about us</a>
              </div>
              <div className="trust-row">
                <div className="avatar-stack">
                  <span>V</span>
                  <span>R</span>
                  <span>A</span>
                </div>
                <p>Luxury feel · Organic marketing · Zero inventory risk</p>
              </div>
            </div>
            <div className="hero-visual">
              <div className="orb orb-one" />
              <div className="orb orb-two" />
              <div className="character-card">
                <div className="face">
                  <span className="eye left" />
                  <span className="eye right" />
                  <span className="smile" />
                </div>
                <div className="badge">AI stylist</div>
              </div>
            </div>
          </section>

          <section className="feature-strip">
            <div className="container feature-grid">
              <div>Low-complexity beauty accessories</div>
              <div>Morocco-founded</div>
              <div>Organic-first launch</div>
              <div>Compliance-first sourcing</div>
            </div>
          </section>

          <section id="shop" className="container storefront-section">
            <div className="section-head">
              <div>
                <div className="eyebrow">Curated essentials</div>
                <h2>Shop the Velour collection</h2>
              </div>
              <div className="shop-controls">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" />
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="low-high">Price: low to high</option>
                  <option value="high-low">Price: high to low</option>
                </select>
              </div>
            </div>

            <div className="category-row">
              {categories.map((category) => (
                <button
                  key={category}
                  className={activeCategory === category ? 'category active' : 'category'}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article key={product.id} className="product-card" onClick={() => setSelectedProduct(product)}>
                  <div className="product-image-wrap" style={{ background: product.color }}>
                    <img src={product.image} alt={product.name} />
                    <button
                      className="mini-cart"
                      onClick={(event) => {
                        event.stopPropagation();
                        cart.addItem(product, product.variants[0]);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className="product-info">
                    <div className="brand-line">{product.brand}</div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-meta">
                      <div className="price-wrap">
                        <strong>{formatMoney(product.price)}</strong>
                        {product.compareAt && <span>{formatMoney(product.compareAt)}</span>}
                      </div>
                    </div>
                    <div className="badge-row">
                      {product.badges.map((badge) => (
                        <span key={badge}>{badge}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="about" className="story-section">
            <div className="container story-grid">
              <div className="story-card">
                <div className="eyebrow">Our story</div>
                <h2>Designed for a more refined beauty routine.</h2>
                <p>
                  We are building a premium beauty accessories brand with a world-facing sourcing strategy, a softer luxury aesthetic, and practical, no-inventory growth.
                </p>
                <ul>
                  <li>International dropshipping model</li>
                  <li>Premium black, ivory, champagne, and soft gold palette</li>
                  <li>Strong mobile-first UX and organic reach</li>
                </ul>
              </div>
              <div className="story-visual">
                <div className="mosaic">
                  <span className="mosaic-one" />
                  <span className="mosaic-two" />
                  <span className="mosaic-three" />
                  <span className="mosaic-four" />
                </div>
              </div>
            </div>
          </section>

          <section className="container info-grid">
            <div className="info-column">
              <div className="eyebrow">Shipping</div>
              <h3>Transparent delivery</h3>
              <p>Standard delivery across the EU takes 4–8 business days, with tracking available on all shipped orders.</p>
            </div>
            <div className="info-column">
              <div className="eyebrow">Returns</div>
              <h3>Easy returns</h3>
              <p>Unworn items may be returned within 14 days of delivery; the buyer covers return shipping unless the item arrives damaged.</p>
            </div>
            <div className="info-column">
              <div className="eyebrow">Privacy</div>
              <h3>Respectful data handling</h3>
              <p>We only keep the personal data needed to deliver orders and support customer service.</p>
            </div>
          </section>

          <section className="container faq-section" id="contact">
            <div className="eyebrow">Customer support</div>
            <h2>Need help?</h2>
            <div className="faq-grid">
              <div><strong>Email</strong><span>support@velourbeauty.com</span></div>
              <div><strong>Instagram</strong><span>@velourbeauty</span></div>
              <div><strong>Shipping</strong><span>Europe and Morocco</span></div>
              <div><strong>Business hours</strong><span>Monday to Friday · 09:00–17:00 CET</span></div>
            </div>
          </section>
        </main>
      )}

      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedProduct(null)}>×</button>
            <div className="modal-image-wrap" style={{ background: selectedProduct.color }}>
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>
            <div className="modal-copy">
              <div className="eyebrow">{selectedProduct.category}</div>
              <h3>{selectedProduct.name}</h3>
              <p>{selectedProduct.description}</p>
              <div className="price-wrap large-price">
                <strong>{formatMoney(selectedProduct.price)}</strong>
                {selectedProduct.compareAt && <span>{formatMoney(selectedProduct.compareAt)}</span>}
              </div>
              <div className="badge-row">
                {selectedProduct.badges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
              <button
                className="primary-button wide"
                onClick={() => {
                  cart.addItem(selectedProduct, selectedProduct.variants[0]);
                  setSelectedProduct(null);
                }}
              >
                Add to bag
              </button>
            </div>
          </div>
        </div>
      )}

      {cart.isOpen && (
        <div className="cart-drawer-backdrop" onClick={() => cart.setIsOpen(false)}>
          <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <h3>Your bag</h3>
              <button onClick={() => cart.setIsOpen(false)}>Close</button>
            </div>
            {cart.items.length === 0 ? (
              <div className="empty-cart">
                <p>Your bag is empty.</p>
                <button onClick={() => cart.setIsOpen(false)}>Continue shopping</button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.items.map((item) => (
                    <div key={item.key} className="cart-item">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.variant}</span>
                        <div className="mini-controls">
                          <button onClick={() => cart.updateQty(item.key, item.qty - 1)}>-</button>
                          <span>{item.qty}</span>
                          <button onClick={() => cart.updateQty(item.key, item.qty + 1)}>+</button>
                        </div>
                      </div>
                      <div className="cart-price">{formatMoney(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>
                <div className="checkout-box">
                  <div className="checkout-row">
                    <span>Subtotal</span>
                    <strong>{formatMoney(cart.totalPrice)}</strong>
                  </div>
                  <p>Checkout remains disabled until payment and shipping compliance are confirmed for your destination market.</p>
                  <button className="primary-button wide" onClick={handleCheckout}>Proceed to checkout</button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      <footer className="site-footer">
        <div className="container footer-row">
          <div>
            <div className="brand">VELOUR</div>
            <p>Premium beauty accessories, sourcing transparency, and clean design.</p>
          </div>
          <div>
            <a href="#about">About</a>
            <a href="#shop">Shop</a>
            <a href="#contact">Contact</a>
            <a href="#scout">Scout</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
