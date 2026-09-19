import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
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

    // Special Under ₹299 filter
    if (q === 'under299') {
      return products.filter(
        (p) => p.price <= 299
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

  const under299 =
    filtered.filter(
      (p) => p.price <= 299
    )

  // =========================
  // UNDER ₹299 FILTER
  // =========================

  const showUnder299 = () => {
    setQuery('under299')
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
              Trending Finds
            </span>

            <h1>
              Big Savings
              <br />
              <span>Better Choices</span>
            </h1>

            <div className="hero-subline">
              <span>Quality products</span>
              <i />
              <span>Affordable prices</span>
              <i />
              <span>All in one place</span>
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
            <span className="hero-art-tag">Good Things Ahead ✨</span>
            <img
              src={`\${import.meta.env.BASE_URL}hero-shopping.svg`}
              alt="Picksy Store shopping finds"
            />
            <span className="hero-art-arrow">↗</span>
          </div>

          <div className="hero-slider-dots" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
          </div>
        </section>



        {/* =========================
            CATEGORIES
        ========================= */}

        <section
          id="categories"
          className="category-strip container"
        >
          <div className="section-heading compact">
            <h2>
              Shop by Category
            </h2>

            <Link to="/category/more">
              Explore all{' '}
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="category-row">
            {categories.map(
              (category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="category-link"
                  style={{
                    textDecoration:
                      'none',
                    color: 'inherit',
                  }}
                >
                  <span>
                    {categoryIcons[
                      category.slug
                    ] ?? '▦'}
                  </span>

                  <b>
                    {category.name}
                  </b>
                </Link>
              )
            )}

            <Link
              to="/category/more"
              className="category-link"
              style={{
                textDecoration:
                  'none',
                color: 'inherit',
              }}
            >
              <span>▦</span>

              <b>
                More
              </b>
            </Link>
          </div>
        </section>

        {/* =========================
            PRODUCTS
        ========================= */}

        <div id="discover">
          {query && (
            <div className="search-result container">
              <span>
                {query ===
                'under299' ? (
                  <>
                    Showing products{' '}
                    <b>
                      under ₹299
                    </b>
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
            UNDER ₹299
        ========================= */}

        <section
          id="under299"
          className="budget-banner container"
        >
          <div>
            <span className="budget-pill">
              👑 Budget Friendly
            </span>

            <h2>
              Under ₹299
            </h2>

            <p>
              Great quality. Amazing
              prices.
            </p>
          </div>

          <button
            onClick={showUnder299}
          >
            Explore Now{' '}
            <ArrowRight size={16} />
          </button>

          <div className="budget-items">
            {under299
              .slice(0, 4)
              .map((p) => (
                <img
                  key={p.id}
                  src={p.image}
                  alt={p.name}
                />
              ))}
          </div>
        </section>

        {/* =========================
            FESTIVAL
        ========================= */}

        <section className="festival-banner container">
          <div>
            <span>
              FESTIVAL SPECIAL FINDS
            </span>

            <h2>
              Make your celebrations
              more special ✨
            </h2>
          </div>

          <button>
            Explore Collection{' '}
            <ArrowRight size={16} />
          </button>

          <div className="festival-diyas">
            🪔 🪔 🪔
          </div>
        </section>


      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer id="footer" className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand footer-brand">
              <span className="brand-mark">
                <ShoppingBagIcon />
              </span>

              <span>
                <strong>
                  Picksy
                </strong>

                <small>
                  Curated for You
                </small>
              </span>
            </div>

            <p>
              Trending, affordable &
              useful finds — curated for
              you.
            </p>
          </div>

          <div>
            <h4>
              Explore
            </h4>

            <Link to="/category/more">
              All Finds
            </Link>

            <Link to="/category/fashion">
              Fashion
            </Link>

            <Link to="/category/home">
              Home
            </Link>

            <Link to="/category/kitchen">
              Kitchen
            </Link>
          </div>

          <div>
            <h4>
              Categories
            </h4>

            <Link to="/category/women">
              Women
            </Link>

            <Link to="/category/men">
              Men
            </Link>

            <Link to="/category/kids">
              Kids
            </Link>

            <Link to="/category/beauty">
              Beauty
            </Link>
          </div>

          <div>
            <h4>
              Stay Updated
            </h4>

            <p>
              More trending finds. Less
              scrolling.
            </p>

            <div className="email-box">
              <input
                placeholder="Enter your email"
              />

              <button>
                →
              </button>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>
            © 2026 Picksy. All rights
            reserved.
          </span>

          <span>
            Picksy may earn a commission
            from qualifying purchases.
          </span>
        </div>
      </footer>
    </>
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