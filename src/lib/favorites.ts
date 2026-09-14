import type { Product } from '../types/product'

const FAVORITES_KEY = 'picksy_favorites'

export function getFavoriteIds(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    return Array.isArray(parsed)
      ? parsed.filter(
          (id): id is string =>
            typeof id === 'string'
        )
      : []
  } catch {
    return []
  }
}

export function isFavorite(
  productId: string
): boolean {
  return getFavoriteIds().includes(productId)
}

export function toggleFavorite(
  productId: string
): boolean {
  const favorites = getFavoriteIds()

  if (favorites.includes(productId)) {
    const updated = favorites.filter(
      (id) => id !== productId
    )

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updated)
    )

    return false
  }

  const updated = [
    ...favorites,
    productId,
  ]

  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(updated)
  )

  return true
}

export function removeFavorite(
  productId: string
): void {
  const favorites = getFavoriteIds()

  const updated = favorites.filter(
    (id) => id !== productId
  )

  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(updated)
  )
}

export function getFavoriteProducts(
  products: Product[]
): Product[] {
  const favoriteIds = getFavoriteIds()

  return favoriteIds
    .map((id) =>
      products.find(
        (product) => product.id === id
      )
    )
    .filter(
      (product): product is Product =>
        Boolean(product)
    )
}