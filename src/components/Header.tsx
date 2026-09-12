import { useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, User, X, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = { onSearch: (value: string) => void }

export default function Header({ onSearch }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark"><ShoppingBag size={18} strokeWidth={2.5} /></span>
          <span>
            <strong>Picksy</strong>
            <small>Curated for You</small>
          </span>
        </Link>

        <nav className={`desktop-nav ${open ? 'mobile-open' : ''}`}>
          <Link className="active" to="/">Home</Link>
          <a href="#trending">Trending</a>
          <a href="#new">New Finds</a>
          <a href="#categories">Categories</a>
          <a href="#under299">Under ₹299</a>
          <a href="#picks">Best Picks</a>
        </nav>

        <div className="header-actions">
          <form className="header-search" onSubmit={submit}>
            <Search size={17} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for products, categories..." />
          </form>
          <button className="icon-button" aria-label="Favorites"><Heart size={19} /></button>
          <button className="icon-button" aria-label="Account"><User size={19} /></button>
          <button className="menu-button icon-button" onClick={() => setOpen(v => !v)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}