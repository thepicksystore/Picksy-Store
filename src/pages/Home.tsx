import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Search,
  Zap,
  Mail,
  Instagram,
  Youtube,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import Header from '../components/Header'
import Section from '../components/Section'
import { supabase } from '../lib/supabase'
import type { Product } from '../types/product'

type Category = {
  id: string
  name: string
  slug: string
}

const categoryIcons: Record<string, string> = {
  women: '👗',
  men: '👕',
  kids: '🧸',
  home: '🏠',
  kitchen: '🍳',
  beauty: '💄',
  electronics: '🎧',
  gadgets: '📷',
  fashion: '🧥',
  lifestyle: '✨',
  accessories: '👜',
  festival: '🎉',
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [heroSlide, setHeroSlide] = useState(0)

  const heroSlides = [
    { kicker: 'Trending Finds', title: 'Big Savings', accent: 'Better Choices', line: ['Quality products', 'Affordable prices', 'All in one place'], tag: 'Good Things Ahead ✨' },
    { kicker: 'Picksy Picks', title: 'Smart Finds', accent: 'Happy Shopping', line: ['Handpicked finds', 'Great value', 'Made for you'], tag: 'Curated for You ✨' },
    { kicker: 'New Arrivals', title: 'Fresh Finds', accent: 'Worth Discovering', line: ['New products', 'Trending styles', 'Easy to explore'], tag: 'Something New ✨' },
  ]

  const currentHero = heroSlides[heroSlide]

  // =========================
  // LOAD PRODUCTS FROM SUPABASE
  // =========================

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setLoadError(false)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('created_at', {
          ascending: false,
        })

      if (error) {
        console.error(
          'Failed to load products:',
          error
        )

        setProducts([])
        setLoadError(true)
      } else {
        const mappedProducts: Product[] = (
          data ?? []
        ).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price ?? 0),
          originalPrice: Number(
            p.original_price ?? 0
          ),
          rating: Number(p.rating ?? 0),
          reviews: String(
            p.reviews ?? 0
          ),
          marketplace: p.marketplace,
          category: p.category,
          image: p.image || '',
          affiliateUrl:
            p.affiliate_url || '',
          badge: p.badge || '',
          description:
            p.description || '',
          trending: Boolean(
            p.trending
          ),
          isNew: Boolean(
            p.is_new
          ),
          picksyPick: Boolean(
            p.picksy_pick
          ),
          published: Boolean(
            p.published
          ),
        }))

        setProducts(mappedProducts)
      }

      setLoading(false)
    }

    loadProducts()
  }, [])

  // =========================
  // LOAD CATEGORIES FROM SUPABASE
  // =========================

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('created_at', {
          ascending: true,
        })

      if (error) {
        console.error(
          'Failed to load categories:',
          error
        )

        setCategories([])
        return
      }

      setCategories(data ?? [])
    }

    loadCategories()
  }, [])

  // =========================
  // SEARCH FILTER
  // =========================

  const filtered = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase()

    if (!q) {
      return products
    }

    // Special budget filters
    if (q === 'under299') {
      return products.filter(
        (p) => p.price <= 299
      )
    }

    if (q === 'under499') {
      return products.filter(
        (p) => p.price > 299 && p.price <= 499
      )
    }

    if (q === 'under799') {
      return products.filter(
        (p) => p.price > 499 && p.price <= 799
      )
    }

    if (q === 'under999') {
      return products.filter(
        (p) => p.price > 799 && p.price <= 999
      )
    }

    return products.filter((p) =>
      [
        p.name,
        p.category,
        p.marketplace,
        p.description,
      ].some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(q)
      )
    )
  }, [
    query,
    products,
  ])

  // =========================
  // PRODUCT GROUPS
  // =========================

  const trending =
    filtered.filter(
      (p) => p.trending
    )

  const newest =
    filtered.filter(
      (p) => p.isNew
    )

  const picks =
    filtered.filter(
      (p) => p.picksyPick
    )

  const dealSections = [
    {
      id: 'under299',
      label: '₹299',
      min: 0,
      max: 299,
      query: 'under299',
      description: 'Smart finds, low prices and everyday value.',
    },
    {
      id: 'under499',
      label: '₹499',
      min: 300,
      max: 499,
      query: 'under499',
      description: 'More choices, still easy on your pocket.',
    },
    {
      id: 'under799',
      label: '₹799',
      min: 500,
      max: 799,
      query: 'under799',
      description: 'Trending picks with even more variety.',
    },
    {
      id: 'under999',
      label: '₹999',
      min: 800,
      max: 999,
      query: 'under999',
      description: 'Premium-looking finds without going over budget.',
    },
  ].map((section) => ({
    ...section,
    products: [...products]
      .filter(
        (p) => p.price >= section.min && p.price <= section.max
      )
      .sort((a, b) => a.price - b.price)
      .slice(0, 4),
  }))

  const showBudget = (queryValue: string) => {
    setQuery(queryValue)
  }

  // =========================
  // LOADING SCREEN
  // =========================

  if (loading) {
    return (
      <>
        <Header
          onSearch={setQuery}
        />

        <main
          className="container"
          style={{
            padding: '100px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '40px',
              marginBottom: '15px',
            }}
          >
            ✨
          </div>

          <h2>
            Loading amazing finds...
          </h2>

          <p>
            Finding the best products
            for you.
          </p>
        </main>
      </>
    )
  }

  // =========================
  // ERROR SCREEN
  // =========================

  if (loadError) {
    return (
      <>
        <Header
          onSearch={setQuery}
        />

        <main
          className="container"
          style={{
            padding: '100px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '40px',
              marginBottom: '15px',
            }}
          >
            😕
          </div>

          <h2>
            We couldn't load the finds.
          </h2>

          <p>
            Please refresh the page and
            try again.
          </p>

          <button
            className="admin-primary-btn"
            onClick={() =>
              window.location.reload()
            }
            style={{
              marginTop: '20px',
              padding: '12px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </main>
      </>
    )
  }

  return (
    <>
      <Header
        onSearch={setQuery}
      />

      <main id="top">
        {/* =========================
            HERO
        ========================= */}

        <section className="hero hero-v2 container">
          <div className="hero-v2-copy">
            <span className="hero-kicker">
              <Zap size={15} fill="currentColor" />
              {currentHero.kicker}
            </span>

            <h1>
              {currentHero.title}
              <br />
              <span>{currentHero.accent}</span>
            </h1>

            <div className="hero-subline">
              <span>{currentHero.line[0]}</span>
              <i />
              <span>{currentHero.line[1]}</span>
              <i />
              <span>{currentHero.line[2]}</span>
            </div>

            <button
              type="button"
              className="hero-shop-btn"
              onClick={() =>
                document.getElementById('trending')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            >
              Shop Now
              <ArrowRight size={19} />
            </button>
          </div>

          <div className="hero-v2-art">
            <span className="hero-art-tag">{currentHero.tag}</span>
            <img
              src={`${import.meta.env.BASE_URL}hero-shopping.svg`}
              alt="Picksy Store shopping finds"
            />
            <span className="hero-art-arrow">↗</span>
          </div>

          <div className="hero-slider-dots">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.kicker}
                type="button"
                className={index === heroSlide ? 'active' : ''}
                aria-label={`Show slide ${index + 1}`}
                aria-pressed={index === heroSlide}
                onClick={() => setHeroSlide(index)}
              />
            ))}
          </div>
        </section>



        {/* =========================
            PRODUCTS
        ========================= */}

        <div id="discover">
          {query && (
            <div className="search-result container">
              <span>
                {query.startsWith('under') ? (
                  <>
                    Showing products in the{' '}
                    <b>
                      {query === 'under299'
                        ? '₹0–₹299'
                        : query === 'under499'
                          ? '₹300–₹499'
                          : query === 'under799'
                            ? '₹500–₹799'
                            : '₹800–₹999'}
                    </b>{' '}
                    range
                  </>
                ) : (
                  <>
                    Showing results for{' '}
                    <b>
                      “{query}”
                    </b>
                  </>
                )}
              </span>

              <button
                onClick={() =>
                  setQuery('')
                }
              >
                Clear
              </button>
            </div>
          )}

          <Section
            id="trending"
            title="Trending Now"
            eyebrow="Hot picks people are checking out"
            icon={
              <span>
                🔥
              </span>
            }
            products={
              trending.length
                ? trending
                : filtered.slice(
                    0,
                    5
                  )
            }
          />

          <Section
            id="new"
            title="New Finds"
            eyebrow="Fresh additions worth a look"
            icon={
              <span>
                ✨
              </span>
            }
            products={
              newest.length
                ? newest
                : filtered.slice(
                    0,
                    5
                  )
            }
          />

          <Section
            id="picks"
            title="Picksy Picks"
            eyebrow="Handpicked by us, just for you"
            icon={
              <span>
                ⭐
              </span>
            }
            products={
              picks.length
                ? picks
                : filtered.slice(
                    0,
                    5
                  )
            }
          />
        </div>

        {/* =========================
            BUDGET DEALS
        ========================= */}

        <section
          id="budget-deals"
          className="budget-deals container"
        >
          {dealSections.map((deal) => (
            <article
              key={deal.id}
              id={deal.id}
              className="budget-card"
            >
              <div className="budget-card-copy">
                <span className="budget-pill">
                  👑 Budget Friendly
                </span>

                <h2>
                  Best Deals Under {deal.label}
                </h2>

                <p>
                  {deal.description}
                </p>

                <button
                  type="button"
                  className="budget-cta"
                  onClick={() => {
                    showBudget(deal.query)
                    window.requestAnimationFrame(() => {
                      document.getElementById('discover')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    })
                  }}
                >
                  Explore Deals
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="budget-items">
                {deal.products.length ? (
                  deal.products.map((p) => (
                    <div
                      key={p.id}
                      className="budget-item"
                      title={p.name}
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                            event.currentTarget.nextElementSibling?.classList.add('visible')
                          }}
                        />
                      ) : null}

                      <span className="budget-item-fallback">
                        {categoryIcons[
                          String(p.category ?? '').toLowerCase()
                        ] || '✨'}
                      </span>

                      <span className="budget-item-price">
                        ₹{Math.round(p.price)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="budget-empty">
                    New deals coming soon
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer id="footer" className="footer">
        <div className="container footer-grid">
          <div className="footer-brand-column">
            <div className="brand footer-brand">
              <img
                className="footer-brand-logo"
                src={`${import.meta.env.BASE_URL}picksy-logo.svg`}
                alt="Picksy Store"
              />
            </div>

            <p>
              Trending, affordable & useful finds — curated for you.
            </p>

            <div className="footer-brand-line">
              <span>Picksy = curated for you</span>
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>

            <a href="#top">Home</a>
            <a href="#under299">Best Deals Under ₹299</a>
            <a href="#new">New Arrivals</a>
            <a href="#trending">Trending</a>
            <a href="#picks">Picksy Picks</a>
          </div>

          <div>
            <h4>Shop by Category</h4>

            <Link to="/category/women">Women</Link>
            <Link to="/category/men">Men</Link>
            <Link to="/category/kids">Kids</Link>
            <Link to="/category/home">Home</Link>
            <Link to="/category/kitchen">Kitchen</Link>
          </div>

          <div>
            <h4>Why Picksy?</h4>

            <div className="footer-feature">
              <span><Sparkles size={15} /></span>
              <p>Trending finds</p>
            </div>

            <div className="footer-feature">
              <span>₹</span>
              <p>Affordable picks</p>
            </div>

            <div className="footer-feature">
              <span><ShieldCheck size={15} /></span>
              <p>Curated for you</p>
            </div>

            <div className="footer-feature">
              <span><Mail size={15} /></span>
              <p>Easy product discovery</p>
            </div>
          </div>
        </div>

        <div className="container footer-update-row">
          <div>
            <h4>Stay Updated</h4>
            <p>More trending finds. Less scrolling.</p>
          </div>

          <div className="footer-socials" aria-label="Picksy Store social links">
            <span className="footer-social-label">Follow Picksy</span>
            <a
              className="footer-social-pill"
              href="https://www.instagram.com/the.picksystore/"
              target="_blank"
              rel="noreferrer"
              aria-label="Picksy Store on Instagram"
            >
              <Instagram size={16} />
              Instagram
            </a>
            <a
              className="footer-social-pill"
              href="https://www.youtube.com/@the.picksystore"
              target="_blank"
              rel="noreferrer"
              aria-label="Picksy Store on YouTube"
            >
              <Youtube size={16} />
              YouTube
            </a>
            <a
              className="footer-social-pill"
              href="https://in.pinterest.com/thepicksystore/"
              target="_blank"
              rel="noreferrer"
              aria-label="Picksy Store on Pinterest"
            >
              <PinterestIcon />
              Pinterest
            </a>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© 2026 Picksy. All rights reserved.</span>
          <span>Picksy may earn a commission from qualifying purchases.</span>
          <span className="footer-credit">Designed &amp; Powered by Jay Bhadreshwara</span>
        </div>
      </footer>
    </>
  )
}

function PinterestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5a9.5 9.5 0 0 0-3.47 18.34c-.08-1.55-.02-3.4.39-4.91l1.2-5.08s-.3-.61-.3-1.51c0-1.42.82-2.48 1.84-2.48.87 0 1.29.65 1.29 1.43 0 .87-.56 2.17-.85 3.38-.24 1.01.51 1.83 1.5 1.83 1.8 0 3.19-1.9 3.19-4.65 0-2.43-1.75-4.13-4.25-4.13-2.9 0-4.6 2.18-4.6 4.43 0 .88.34 1.83.76 2.34.08.1.09.19.07.29l-.28 1.14c-.05.18-.15.22-.34.13-1.27-.59-2.07-2.45-2.07-3.95 0-3.21 2.33-6.16 6.72-6.16 3.53 0 6.27 2.52 6.27 5.89 0 3.51-2.21 6.34-5.28 6.34-1.03 0-2-.54-2.33-1.18l-.63 2.41c-.23.89-.85 2.01-1.27 2.69.95.29 1.95.45 2.98.45a9.5 9.5 0 1 0 0-19Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ShoppingBagIcon() {
  return (
    <ShoppingBag
      size={18}
      strokeWidth={2.5}
    />
  )
}