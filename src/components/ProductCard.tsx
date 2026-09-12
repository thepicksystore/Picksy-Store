import { Heart, Star, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../types/product'

const marketplaceClass = (name: string) => name.toLowerCase()

export default function ProductCard({ product }: { product: Product }) {
  const discount = Math.round((1 - product.price / product.originalPrice) * 100)

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.badge && <span className={`product-badge ${product.badge === 'Picksy Pick' ? 'pick' : product.badge === 'New' ? 'new' : ''}`}>{product.badge}</span>}
        <button className="card-heart" aria-label={`Save ${product.name}`}><Heart size={17} /></button>
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
      </div>
      <div className="product-content">
        <div className="product-meta">
          <span className={`marketplace ${marketplaceClass(product.marketplace)}`}>{product.marketplace}</span>
          <span className="rating"><Star size={12} fill="currentColor" /> {product.rating} <em>({product.reviews})</em></span>
        </div>
        <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <div className="price-row">
          <strong>₹{product.price.toLocaleString('en-IN')}</strong>
          <del>₹{product.originalPrice.toLocaleString('en-IN')}</del>
          <span>{discount}% OFF</span>
        </div>
        <a className="shop-button" href="#" onClick={e => e.preventDefault()}>
          Shop Now <ExternalLink size={14} />
        </a>
      </div>
    </article>
  )
}