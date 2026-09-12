import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import ProductCard from './ProductCard'
import type { Product } from '../types/product'

type Props = {
  id?: string
  title: string
  eyebrow?: string
  products: Product[]
  icon?: ReactNode
  viewHref?: string
}

export default function Section({ id, title, eyebrow, products, icon, viewHref = '#discover' }: Props) {
  return (
    <section id={id} className="section container">
      <div className="section-heading">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2>{icon}{title}</h2>
        </div>
        <a href={viewHref}>View all <ArrowRight size={15} /></a>
      </div>
      <div className="product-grid">
        {products.map(product => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  )
}