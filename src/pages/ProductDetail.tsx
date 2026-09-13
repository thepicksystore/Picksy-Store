import { useEffect, useState } from 'react'
import { ArrowLeft, Heart, Share2, Star } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import type { Product } from '../types/product'

export default function ProductDetail() {
  const { id } = useParams()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProduct() {
      if (!id) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .single()

      if (error) {
        console.error('Failed to load product:', error)
        setProduct(null)
      } else if (data) {
        const mappedProduct: Product = {
          id: data.id,
          name: data.name,
          price: Number(data.price ?? 0),
          originalPrice: Number(data.original_price ?? 0),
          rating: Number(data.rating ?? 0),
          reviews: String(data.reviews ?? 0),
          marketplace: data.marketplace,
          category: data.category,
          image: data.image || '',
          affiliateUrl: data.affiliate_url || '',
          badge: data.badge || '',
          description: data.description || '',
          trending: data.trending ?? false,
          isNew: data.is_new ?? false,
          picksyPick: data.picksy_pick ?? false,
        }

        setProduct(mappedProduct)
      }

      setLoading(false)
    }

    loadProduct()
  }, [id])

  if (loading) {
    return (
      <main className="not-found">
        <h1>Loading product...</h1>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="not-found">
        <h1>Product not found</h1>

        <Link to="/">
          Back to Picksy
        </Link>
      </main>
    )
  }

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          (1 - product.price / product.originalPrice) * 100
        )
      : 0

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: `Check out this find on Picksy: ${product.name}`,
        url: window.location.href,
      })
    } catch {
      // User cancelled sharing or browser doesn't support it.
    }
  }

  return (
    <main className="detail-page">
      <div className="container">
        <Link className="back-link" to="/">
          <ArrowLeft size={16} />
          Back to finds
        </Link>

        <div className="detail-grid">
          {/* PRODUCT IMAGE */}
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
                }}
              >
                No image available
              </div>
            )}
          </div>

          {/* PRODUCT DETAILS */}
          <div className="detail-copy">
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

            <h1>{product.name}</h1>

            <div className="detail-rating">
              <Star
                size={17}
                fill="currentColor"
              />

              {product.rating}

              <span>
                ({product.reviews} reviews)
              </span>
            </div>

            <p>
              {product.description ||
                'A useful and interesting find curated by Picksy.'}
            </p>

            <div className="detail-price">
              <strong>
                ₹{product.price.toLocaleString('en-IN')}
              </strong>

              {product.originalPrice > product.price && (
                <>
                  <del>
                    ₹
                    {product.originalPrice.toLocaleString(
                      'en-IN'
                    )}
                  </del>

                  <span>
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="detail-actions">
              {/* AFFILIATE LINK */}
              {product.affiliateUrl ? (
                <a
                  className="primary-cta"
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                >
                  View Deal →
                </a>
              ) : (
                <button
                  className="primary-cta"
                  disabled
                  style={{
                    opacity: 0.6,
                    cursor: 'not-allowed',
                  }}
                >
                  Deal Link Coming Soon
                </button>
              )}

              <button className="secondary-cta">
                <Heart size={18} />
                Save
              </button>

              <button
                className="secondary-cta"
                onClick={handleShare}
              >
                <Share2 size={18} />
                Share
              </button>
            </div>

            <div className="picksy-note">
              <span>⭐</span>

              <div>
                <b>Why Picksy picked this</b>

                <p>
                  It fits our focus on useful,
                  interesting finds at a price worth
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