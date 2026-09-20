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
        'Failed to load wishlist:',
        supabaseError
      )

      setError(
        'Unable to load your wishlist. Please try again.'
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

  const handleSearch = (
    value: string
  ) => {
    const query =
      value.trim()

    if (!query) {
      return
    }

    window.location.href =
      `${import.meta.env.BASE_URL}?search=${encodeURIComponent(
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
                  Wishlist
                </h1>

                <p>
                  Products you added to your wishlist.
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

          {loading && !error && (
            <div className="favorites-message">
              <h2>
                Loading wishlist...
              </h2>

              <p>
                Please wait while we
                fetch your wishlist finds.
              </p>
            </div>
          )}

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
                  Your wishlist is empty
                </h2>

                <p>
                  Found something you love? Tap the heart icon to add it to your wishlist.
                </p>

                <Link
                  className="primary-cta favorites-browse-button"
                  to="/"
                >
                  Explore Picksy Store
                </Link>
              </div>
            )}

          {!loading &&
            !error &&
            products.length > 0 && (
              <>
                <div className="favorites-count">
                  {products.length}{' '}
                  {products.length === 1
                    ? 'wishlist item'
                    : 'wishlist items'}
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
