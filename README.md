# Picksy Store

**Picksy Store** is a product-discovery affiliate website for trending, affordable and useful finds — curated for you.

The website is designed to showcase products from marketplaces such as **Amazon, Flipkart and Meesho**, then send visitors to the original marketplace through affiliate links.

## Current features

### Public website
- Responsive Picksy Store homepage
- Product search and category browsing
- Trending, New Finds and Picksy Picks sections
- Best Deals / affordable finds sections
- Product detail pages
- Marketplace labels
- Product ratings and reviews
- Multiple product images
- Affiliate “View Deal” links
- Affiliate click tracking
- Wishlist using local browser storage
- Social links for Instagram, YouTube and Pinterest
- GitHub Pages-compatible routing

### Admin Panel
- Secure admin login through Supabase Auth
- Product add / edit / delete
- Product publishing controls
- Product image upload and management
- Marketplace selection
- Category management
- Trending / New / Picksy Pick tags
- Affiliate URL management
- Affiliate click analytics
- Click Activity charts
- Marketplace breakdown
- Product-category breakdown
- Top Clicked Products
- Earnings tracking placeholder
- Admin account settings
- Password change and logout

### Authentication
Public visitors **do not need an account** to use Picksy Store.

The public flow is intentionally simple:

**Discover product → View product → View Deal → Marketplace**

Only the **Admin Panel** requires authentication.

## Tech stack

- React
- TypeScript
- Vite
- React Router
- Supabase
- Lucide React
- GitHub Pages
- GitHub Actions

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Production build

```bash
npm run build
```

## Deployment

The project is deployed to GitHub Pages through GitHub Actions.

The production Vite base path is configured for:

```
/Picksy-Store/
```

## Supabase

Supabase is used for:

- Admin authentication
- Product data
- Categories
- Product image storage
- Affiliate click tracking

Required frontend environment variables:

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Never put Supabase service-role credentials or other private secrets in frontend code.

## Project structure

```
src/
├── components/
├── data/
├── lib/
├── pages/
└── types/

supabase/
└── migrations/

public/
└── static assets
```

## Brand

**Picksy Store**  
**Picksy = curated for you**

The goal is simple: **find the good stuff, so you don't have to.**
