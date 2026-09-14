import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import Header from '../components/Header'
import Section from '../components/Section'
import { supabase } from '../lib/supabase'
import type { Product } from '../types/product'

const categoryInfo: Record<
  string,
  {
    title: string
    description: string
    emoji: string
  }
> = {
  women: {
    title: 'Women',
    description:
      'Trending fashion, beauty & lifestyle finds curated for you.',
    emoji: '👗',
  },

  men: {
    title: 'Men',
    description:
      'Smart, useful & stylish finds for everyday life.',
    emoji: '👕',
  },

  kids: {
    title: 'Kids',
    description:
      'Fun, useful & adorable finds for little ones.',
    emoji: '🧸',
  },

  home: {
    title: 'Home',
    description:
      'Make your space better with beautiful & useful finds.',
    emoji: '🏠',
  },

  kitchen: {
    title: 'Kitchen',
    description:
      'Smart kitchen finds that make everyday life easier.',
    emoji: '🍳',
  },

  beauty: {
    title: 'Beauty',
    description:
      'Trending beauty & self-care finds worth checking out.',
    emoji: '💄',
  },

  electronics: {
    title: 'Electronics',
    description:
      'Useful electronics and tech finds at smart prices.',
    emoji: '🎧',
  },

  gadgets: {
    title: 'Gadgets',
    description:
      'Cool, useful & trending gadgets you might love.',
    emoji: '📷',
  },

  fashion: {
    title: 'Fashion',
    description:
      'Trending fashion finds for every style and occasion.',
    emoji: '🧥',
  },

  more: {
    title: 'All Finds',
    description:
      'Explore all the latest Picksy finds in one place.',
    emoji: '✨',
  },
}

export default function Category() {
  const { categoryName } = useParams()
  const navigate = useNavigate()

  const categoryKey = decodeURIComponent(
    categoryName ?? ''
  )
    .trim()
    .toLowerCase()

  const info =
    categoryInfo[categoryKey] ??
    categoryInfo.more

  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // =========================
  // LOAD PRODUCTS
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
          'Failed to load category products:',
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
          isNew: Boolean(p.is_new),
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
  }, [categoryKey])

  // =========================
  // CATEGORY + SEARCH FILTER
  // =========================

  const filteredProducts = useMemo(() => {
    let result = products

    // More = all products
    if (categoryKey !== 'more') {
      result = result.filter(
        (product) =>
          String(
            product.category ?? ''
          )
            .trim()
            .toLowerCase() ===
          categoryKey
      )
    }

    const q = query
      .trim()
      .toLowerCase()

    if (!q) {
      return result
    }

    return result.filter((product) =>
      [
        product.name,
        product.category,
        product.marketplace,
        product.description,
      ].some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(q)
      )
    )
  }, [
    products,
    query,
    categoryKey,
  ])

  // =========================
  // PRODUCT GROUPS
  // =========================

  const trending =
    filteredProducts.filter(
      (product) => product.trending
    )

  const newest =
    filteredProducts.filter(
      (product) => product.isNew
    )

  const picks =
    filteredProducts.filter(
      (product) =>
        product.picksyPick
    )

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <>
        <Header onSearch={setQuery} />

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
            in this category.
          </p>
        </main>
      </>
    )
  }

  // =========================
  // ERROR
  // =========================

  if (loadError) {
    return (
      <>
        <Header onSearch={setQuery} />

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
      <Header onSearch={setQuery} />

      <main>
        {/* =========================
            CATEGORY HERO
        ========================= */}

        <section className="container">
          <div
            style={{
              padding:
                '55px 0 35px',
            }}
          >
            <button
              onClick={() =>
                navigate('/')
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: 0,
                background:
                  'transparent',
                padding: 0,
                marginBottom: '22px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#666',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={15} />
              Back to Home
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '42px',
                  lineHeight: 1,
                }}
              >
                {info.emoji}
              </span>

              <h1
                style={{
                  margin: 0,
                }}
              >
                {info.title}
              </h1>
            </div>

            <p
              style={{
                margin: 0,
                maxWidth: '620px',
                color: '#666',
                fontSize: '15px',
                lineHeight: 1.7,
              }}
            >
              {info.description}
            </p>
          </div>
        </section>

        {/* =========================
            SEARCH RESULT
        ========================= */}

        {query && (
          <div className="search-result container">
            <span>
              Showing results for{' '}
              <b>
                “{query}”
              </b>
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

        {/* =========================
            ALL PRODUCTS
        ========================= */}

        <Section
          id="category-products"
          title={`${info.title} Finds`}
          eyebrow={`${filteredProducts.length} ${
            filteredProducts.length === 1
              ? 'product'
              : 'products'
          } to explore`}
          icon={
            <span>
              {info.emoji}
            </span>
          }
          products={filteredProducts}
        />

        {/* =========================
            TRENDING
        ========================= */}

        {trending.length > 0 && (
          <Section
            id="category-trending"
            title="Trending in this Category"
            eyebrow="Popular picks worth checking out"
            icon={
              <span>🔥</span>
            }
            products={trending}
          />
        )}

        {/* =========================
            NEW
        ========================= */}

        {newest.length > 0 && (
          <Section
            id="category-new"
            title="New Finds"
            eyebrow="Fresh additions to Picksy"
            icon={
              <span>✨</span>
            }
            products={newest}
          />
        )}

        {/* =========================
            PICKS
        ========================= */}

        {picks.length > 0 && (
          <Section
            id="category-picks"
            title="Picksy Picks"
            eyebrow="Handpicked favourites"
            icon={
              <span>⭐</span>
            }
            products={picks}
          />
        )}

        {/* =========================
            NO PRODUCTS
        ========================= */}

        {filteredProducts.length === 0 && (
          <section
            className="container"
            style={{
              padding:
                '20px 20px 80px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '44px',
                marginBottom: '12px',
              }}
            >
              🔎
            </div>

            <h2>
              No products found
            </h2>

            <p
              style={{
                color: '#777',
              }}
            >
              We don't have any published
              products in this category yet.
            </p>

            {query && (
              <button
                className="admin-primary-btn"
                onClick={() =>
                  setQuery('')
                }
                style={{
                  marginTop: '12px',
                  padding:
                    '11px 18px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                Clear Search
              </button>
            )}
          </section>
        )}

        {/* =========================
            CATEGORY NAVIGATION
        ========================= */}

        <section
          className="container"
          style={{
            padding:
              '10px 20px 70px',
          }}
        >
          <div
            style={{
              borderTop:
                '1px solid var(--border)',
              paddingTop: '30px',
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: '16px',
              }}
            >
              Explore More Categories
            </h3>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              {Object.entries(
                categoryInfo
              ).map(
                ([
                  key,
                  category,
                ]) => (
                  <Link
                    key={key}
                    to={`/category/${key}`}
                    style={{
                      display:
                        'inline-flex',
                      alignItems:
                        'center',
                      gap: '7px',
                      padding:
                        '9px 13px',
                      border:
                        '1px solid var(--border)',
                      borderRadius:
                        '999px',
                      background:
                        '#fff',
                      color:
                        'inherit',
                      textDecoration:
                        'none',
                      fontSize:
                        '12px',
                      fontWeight: 700,
                    }}
                  >
                    <span>
                      {category.emoji}
                    </span>

                    {category.title}
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">
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
              useful finds — curated
              for you.
            </p>
          </div>

          <div>
            <h4>
              Explore
            </h4>

            <Link to="/">
              Home
            </Link>

            <Link to="/category/more">
              All Finds
            </Link>

            <Link to="/category/fashion">
              Fashion
            </Link>

            <Link to="/category/home">
              Home
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

            <Link to="/category/kitchen">
              Kitchen
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