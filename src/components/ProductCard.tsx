import { useEffect, useState } from 'react'
import {
  Heart,
  Star,
  ExternalLink,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../types/product'
import {
  isFavorite,
  toggleFavorite,
} from '../lib/favorites'

import { supabase } from '../lib/supabase'

const marketplaceClass = (name: string) =>
  name.toLowerCase()

export default function ProductCard({
  product,
}: {
  product: Product
}) {
  const [favorite, setFavorite] = useState(false)

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
  // LOAD FAVORITE STATUS
  // =========================

  useEffect(() => {
    setFavorite(isFavorite(product.id))
  }, [product.id])

  // =========================
  // TOGGLE FAVORITE
  // =========================

  const handleFavorite = () => {
    const newFavoriteState =
      toggleFavorite(product.id)

    setFavorite(newFavoriteState)

    // Tell other components that favorites changed
    window.dispatchEvent(
      new Event('picksy-favorites-changed')
    )
  }

  // =========================
  // AFFILIATE CLICK TRACKING
  // =========================

  const handleAffiliateClick = () => {
    if (!product.affiliateUrl) {
      return
    }

    const affiliateUrl =
      product.affiliateUrl.trim()

    if (!affiliateUrl) {
      return
    }

    const userAgent =
      navigator.userAgent || ''

    let deviceType = 'desktop'

    if (
      /Mobi|Android|iPhone|iPad|iPod/i.test(
        userAgent
      )
    ) {
      deviceType = 'mobile'
    } else if (
      /Tablet|iPad/i.test(userAgent)
    ) {
      deviceType = 'tablet'
    }

    const referrer =
      document.referrer || ''

    // Open marketplace affiliate URL FIRST.
    // This keeps the action directly connected
    // to the user's click and avoids popup blockers.
    window.open(
      affiliateUrl,
      '_blank',
      'noopener,noreferrer'
    )

    // Record affiliate click in Supabase
    // in the background without delaying navigation.
    void supabase
      .from('affiliate_clicks')
      .insert({
        product_id: product.id,
        marketplace: product.marketplace,
        affiliate_url: affiliateUrl,
        referrer,
        user_agent: userAgent,
        device_type: deviceType,
      })
      .then(({ error }) => {
        if (error) {
          console.error(
            'Failed to record affiliate click:',
            error
          )
        }
      })
  }

  return (
    <article className="product-card">
      {/* =========================
          PRODUCT IMAGE
      ========================= */}

      <div className="product-image-wrap">
        {product.badge && (
          <span
            className={`product-badge ${
              product.badge === 'Picksy Pick'
                ? 'pick'
                : product.badge === 'New'
                  ? 'new'
                  : ''
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* =========================
            SAVE / FAVORITE
        ========================= */}

        <button
          className={`card-heart ${
            favorite ? 'is-favorite' : ''
          }`}
          type="button"
          aria-label={
            favorite
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={favorite}
          onClick={handleFavorite}
        >
          <Heart
            size={17}
            fill={
              favorite
                ? 'currentColor'
                : 'none'
            }
          />
        </button>

        {/* =========================
            PRODUCT DETAIL
        ========================= */}

        <Link
          to={`/product/${product.id}`}
          aria-label={`View ${product.name}`}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                minHeight: '220px',
                display: 'grid',
                placeItems: 'center',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              No image
            </div>
          )}
        </Link>
      </div>

      {/* =========================
          PRODUCT CONTENT
      ========================= */}

      <div className="product-content">

        {/* META */}

        <div className="product-meta">
          <span
            className={`marketplace ${marketplaceClass(
              product.marketplace
            )}`}
          >
            {product.marketplace}
          </span>

          <span className="rating">
            <Star
              size={12}
              fill="currentColor"
            />

            {product.rating
              ? product.rating.toFixed(1)
              : '0.0'}

            <em>
              ({product.reviews})
            </em>
          </span>
        </div>

        {/* PRODUCT NAME */}

        <Link
          to={`/product/${product.id}`}
          className="product-name"
        >
          {product.name}
        </Link>

        {/* PRICE */}

        <div className="price-row">
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
            AFFILIATE SHOP BUTTON
        ========================= */}

        {product.affiliateUrl ? (
          <button
            className="shop-button"
            type="button"
            onClick={
              handleAffiliateClick
            }
          >
            Shop Now
            <ExternalLink size={14} />
          </button>
        ) : (
          <button
            className="shop-button"
            type="button"
            disabled
            style={{
              opacity: 0.55,
              cursor: 'not-allowed',
            }}
          >
            Deal Coming Soon
            <ExternalLink size={14} />
          </button>
        )}

      </div>
    </article>
  )
}