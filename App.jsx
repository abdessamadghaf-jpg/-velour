// src/App.jsx
import { useState, useEffect, useRef } from 'react'
import { PRODUCTS, REVIEWS, STATS } from './data/products.js'
import { useCart } from './hooks/useCart.js'

// ── Utility ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
const stars = (n) => '★'.repeat(Math.floor(n)) + (n % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(n))

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const cart = useCart()
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleAddToCart(product, variant) {
    cart.addItem(product, variant)
    showToast(`${product.name} added to bag`)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF6F0', color: '#1A1208', minHeight: '100vh' }}>
      <Nav scrolled={navScrolled} cartCount={cart.totalQuantity} onCartOpen={() => cart.setIsOpen(true)} mobileOpen={mobileMenuOpen} onMobileToggle={() => setMobileMenuOpen(o => !o)} />
      <Hero />
      <StatsBar />
      <TrendingSection products={PRODUCTS.filter(p => p.isTrending)} onView={setModal} onAdd={handleAddToCart} />
      <AboutSection />
      <AllProductsSection products={PRODUCTS} onView={setModal} onAdd={handleAddToCart} />
      <ResultsSection />
      <ReviewsSection />
      <FaqSection />
      <EmailSection />
      <Footer />

      {cart.isOpen && <CartDrawer cart={cart} onClose={() => cart.setIsOpen(false)} />}
      {modal && <ProductModal product={modal} onClose={() => setModal(null)} onAdd={handleAddToCart} />}
      {toast && <Toast msg={toast} />}
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ scrolled, cartCount, onCartOpen, mobileOpen, onMobileToggle }) {
  const links = ['Shop', 'Our Story', 'Ingredients', 'Blog', 'Contact']
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(250,246,240,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(26,18,8,0.08)' : 'none',
      transition: 'all 0.3s ease', padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <a href="#" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, letterSpacing: '0.15em', color: '#1A1208', textDecoration: 'none' }}>
          VELOUR
        </a>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="desktop-nav">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} style={{ fontSize: 14, color: '#1A1208', textDecoration: 'none', opacity: 0.7 }}
              onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.7}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onCartOpen} style={{ position: 'relative', background: '#C17B5C', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 24, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🛍</span> Shop Now
            {cartCount > 0 && <span style={{ background: '#1A1208', color: '#FAF6F0', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const [imgLoaded, setImgLoaded] = useState(false)
  return (
    <section style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', maxWidth: 1200, margin: '0 auto', padding: '100px 24px 60px', gap: 60 }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7A9E8720', borderRadius: 24, padding: '6px 16px', marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7A9E87', display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#7A9E87', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Clean · Effective · Radiant</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(48px, 6vw, 76px)', fontWeight: 500, lineHeight: 1.05, color: '#1A1208', margin: '0 0 20px' }}>
          Viral Beauty<br /><em style={{ color: '#C17B5C' }}>That Works.</em>
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.7, color: '#1A1208aa', maxWidth: 420, marginBottom: 36 }}>
          Science-backed skincare hand-picked from real trend signals. Every product scored on demand, margin, and actual results.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
          <a href="#trending" style={{ background: '#C17B5C', color: '#fff', padding: '14px 28px', borderRadius: 32, fontSize: 15, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Shop Bestsellers →
          </a>
          <a href="#all-products" style={{ background: 'transparent', color: '#1A1208', padding: '14px 28px', borderRadius: 32, fontSize: 15, fontWeight: 500, textDecoration: 'none', border: '1.5px solid rgba(26,18,8,0.2)' }}>
            Explore All
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex' }}>
            {['#C17B5C','#7A9E87','#E8C5A0','#8B7B6B'].map((c, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: '2px solid #FAF6F0', marginLeft: i > 0 ? -8 : 0 }} />
            ))}
          </div>
          <span style={{ fontSize: 13, color: '#1A1208aa' }}>Trusted by <strong>25K+ customers</strong> · ★ 4.6/5</span>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Background organic shape */}
        <div style={{ position: 'absolute', inset: -40, borderRadius: '60% 40% 50% 50% / 50% 40% 60% 50%', background: 'linear-gradient(135deg, #F0EBE3, #E8D5C4)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, borderRadius: '40% 60% 50% 50% / 50% 40% 60% 50%', overflow: 'hidden', aspectRatio: '4/5' }}>
          <img
            src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&q=80"
            alt="Beautiful glowing skin"
            onLoad={() => setImgLoaded(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.5s' }}
          />
        </div>
        {/* Floating stat cards */}
        <FloatingCard top="15%" left="-20%" bg="#fff">
          <span style={{ fontSize: 22, fontWeight: 700, color: '#C17B5C', fontFamily: 'DM Mono' }}>+92%</span>
          <span style={{ fontSize: 11, color: '#1A1208aa' }}>Hydration boost</span>
        </FloatingCard>
        <FloatingCard bottom="20%" right="-15%" bg="#1A1208">
          <span style={{ fontSize: 11, color: '#FAF6F0aa' }}>Clinically proven</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#C17B5C' }}>31K+ reviews</span>
        </FloatingCard>
      </div>
    </section>
  )
}

function FloatingCard({ top, bottom, left, right, bg, children }) {
  return (
    <div style={{
      position: 'absolute', top, bottom, left, right,
      background: bg, borderRadius: 16, padding: '12px 18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      display: 'flex', flexDirection: 'column', gap: 2,
      minWidth: 130, zIndex: 2,
      animation: 'float 4s ease-in-out infinite',
    }}>
      {children}
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <div style={{ background: '#1A1208', padding: '28px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 500, color: '#C17B5C', fontStyle: 'italic' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#FAF6F0aa', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Trending Section ──────────────────────────────────────────────────────────
function TrendingSection({ products, onView, onAdd }) {
  return (
    <section id="trending" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <SectionHeader eyebrow="Trending This Week" title="Viral Picks" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
        {products.map(p => <ProductCard key={p.id} product={p} onView={onView} onAdd={onAdd} featured />)}
      </div>
    </section>
  )
}

// ── About Section ─────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="our-story" style={{ background: '#F0EBE3', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80",
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
            "https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?w=400&q=80",
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80",
          ].map((src, i) => (
            <div key={i} style={{ borderRadius: 20, overflow: 'hidden', aspectRatio: '1', transform: i % 2 === 1 ? 'translateY(24px)' : 'none' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#C17B5C', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>/ About Us</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 500, lineHeight: 1.15, marginBottom: 20 }}>
            Beauty that loves<br />your skin <em>and</em> your wallet.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#1A1208aa', marginBottom: 32 }}>
            VELOUR doesn't guess at trends — we score them. Every product is ranked by real demand signals, margin potential, and verified customer results before it lands on your doorstep.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            {[
              { icon: '🌿', label: 'Clean Ingredients', sub: 'Non-toxic, dermatologist tested' },
              { icon: '🐰', label: 'Cruelty Free', sub: 'Kind to animals, always' },
              { icon: '♻️', label: 'Sustainable', sub: 'Eco-conscious packaging' },
              { icon: '✨', label: 'Trend-Scored', sub: 'AI-verified, real demand' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: '#1A1208aa' }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <a href="#all-products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C17B5C', color: '#fff', padding: '12px 24px', borderRadius: 28, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            Our Story →
          </a>
        </div>
      </div>
    </section>
  )
}

// ── All Products ──────────────────────────────────────────────────────────────
function AllProductsSection({ products, onView, onAdd }) {
  const [filter, setFilter] = useState('All')
  const categories = ['All', ...new Set(products.map(p => p.category))]
  const filtered = filter === 'All' ? products : products.filter(p => p.category === filter)

  return (
    <section id="all-products" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <SectionHeader eyebrow="Full Catalogue" title="All Products" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '8px 20px', borderRadius: 24, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
            background: filter === c ? '#1A1208' : '#F0EBE3', color: filter === c ? '#FAF6F0' : '#1A1208aa',
            transition: 'all 0.2s'
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {filtered.map(p => <ProductCard key={p.id} product={p} onView={onView} onAdd={onAdd} />)}
      </div>
    </section>
  )
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product: p, onView, onAdd, featured }) {
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)

  function handleAdd(e) {
    e.stopPropagation()
    onAdd(p)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div
      onClick={() => onView(p)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: 24, overflow: 'hidden', cursor: 'pointer',
        boxShadow: hovered ? '0 16px 48px rgba(26,18,8,0.12)' : '0 2px 12px rgba(26,18,8,0.06)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', background: p.color, aspectRatio: '4/3', overflow: 'hidden' }}>
        <img
          src={hovered && p.hoverImage ? p.hoverImage : p.image}
          alt={p.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s ease' }}
        />
        {p.isTrending && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: '#C17B5C', color: '#fff', borderRadius: 24, padding: '4px 12px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            ↑ {p.trendLabel}
          </div>
        )}
        <button
          onClick={handleAdd}
          style={{
            position: 'absolute', bottom: 12, right: 12,
            background: added ? '#7A9E87' : '#1A1208', color: '#FAF6F0',
            border: 'none', borderRadius: '50%', width: 40, height: 40,
            fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 0.25s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}
          aria-label="Add to cart"
        >
          {added ? '✓' : '+'}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px 20px' }}>
        <div style={{ fontSize: 11, color: '#1A1208aa', marginBottom: 4, letterSpacing: '0.05em' }}>{p.brand}</div>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', lineHeight: 1.3 }}>{p.name}</h3>
        <div style={{ fontSize: 12, color: '#1A1208aa', marginBottom: 12 }}>{p.tagline}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500 }}>{fmt(p.price)}</span>
            {p.compareAt && <span style={{ fontSize: 12, color: '#1A1208aa', textDecoration: 'line-through', marginLeft: 6 }}>{fmt(p.compareAt)}</span>}
          </div>
          <div style={{ fontSize: 12, color: '#C17B5C' }}>★ {p.rating} ({(p.reviewCount / 1000).toFixed(1)}k)</div>
        </div>
      </div>
    </div>
  )
}

// ── Results Section ───────────────────────────────────────────────────────────
function ResultsSection() {
  return (
    <section style={{ background: '#1A1208', padding: '80px 24px', color: '#FAF6F0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader eyebrow="Real Results" title="Numbers don't lie." light />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
          {[
            { stat: '+92%', label: 'Hydration boost', product: 'Zero Pore Pad', color: '#C17B5C' },
            { stat: '+88%', label: 'Smoother texture', product: 'Glycolic Toner', color: '#7A9E87' },
            { stat: '+85%', label: 'More radiance', product: 'Copper Peptide', color: '#E8C5A0' },
            { stat: '+96%', label: 'Longer lashes', product: 'Lash Serum', color: '#C17B5C' },
          ].map(r => (
            <div key={r.stat} style={{ background: '#ffffff0d', borderRadius: 20, padding: '28px 24px', border: '1px solid #ffffff12' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 500, fontStyle: 'italic', color: r.color, lineHeight: 1 }}>{r.stat}</div>
              <div style={{ fontSize: 14, color: '#FAF6F0', marginTop: 8, fontWeight: 500 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: '#FAF6F0aa', marginTop: 4 }}>{r.product}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, padding: 24, background: '#ffffff08', borderRadius: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#FAF6F0aa', fontStyle: 'italic' }}>*Based on independent clinical studies and verified customer data. Results may vary.</p>
        </div>
      </div>
    </section>
  )
}

// ── Reviews ───────────────────────────────────────────────────────────────────
function ReviewsSection() {
  const [active, setActive] = useState(0)
  return (
    <section id="blog" style={{ padding: '80px 24px', background: '#FAF6F0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionHeader eyebrow="Real People, Real Results" title="What our customers say" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 2px 12px rgba(26,18,8,0.06)' }}>
              <div style={{ fontSize: 20, color: '#C17B5C', marginBottom: 12, letterSpacing: -1 }}>{'★'.repeat(r.rating)}</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: '#1A1208', marginBottom: 20, fontStyle: 'italic' }}>"{r.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#C17B5C20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#C17B5C' }}>{r.avatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#1A1208aa' }}>{r.location}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 11, color: '#7A9E87', fontWeight: 500, background: '#7A9E8720', padding: '4px 10px', borderRadius: 12 }}>{r.product}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FaqSection() {
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: 'Are your products suitable for sensitive skin?', a: 'Yes — every product in the VELOUR catalogue is screened for common irritants. Most are fragrance-free and dermatologist-tested. Check individual product pages for full ingredient lists.' },
    { q: 'Are your products cruelty-free?', a: 'Absolutely. We only carry brands with cruelty-free certifications. No animal testing, ever.' },
    { q: 'How long until I see results?', a: 'Most customers report visible changes within 2–4 weeks with consistent use. Our lash serum shows peak results at 6 weeks. Check each product page for clinical timelines.' },
    { q: 'How does the trend scoring work?', a: 'Every product is scored by our AI engine on demand growth, margin potential, virality, competition, and inventory risk. Only A and B-grade products make the VELOUR cut.' },
    { q: 'What\'s your return policy?', a: 'Full refund within 30 days if you\'re not satisfied — no questions asked. We\'re that confident in what we carry.' },
  ]
  return (
    <section style={{ padding: '80px 24px', background: '#F0EBE3' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <SectionHeader eyebrow="FAQ" title="Everything You Need to Know" centered />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 500, textAlign: 'left' }}>
                {f.q}
                <span style={{ fontSize: 20, color: '#C17B5C', transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
              </button>
              {open === i && <div style={{ padding: '0 24px 20px', fontSize: 14, lineHeight: 1.8, color: '#1A1208aa' }}>{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Email Capture ─────────────────────────────────────────────────────────────
function EmailSection() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  return (
    <section style={{ background: '#C17B5C', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 500, color: '#fff', marginBottom: 12, fontStyle: 'italic' }}>
          Get 10% off your first order
        </h2>
        <p style={{ fontSize: 16, color: '#ffffff99', marginBottom: 32 }}>
          Join 25,000+ beauty insiders. First access to new drops, trend alerts, and exclusive offers.
        </p>
        {done ? (
          <div style={{ background: '#ffffff30', borderRadius: 16, padding: '20px', color: '#fff', fontSize: 16, fontWeight: 500 }}>
            ✓ You're in! Check your inbox for your 10% discount code.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, maxWidth: 440, margin: '0 auto' }}>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ flex: 1, padding: '14px 20px', borderRadius: 32, border: 'none', fontSize: 14, outline: 'none' }}
            />
            <button
              onClick={() => { if (email.includes('@')) setDone(true) }}
              style={{ background: '#1A1208', color: '#FAF6F0', border: 'none', padding: '14px 24px', borderRadius: 32, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Get 10% Off
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: 'Shop', links: ['All Products', 'Best Sellers', 'New Arrivals', 'Skincare Quiz'] },
    { title: 'Company', links: ['Our Story', 'Ingredients', 'Sustainability', 'Careers'] },
    { title: 'Help', links: ['FAQ', 'Shipping', 'Returns', 'Contact Us'] },
  ]
  return (
    <footer style={{ background: '#1A1208', padding: '60px 24px 32px', color: '#FAF6F0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, letterSpacing: '0.15em', marginBottom: 16, color: '#C17B5C' }}>VELOUR</div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: '#FAF6F0aa', maxWidth: 280, marginBottom: 20 }}>
              Trend-scored beauty products that actually work. Clean, effective, radiant.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {['Instagram', 'TikTok', 'Pinterest'].map(s => (
                <a key={s} href="#" style={{ fontSize: 12, color: '#FAF6F0aa', textDecoration: 'none', background: '#ffffff10', padding: '6px 12px', borderRadius: 20 }}>{s}</a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FAF6F0aa', marginBottom: 16 }}>{col.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(l => <a key={l} href="#" style={{ fontSize: 14, color: '#FAF6F0cc', textDecoration: 'none' }}>{l}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #ffffff15', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: '#FAF6F0aa' }}>© {new Date().getFullYear()} VELOUR Skincare. All rights reserved.</p>
          <p style={{ fontSize: 12, color: '#FAF6F0aa' }}>Privacy Policy · Terms</p>
        </div>
      </div>
    </footer>
  )
}

// ── Cart Drawer ───────────────────────────────────────────────────────────────
function CartDrawer({ cart, onClose }) {
  const { items, totalPrice, removeItem, updateQty, totalQuantity } = cart
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.4)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 420, background: '#FAF6F0', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(26,18,8,0.1)' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: 'italic', margin: 0 }}>
            Your Bag {totalQuantity > 0 && <span style={{ fontSize: 14, color: '#1A1208aa', fontStyle: 'normal' }}>({totalQuantity})</span>}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#1A1208aa' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#1A1208aa' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛍</div>
              <p style={{ fontSize: 16, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>Your bag is empty</p>
              <button onClick={onClose} style={{ marginTop: 16, background: 'none', border: 'none', color: '#C17B5C', fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}>Continue shopping</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map(item => (
                <div key={item.key} style={{ display: 'flex', gap: 14, background: '#fff', borderRadius: 16, padding: 14 }}>
                  <img src={item.image} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, background: '#F0EBE3' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#1A1208aa', marginBottom: 2 }}>{item.brand}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0EBE3', borderRadius: 20, padding: '4px 8px' }}>
                        <button onClick={() => updateQty(item.key, item.qty - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, width: 20 }}>−</button>
                        <span style={{ fontSize: 13, fontWeight: 500, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.key, item.qty + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, width: 20 }}>+</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: "'DM Mono'", fontSize: 14, fontWeight: 500 }}>{fmt(item.price * item.qty)}</span>
                        <button onClick={() => removeItem(item.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#1A1208aa' }}>×</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: 24, borderTop: '1px solid rgba(26,18,8,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: '#1A1208aa' }}>Subtotal</span>
              <span style={{ fontFamily: "'DM Mono'", fontSize: 16, fontWeight: 500 }}>{fmt(totalPrice)}</span>
            </div>
            <p style={{ fontSize: 12, color: '#1A1208aa', marginBottom: 16 }}>Shipping & taxes calculated at checkout.</p>
            <button style={{ width: '100%', background: '#C17B5C', color: '#fff', border: 'none', padding: '16px', borderRadius: 32, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => alert('Connect your Shopify store to enable checkout. Set SHOPIFY_STOREFRONT_ACCESS_TOKEN in your env.')}>
              Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({ product: p, onClose, onAdd }) {
  const [variant, setVariant] = useState(p.variants[0])
  const [added, setAdded] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const images = [p.image, p.hoverImage].filter(Boolean)

  function handleAdd() {
    onAdd(p, variant)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.5)', zIndex: 300, backdropFilter: 'blur(6px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', background: '#FAF6F0', borderRadius: 28, zIndex: 301, display: 'grid', gridTemplateColumns: '1fr 1fr', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        {/* Image */}
        <div style={{ background: p.color, borderRadius: '28px 0 0 28px', overflow: 'hidden', position: 'relative', minHeight: 400 }}>
          <img src={images[imgIdx]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)} style={{ width: 8, height: 8, borderRadius: '50%', background: imgIdx === i ? '#C17B5C' : '#fff', border: 'none', cursor: 'pointer', padding: 0 }} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={onClose} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#1A1208aa', lineHeight: 1 }}>×</button>
          {p.isTrending && <span style={{ fontSize: 11, color: '#C17B5C', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>↑ {p.trendLabel}</span>}
          <div>
            <div style={{ fontSize: 12, color: '#1A1208aa', marginBottom: 4 }}>{p.brand}</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500, margin: 0, lineHeight: 1.2 }}>{p.name}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: "'DM Mono'", fontSize: 22, fontWeight: 500 }}>{fmt(p.price)}</span>
            {p.compareAt && <span style={{ fontSize: 14, color: '#1A1208aa', textDecoration: 'line-through' }}>{fmt(p.compareAt)}</span>}
          </div>
          <div style={{ fontSize: 13, color: '#1A1208aa' }}>★ {p.rating} · {p.reviewCount.toLocaleString()} reviews</div>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#1A1208cc', margin: 0 }}>{p.description}</p>

          {/* Results */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {p.results.map(r => (
              <span key={r} style={{ fontSize: 11, background: '#7A9E8720', color: '#7A9E87', padding: '4px 10px', borderRadius: 20, fontWeight: 500 }}>{r}</span>
            ))}
          </div>

          {/* Ingredients */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A1208aa', marginBottom: 8 }}>Key Ingredients</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {p.ingredients.map(i => <span key={i} style={{ fontSize: 11, background: '#F0EBE3', color: '#1A1208aa', padding: '4px 10px', borderRadius: 20 }}>{i}</span>)}
            </div>
          </div>

          {/* Variant */}
          {p.variants.length > 1 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A1208aa', marginBottom: 8 }}>Options</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {p.variants.map(v => (
                  <button key={v} onClick={() => setVariant(v)} style={{ padding: '8px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: variant === v ? '2px solid #1A1208' : '1.5px solid rgba(26,18,8,0.2)', background: variant === v ? '#1A1208' : 'transparent', color: variant === v ? '#FAF6F0' : '#1A1208', fontWeight: 500 }}>{v}</button>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleAdd} style={{ marginTop: 'auto', background: added ? '#7A9E87' : '#C17B5C', color: '#fff', border: 'none', padding: '16px', borderRadius: 32, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.3s' }}>
            {added ? '✓ Added to Bag' : '🛍 Add to Bag'}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, centered, light }) {
  return (
    <div style={{ marginBottom: 40, textAlign: centered ? 'center' : 'left' }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: light ? '#C17B5C' : '#C17B5C', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>/ {eyebrow}</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 500, color: light ? '#FAF6F0' : '#1A1208', margin: 0, fontStyle: 'italic' }}>{title}</h2>
    </div>
  )
}

function Toast({ msg }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1A1208', color: '#FAF6F0', padding: '12px 24px', borderRadius: 32, fontSize: 14, fontWeight: 500, zIndex: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
      ✓ {msg}
    </div>
  )
}
