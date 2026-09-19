import { Instagram, ShoppingBag, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'

function PinterestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5a9.5 9.5 0 0 0-3.47 18.34c-.08-1.55-.02-3.4.39-4.91l1.2-5.08s-.3-.61-.3-1.51c0-1.42.82-2.48 1.84-2.48.87 0 1.29.65 1.29 1.43 0 .87-.56 2.17-.85 3.38-.24 1.01.51 1.83 1.5 1.83 1.8 0 3.19-1.9 3.19-4.65 0-2.43-1.75-4.13-4.25-4.13-2.9 0-4.6 2.18-4.6 4.43 0 .88.34 1.83.76 2.34.08.1.09.19.07.29l-.28 1.14c-.05.18-.15.22-.34.13-1.27-.59-2.07-2.45-2.07-3.95 0-3.21 2.33-6.16 6.72-6.16 3.53 0 6.27 2.52 6.27 5.89 0 3.51-2.21 6.34-5.28 6.34-1.03 0-2-.54-2.33-1.18l-.63 2.41c-.23.89-.85 2.01-1.27 2.69.95.29 1.95.45 2.98.45a9.5 9.5 0 1 0 0-19Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ShoppingBagIcon() {
  return <ShoppingBag size={18} strokeWidth={2.5} />
}

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <img
              className="footer-brand-logo"
              src={`${import.meta.env.BASE_URL}picksy-logo.svg`}
              alt="Picksy Store"
            />
          </div>

          <p>
            Trending, affordable & useful finds — curated for you.
          </p>

          <div className="footer-socials">
            <a
              className="footer-social-pill"
              href="https://www.instagram.com/the.picksystore/"
              target="_blank"
              rel="noreferrer"
              aria-label="Picksy Store on Instagram"
            >
              <Instagram size={16} />
              Instagram
            </a>

            <a
              className="footer-social-pill"
              href="https://www.youtube.com/@the.picksystore"
              target="_blank"
              rel="noreferrer"
              aria-label="Picksy Store on YouTube"
            >
              <Youtube size={16} />
              YouTube
            </a>

            <a
              className="footer-social-pill"
              href="https://in.pinterest.com/thepicksystore/"
              target="_blank"
              rel="noreferrer"
              aria-label="Picksy Store on Pinterest"
            >
              <PinterestIcon />
              Pinterest
            </a>
          </div>
        </div>

        <div>
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/category/more">All Finds</Link>
          <Link to="/category/fashion">Fashion</Link>
          <Link to="/category/home">Home</Link>
        </div>

        <div>
          <h4>Categories</h4>
          <Link to="/category/women">Women</Link>
          <Link to="/category/men">Men</Link>
          <Link to="/category/kids">Kids</Link>
          <Link to="/category/kitchen">Kitchen</Link>
        </div>

        <div>
          <h4>Stay Updated</h4>
          <p>More trending finds. Less scrolling.</p>

          <div className="email-box">
            <input placeholder="Enter your email" />
            <button type="button">→</button>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 Picksy. All rights reserved.</span>

        <span>
          Picksy may earn a commission from qualifying purchases.
        </span>

        <span className="footer-credit">
          Designed &amp; Powered by Jay Bhadreshwara
        </span>
      </div>
    </footer>
  )
}
