import { ArrowLeft, Heart, Share2, Star } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { products } from '../data/products'

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find(p => p.id === id)

  if (!product) return <main className="not-found"><h1>Product not found</h1><Link to="/">Back to Picksy</Link></main>

  const discount = Math.round((1 - product.price / product.originalPrice) * 100)

  return (
    <main className="detail-page">
      <div className="container">
        <Link className="back-link" to="/"><ArrowLeft size={16} /> Back to finds</Link>
        <div className="detail-grid">
          <div className="detail-image"><img src={product.image} alt={product.name} /></div>
          <div className="detail-copy">
            <span className="marketplace">{product.marketplace}</span>
            <h1>{product.name}</h1>
            <div className="detail-rating"><Star size={17} fill="currentColor" /> {product.rating} <span>({product.reviews} reviews)</span></div>
            <p>{product.description}</p>
            <div className="detail-price"><strong>₹{product.price.toLocaleString('en-IN')}</strong><del>₹{product.originalPrice.toLocaleString('en-IN')}</del><span>{discount}% OFF</span></div>
            <div className="detail-actions">
              <a className="primary-cta" href="#" onClick={e => e.preventDefault()}>View Deal →</a>
              <button className="secondary-cta"><Heart size={18} /> Save</button>
              <button className="secondary-cta"><Share2 size={18} /> Share</button>
            </div>
            <div className="picksy-note"><span>⭐</span><div><b>Why Picksy picked this</b><p>It fits our focus on useful, interesting finds at a price worth checking.</p></div></div>
          </div>
        </div>
      </div>
    </main>
  )
}