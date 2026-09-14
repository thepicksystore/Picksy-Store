import {
  useEffect,
  useState,
} from 'react'

import {
  ArrowLeft,
  Heart,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

import Header from '../components/Header'
import ProductCard from '../components/ProductCard'

import type { Product } from '../types/product'

import {
  getFavoriteIds,
} from '../lib/favorites'

import { supabase } from '../lib/supabase'

export default function Favorites() {
  const [products, setProducts] =
    useState<Product[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  // =========================
  // LOAD FAVORITES
  // =========================

  const loadFavorites = async () => {
    setLoading(true)
    setError('')

    const favoriteIds =
      getFavoriteIds()

    if (
      favoriteIds.length === 0
    ) {
      setProducts([])
      setLoading(false)
      return
    }

    const {
      data,
      error: supabaseError,
    } = await supabase
      .from('products')
      .select('*')
      .eq('published', true)
      .in('id', favoriteIds)

    if (supabaseError) {
      console.error(
        'Failed to load favorites:',
        supabaseError
      )

      setError(
        'Unable to load your favorites. Please try again.'
      )

      setProducts([])
      setLoading(false)

      return
    }

    const mappedProducts: Product[] =
      (data ?? []).map(
        (item) => ({
          id: item.id,
          name: item.name,

          price: Number(
            item.price ?? 0
          ),

          originalPrice: Number(
            item.original_price ?? 0
          ),

          rating: Number(
            item.rating ?? 0
          ),

          reviews: String(
            item.reviews ?? 0
          ),

          marketplace:
            item.marketplace,

          category:
            item.category,

          image:
            item.image || '',

          affiliateUrl:
            item.affiliate_url ||
            '',

          badge:
            item.badge || '',

          description:
            item.description ||
            '',

          trending:
            Boolean(
              item.trending
            ),

          isNew:
            Boolean(
              item.is_new
            ),

          picksyPick:
            Boolean(
              item.picksy_pick
            ),

          published:
            Boolean(
              item.published
            ),
        })
      )

    // Keep the same order as saved favorites
    const orderedProducts =
      favoriteIds
        .map((id) =>
          mappedProducts.find(
            (product) =>
              product.id === id
          )
        )
        .filter(
          (
            product
          ): product is Product =>
            Boolean(product)
        )

    setProducts(
      orderedProducts
    )

    setLoading(false)
  }

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadFavorites()

    const handleFavoriteChange =
      () => {
        loadFavorites()
      }

    window.addEventListener(
      'picksy-favorites-changed',
      handleFavoriteChange
    )

    return () => {
      window.removeEventListener(
        'picksy-favorites-changed',
        handleFavoriteChange
      )
    }
  }, [])

  // =========================
  // SEARCH
  // =========================

  const handleSearch = (
    value: string
  ) => {
    const query =
      value.trim()

    if (!query) {
      return
    }

    window.location.href =
      `/?search=${encodeURIComponent(
        query
      )}`
  }

  return (
    <>
      <Header
        onSearch={handleSearch}
      />

      <main className="favorites-page">
        <div className="container">

          {/* =========================
              PAGE HEADER
          ========================= */}

          <div className="favorites-header">

            <Link
              className="back-link"
              to="/"
            >
              <ArrowLeft
                size={16}
              />

              Back to finds
            </Link>

            <div className="favorites-title-row">

              <div>
                <span className="section-kicker">
                  YOUR SAVED FINDS
                </span>

                <h1>
                  Favorites
                </h1>

                <p>
                  Products you saved
                  to check later.
                </p>
              </div>

              <div className="favorites-icon">
                <Heart
                  size={30}
                  fill="currentColor"
                />
              </div>

            </div>
          </div>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="favorites-message">
              <strong>
                Something went wrong
              </strong>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={
                  loadFavorites
                }
              >
                Try Again
              </button>
            </div>
          )}

          {/* =========================
              LOADING
          ========================= */}

          {loading && !error && (
            <div className="favorites-message">
              <h2>
                Loading favorites...
              </h2>

              <p>
                Please wait while we
                fetch your saved finds.
              </p>
            </div>
          )}

          {/* =========================
              EMPTY STATE
          ========================= */}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="favorites-empty">

                <div className="favorites-empty-icon">
                  <Heart
                    size={34}
                  />
                </div>

                <h2>
                  No favorites yet
                </h2>

                <p>
                  Found something you
                  love? Tap the heart
                  icon and save it here.
                </p>

                <Link
                  className="primary-cta favorites-browse-button"
                  to="/"
                >
                  Explore Picksy
                </Link>

              </div>
            )}

          {/* =========================
              FAVORITE PRODUCTS
          ========================= */}

          {!loading &&
            !error &&
            products.length > 0 && (
              <>
                <div className="favorites-count">
                  {products.length}{' '}
                  {products.length === 1
                    ? 'saved find'
                    : 'saved finds'}
                </div>

                <div className="favorites-grid">
                  {products.map(
                    (product) => (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}

        </div>
      </main>
    </>
  )
}