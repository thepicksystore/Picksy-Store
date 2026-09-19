import {
  useEffect,
  useState,
} from 'react'

import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from 'lucide-react'

import { Link } from 'react-router-dom'

type Props = {
  onSearch: (value: string) => void
}

export default function Header({
  onSearch,
}: Props) {
  const [open, setOpen] = useState(false)

  const [query, setQuery] = useState('')

  const [favoriteCount, setFavoriteCount] = useState(0)

  const updateFavoriteCount = () => {
    try {
      const stored =
        localStorage.getItem(
          'picksy_favorites'
        )

      if (!stored) {
        setFavoriteCount(0)
        return
      }

      const parsed = JSON.parse(stored)

      setFavoriteCount(
        Array.isArray(parsed)
          ? parsed.length
          : 0
      )
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

  const submit = (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    onSearch(query)

    document
      .getElementById('discover')
      ?.scrollIntoView({
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
            onClick={() => setOpen(false)}
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
              aria-label={`Favorites${favoriteCount ? ` (${favoriteCount})` : ''}`}
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
          <Link
            to="/#categories"
            className="all-categories-button"
            onClick={() => setOpen(false)}
          >
            <Menu size={23} />
            <span>All Categories</span>
            <ChevronDown size={19} />
          </Link>

          <nav className={`desktop-nav ${open ? 'mobile-open' : ''}`}>
            <Link className="active" to="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link to="/#categories" onClick={() => setOpen(false)}>
              Categories
            </Link>
            <Link to="/#under299" onClick={() => setOpen(false)}>
              Best Deals
            </Link>
            <Link to="/#new" onClick={() => setOpen(false)}>
              New Arrivals
            </Link>
            <Link to="/#trending" onClick={() => setOpen(false)}>
              Trending
            </Link>
            <Link to="/#picks" onClick={() => setOpen(false)}>
              Contact
            </Link>
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
  )}
