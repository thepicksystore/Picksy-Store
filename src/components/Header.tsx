import {
  useEffect,
  useState,
} from 'react'

import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
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
  const [open, setOpen] =
    useState(false)

  const [query, setQuery] =
    useState('')

  const [favoriteCount, setFavoriteCount] =
    useState(0)

  // =========================
  // LOAD FAVORITE COUNT
  // =========================

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

  // =========================
  // SEARCH
  // =========================

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
      <div className="container header-inner">

        {/* =========================
            BRAND
        ========================= */}

        <Link
          to="/"
          className="brand"
          onClick={() =>
            setOpen(false)
          }
        >
          <span className="brand-mark">
            <ShoppingBag
              size={18}
              strokeWidth={2.5}
            />
          </span>

          <span>
            <strong>
              Picksy
            </strong>

            <small>
              Curated for You
            </small>
          </span>
        </Link>

        {/* =========================
            NAVIGATION
        ========================= */}

        <nav
          className={`desktop-nav ${
            open
              ? 'mobile-open'
              : ''
          }`}
        >
          <Link
            className="active"
            to="/"
            onClick={() =>
              setOpen(false)
            }
          >
            Home
          </Link>

          <a
            href="/#trending"
            onClick={() =>
              setOpen(false)
            }
          >
            Trending
          </a>

          <a
            href="/#new"
            onClick={() =>
              setOpen(false)
            }
          >
            New Finds
          </a>

          <a
            href="/#categories"
            onClick={() =>
              setOpen(false)
            }
          >
            Categories
          </a>

          <a
            href="/#under299"
            onClick={() =>
              setOpen(false)
            }
          >
            Under ₹299
          </a>

          <a
            href="/#picks"
            onClick={() =>
              setOpen(false)
            }
          >
            Best Picks
          </a>
        </nav>

        {/* =========================
            HEADER ACTIONS
        ========================= */}

        <div className="header-actions">

          {/* SEARCH */}

          <form
            className="header-search"
            onSubmit={submit}
          >
            <Search size={17} />

            <input
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
              placeholder="Search for products, categories..."
            />
          </form>

          {/* =========================
              FAVORITES
          ========================= */}

          <Link
            to="/favorites"
            className="icon-button favorite-header-button"
            aria-label={`Favorites${
              favoriteCount
                ? ` (${favoriteCount})`
                : ''
            }`}
            onClick={() =>
              setOpen(false)
            }
          >
            <Heart
              size={19}
              fill={
                favoriteCount > 0
                  ? 'currentColor'
                  : 'none'
              }
            />

            {favoriteCount > 0 && (
              <span className="favorite-count">
                {favoriteCount > 99
                  ? '99+'
                  : favoriteCount}
              </span>
            )}
          </Link>

          {/* ACCOUNT */}

          <button
            className="icon-button"
            aria-label="Account"
            type="button"
          >
            <User size={19} />
          </button>

          {/* MENU */}

          <button
            className="menu-button icon-button"
            onClick={() =>
              setOpen(
                (value) => !value
              )
            }
            aria-label="Menu"
            type="button"
          >
            {open ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}