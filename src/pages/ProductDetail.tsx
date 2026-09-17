import {
  useEffect,
  useState,
} from 'react'

import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
} from 'lucide-react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import { supabase } from '../lib/supabase'
import type { Product } from '../types/product'

import {
  isFavorite,
  toggleFavorite,
} from '../lib/favorites'

export default function ProductDetail() {
  const { id } = useParams()

  const [product, setProduct] =
    useState<Product | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [favorite, setFavorite] =
    useState(false)

  const [shareMessage, setShareMessage] =
    useState('')

  // =========================
  // LOAD PRODUCT
  // =========================

  useEffect(() => {
    async function loadProduct() {
      if (!id) {
        setLoading(false)
        setProduct(null)
        return
      }

      setLoading(true)

      const { data, error } =
        await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('published', true)
          .single()

      if (error) {
        console.error(
          'Failed to load product:',
          error
        )

        setProduct(null)
      } else if (data) {
        const mappedProduct: Product = {
          id: data.id,
          name: data.name,

          price: Number(
            data.price ?? 0
          ),

          originalPrice: Number(
            data.original_price ?? 0
          ),

          rating: Number(
            data.rating ?? 0
          ),

          reviews: String(
            data.reviews ?? 0
          ),

          marketplace:
            data.marketplace,

          category:
            data.category,

          image:
            data.image || '',

          affiliateUrl:
            data.affiliate_url || '',

          badge:
            data.badge || '',

          description:
            data.description || '',

          trending:
            Boolean(data.trending),

          isNew:
            Boolean(data.is_new),

          picksyPick:
            Boolean(data.picksy_pick),

          published:
            Boolean(data.published),
        }

        setProduct(mappedProduct)

        // Load favorite state
        setFavorite(
          isFavorite(data.id)
        )
      }

      setLoading(false)
    }

    loadProduct()
  }, [id])

  // =========================
  // LISTEN FOR FAVORITE CHANGES
  // =========================

  useEffect(() => {
    const handleFavoriteChange = () => {
      if (id) {
        setFavorite(
          isFavorite(id)
        )
      }
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
  }, [id])

  // =========================
  // TOGGLE FAVORITE
  // =========================

  const handleFavorite = () => {
    if (!product) {
      return
    }

    const newFavoriteState =
      toggleFavorite(product.id)

    setFavorite(newFavoriteState)

    window.dispatchEvent(
      new Event(
        'picksy-favorites-changed'
      )
    )
  }

  // =========================
  // AFFILIATE CLICK TRACKING
  // =========================

  const handleAffiliateClick = async () => {
    if (!product?.affiliateUrl) {
      return
    }

    const userAgent =
      navigator.userAgent || ''

    let deviceType = 'desktop'

    if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      deviceType = 'mobile'
    } else if (/Tablet|iPad/i.test(userAgent)) {
      deviceType = 'tablet'
    }

    const referrer =
      document.referrer || ''

    // Record the affiliate click.
    // We do not wait for this request before opening
    // the marketplace link, so the user experience stays fast.
    try {
      await supabase
        .from('affiliate_clicks')
        .insert({
          product_id: product.id,
          marketplace: product.marketplace,
          affiliate_url: product.affiliateUrl,
          referrer,
          user_agent: userAgent,
          device_type: deviceType,
        })
    } catch (error) {
      console.error(
        'Failed to record affiliate click:',
        error
      )
    }

    // Open the affiliate destination
    window.open(
      product.affiliateUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="not-found">
        <h1>
          Loading product...
        </h1>

        <p>
          Please wait while we fetch
          the details.
        </p>
      </main>
    )
  }

  // =========================
  // PRODUCT NOT FOUND
  // =========================

  if (!product) {
    return (
      <main className="not-found">
        <h1>
          Product not found
        </h1>

        <p>
          This product may have been
          removed or is no longer
          available.
        </p>

        <Link to="/">
          Back to Picksy
        </Link>
      </main>
    )
  }

  // =========================
  // DISCOUNT
  // =========================

  const discount =
    product.originalPrice > product.price &&
    product.originalPrice > 0
      ? Math.round(
          (1 -
            product.price /
              product.originalPrice) *
            100
        )
      : 0

  // =========================
  // SHARE
  // =========================

  const handleShare = async () => {
    setShareMessage('')

    const shareData = {
      title: product.name,
      text: `Check out this find on Picksy: ${product.name}`,
      url: window.location.href,
    }

    try {
      if (
        navigator.share
      ) {
        await navigator.share(
          shareData
        )

        return
      }

      await navigator.clipboard.writeText(
        window.location.href
      )

      setShareMessage(
        'Link copied!'
      )

      setTimeout(() => {
        setShareMessage('')
      }, 2500)
    } catch {
      // User cancelled sharing.
    }
  }

  return (
    <main className="detail-page">
      <div className="container">

        {/* =========================
            BACK
        ========================= */}

        <Link
          className="back-link"
          to="/"
        >
          <ArrowLeft size={16} />
          Back to finds
        </Link>

        <div className="detail-grid">

          {/* =========================
              PRODUCT IMAGE
          ========================= */}

          <div className="detail-image">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
              />
            ) : (
              <div
                style={{
                  minHeight: '400px',
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                  padding: '30px',
                }}
              >
                No image available
              </div>
            )}
          </div>

          {/* =========================
              PRODUCT DETAILS
          ========================= */}

          <div className="detail-copy">

            {/* MARKETPLACE */}

            <div>
              <span className="marketplace">
                {product.marketplace}
              </span>

              {product.badge && (
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {product.badge}
                </span>
              )}
            </div>

            {/* NAME */}

            <h1>
              {product.name}
            </h1>

            {/* RATING */}

            <div className="detail-rating">
              <Star
                size={17}
                fill="currentColor"
              />

              <span>
                {product.rating
                  ? product.rating.toFixed(1)
                  : '0.0'}
              </span>

              <span>
                (
                {product.reviews}
                {' '}
                reviews)
              </span>
            </div>

            {/* DESCRIPTION */}

            <p>
              {product.description ||
                'A useful and interesting find curated by Picksy.'}
            </p>

            {/* PRICE */}

            <div className="detail-price">

              <strong>
                ₹
                {product.price.toLocaleString(
                  'en-IN'
                )}
              </strong>

              {product.originalPrice >
                product.price && (
                <>
                  <del>
                    ₹
                    {product.originalPrice.toLocaleString(
                      'en-IN'
                    )}
                  </del>

                  {discount > 0 && (
                    <span>
                      {discount}% OFF
                    </span>
                  )}
                </>
              )}

            </div>

            {/* =========================
                ACTIONS
            ========================= */}

            <div className="detail-actions">

              {/* AFFILIATE LINK */}

              {product.affiliateUrl ? (
                <button
                  type="button"
                  className="primary-cta"
                  onClick={handleAffiliateClick}
                >
                  View Deal →
                </button>
              ) : (
                <button
                  className="primary-cta"
                  disabled
                  style={{
                    opacity: 0.6,
                    cursor:
                      'not-allowed',
                  }}
                >
                  Deal Link Coming Soon
                </button>
              )}

              {/* =========================
                  FAVORITE
              ========================= */}

              <button
                className={`secondary-cta ${
                  favorite
                    ? 'is-favorite'
                    : ''
                }`}
                type="button"
                onClick={handleFavorite}
                aria-pressed={favorite}
              >
                <Heart
                  size={18}
                  fill={
                    favorite
                      ? 'currentColor'
                      : 'none'
                  }
                />

                {favorite
                  ? 'Saved'
                  : 'Save'}
              </button>

              {/* SHARE */}

              <button
                className="secondary-cta"
                type="button"
                onClick={handleShare}
              >
                <Share2 size={18} />
                Share
              </button>

            </div>

            {/* SHARE MESSAGE */}

            {shareMessage && (
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {shareMessage}
              </div>
            )}

            {/* =========================
                PICKSY NOTE
            ========================= */}

            <div className="picksy-note">
              <span>
                ⭐
              </span>

              <div>
                <b>
                  Why Picksy picked this
                </b>

                <p>
                  It fits our focus on
                  useful, interesting
                  finds at a price worth
                  checking.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}