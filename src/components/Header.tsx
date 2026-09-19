import {
  useEffect,
  useState,
} from 'react'

import {
  Heart,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

import { Link } from 'react-router-dom'

type Props = {
  onSearch: (value: string) => void
}

type NavKey =
  | 'best'
  | 'new'
  | 'trending'
  | 'picks'
  | 'categories'
  | 'contact'

export default function Header({
  onSearch,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [activeNav, setActiveNav] = useState<NavKey | null>(null)

  const updateFavoriteCount = () => {
    try {
      const stored = localStorage.getItem('picksy_favorites')

      if (!stored) {
        setFavoriteCount(0)
        return
      }

      const parsed = JSON.parse(stored)
      setFavoriteCount(Array.isArray(parsed) ? parsed.length : 0)
    } catch {
      setFavoriteCount(0)
    }
  }

  useEffect(() => {
    updateFavoriteCount()

    window.addEventListener(
      'picksy-favorites-changed',
      updateFavoriteCount
    )

    return () => {
      window.removeEventListener(
        'picksy-favorites-changed',
        updateFavoriteCount
      )
    }
  }, [])

  const scrollToId = (id: string, navKey: NavKey) => {
    setOpen(false)
    setActiveNav(navKey)

    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const goHome = () => {
    setOpen(false)
    setActiveNav(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
    document.getElementById('discover')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="container header-top-inner">
          <Link
            to="/"
            className="brand"
            onClick={goHome}
            aria-label="Picksy Store"
          >
            <img
              className="brand-logo"
              src={`${import.meta.env.BASE_URL}picksy-logo.svg`}
              alt="Picksy Store"
            />
          </Link>

          <form className="header-search" onSubmit={submit}>
            <Search size={22} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, categories..."
            />
          </form>

          <div className="header-top-actions">
            <Link
              to="/favorites"
              className="header-action-link"
              aria-label={
                `Favorites${favoriteCount ? ` (${favoriteCount})` : ''}`
              }
              onClick={() => setOpen(false)}
            >
              <span className="header-action-icon">
                <Heart
                  size={30}
                  strokeWidth={1.7}
                  fill={favoriteCount > 0 ? 'currentColor' : 'none'}
                />
                {favoriteCount > 0 && (
                  <span className="favorite-count">
                    {favoriteCount > 99 ? '99+' : favoriteCount}
                  </span>
                )}
              </span>
              <span>Favorites</span>
            </Link>

            <button className="header-action-link" type="button" aria-label="Cart">
              <span className="header-action-icon">
                <ShoppingCart size={30} strokeWidth={1.7} />
                <span className="cart-count">0</span>
              </span>
              <span>Cart</span>
            </button>

            <Link
              to="/admin"
              className="header-action-link"
              aria-label="Admin"
              onClick={() => setOpen(false)}
            >
              <span className="header-action-icon">
                <User size={30} strokeWidth={1.7} />
              </span>
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="header-nav-row">
        <div className="container header-nav-inner">
          <nav className={`desktop-nav ${open ? 'mobile-open' : ''}`}>
            <button
              type="button"
              className={activeNav === 'best' ? 'active' : ''}
              onClick={() => scrollToId('under299', 'best')}
            >
              Best Deals
            </button>

            <button
              type="button"
              className={activeNav === 'new' ? 'active' : ''}
              onClick={() => scrollToId('new', 'new')}
            >
              New Arrivals
            </button>

            <button
              type="button"
              className={activeNav === 'trending' ? 'active' : ''}
              onClick={() => scrollToId('trending', 'trending')}
            >
              Trending
            </button>

            <button
              type="button"
              className={activeNav === 'picks' ? 'active' : ''}
              onClick={() => scrollToId('picks', 'picks')}
            >
              Picksy Pick
            </button>

            <button
              type="button"
              className={
                activeNav === 'categories'
                  ? 'all-categories-button active'
                  : 'all-categories-button'
              }
              onClick={() => scrollToId('categories', 'categories')}
            >
              <Menu size={21} />
              <span>All Categories</span>
              <ChevronDown size={18} />
            </button>

            <button
              type="button"
              className={activeNav === 'contact' ? 'active' : ''}
              onClick={() => scrollToId('footer', 'contact')}
            >
              Contact
            </button>
          </nav>

          <button
            className="menu-button icon-button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}