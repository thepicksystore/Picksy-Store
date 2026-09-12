import { useMemo, useState } from 'react'
import { ArrowRight, ChevronRight, Grid2X2, Search, Sparkles, Star, Zap } from 'lucide-react'
import { products } from '../data/products'
import Header from '../components/Header'
import Section from '../components/Section'

const categories = [
  ['Women', '👗'], ['Men', '👕'], ['Kids', '🧸'], ['Home', '🏠'], ['Kitchen', '🍳'],
  ['Beauty', '💄'], ['Electronics', '🎧'], ['Gadgets', '📷'], ['Fashion', '🧥'], ['More', '▦']
]

export default function Home() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(p =>
      [p.name, p.category, p.marketplace, p.description].some(v => v.toLowerCase().includes(q))
    )
  }, [query])

  const trending = filtered.filter(p => p.trending)
  const newest = filtered.filter(p => p.isNew)
  const picks = filtered.filter(p => p.picksyPick)
  const under299 = filtered.filter(p => p.price <= 299)

  return (
    <>
      <Header onSearch={setQuery} />
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <span className="pill"><Zap size={14} fill="currentColor" /> Trending Finds</span>
            <h1>Discover <span>Better</span><br />Finds.</h1>
            <p>Trending, affordable & useful products — <b>curated for you.</b></p>
            <form className="hero-search" onSubmit={e => { e.preventDefault(); document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' }) }}>
              <Search size={20} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for products, categories, or brands..." />
              <button aria-label="Search"><Search size={19} /></button>
            </form>
            <div className="popular-searches">
              <span>Popular:</span><button onClick={() => setQuery('earbuds')}>Wireless Earbuds</button>
              <button onClick={() => setQuery('home')}>Home Decor</button><button onClick={() => setQuery('kitchen')}>Kitchen</button>
              <button onClick={() => setQuery('')}>Under ₹299</button>
            </div>
          </div>
          <div className="hero-art">
            <div className="float-card card-one">✨ Good Things Ahead</div>
            <div className="art-product art-phone">Good<br /><b>Things</b><br />Ahead 🌼</div>
            <div className="art-product art-bottle">💧</div>
            <div className="art-product art-watch">10<br /><b>08</b></div>
            <div className="art-product art-buds">🎧</div>
            <div className="art-product art-plant">🌿</div>
            <div className="scribble">↗</div>
            <div className="hero-note">Shop<br /><b>Smart</b><br />Live Better ♥</div>
          </div>
        </section>

        <section id="categories" className="category-strip container">
          <div className="section-heading compact">
            <h2>Shop by Category</h2><a href="#categories">Explore all <ArrowRight size={15} /></a>
          </div>
          <div className="category-row">
            {categories.map(([name, icon]) => (
              <button key={name} onClick={() => setQuery(name)}>
                <span>{icon}</span><b>{name}</b>
              </button>
            ))}
          </div>
        </section>

        <div id="discover">
          {query && (
            <div className="search-result container">
              <span>Showing results for <b>“{query}”</b></span>
              <button onClick={() => setQuery('')}>Clear</button>
            </div>
          )}
          <Section id="trending" title="Trending Now" eyebrow="Hot picks people are checking out" icon={<span>🔥</span>} products={trending.length ? trending : filtered.slice(0, 5)} />
          <Section id="new" title="New Finds" eyebrow="Fresh additions worth a look" icon={<span>✨</span>} products={newest.length ? newest : filtered.slice(0, 5)} />
          <Section id="picks" title="Picksy Picks" eyebrow="Handpicked by us, just for you" icon={<span>⭐</span>} products={picks.length ? picks : filtered.slice(0, 5)} />
        </div>

        <section id="under299" className="budget-banner container">
          <div>
            <span className="budget-pill">👑 Budget Friendly</span>
            <h2>Under ₹299</h2>
            <p>Great quality. Amazing prices.</p>
          </div>
          <button onClick={() => setQuery('')}>Explore Now <ArrowRight size={16} /></button>
          <div className="budget-items">
            {under299.slice(0, 4).map(p => <img key={p.id} src={p.image} alt="" />)}
          </div>
        </section>

        <section className="festival-banner container">
          <div>
            <span>FESTIVAL SPECIAL FINDS</span>
            <h2>Make your celebrations more special ✨</h2>
          </div>
          <button>Explore Collection <ArrowRight size={16} /></button>
          <div className="festival-diyas">🪔 🪔 🪔</div>
        </section>

        <section className="trust-strip container">
          <div><span>🔎</span><div><b>Curated Finds</b><small>We search so you don't have to.</small></div></div>
          <div><span>💰</span><div><b>Value Focused</b><small>Trending picks at smart prices.</small></div></div>
          <div><span>⚡</span><div><b>Easy Discovery</b><small>Find your next favorite quickly.</small></div></div>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer-grid">
          <div><div className="brand footer-brand"><span className="brand-mark"><ShoppingBagIcon /></span><span><strong>Picksy</strong><small>Curated for You</small></span></div><p>Trending, affordable & useful finds — curated for you.</p></div>
          <div><h4>Explore</h4><a href="#trending">Trending</a><a href="#new">New Finds</a><a href="#categories">Categories</a></div>
          <div><h4>Picksy</h4><a href="#">About</a><a href="#">Affiliate Disclosure</a><a href="#">Privacy Policy</a><a href="#">Terms</a></div>
          <div><h4>Stay Updated</h4><p>More trending finds. Less scrolling.</p><div className="email-box"><input placeholder="Enter your email" /><button>→</button></div></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Picksy. All rights reserved.</span><span>Picksy may earn a commission from qualifying purchases.</span></div>
      </footer>
    </>
  )
}

function ShoppingBagIcon() {
  return <ShoppingBag size={18} strokeWidth={2.5} />
}