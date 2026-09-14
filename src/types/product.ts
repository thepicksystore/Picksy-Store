export type Marketplace = 'Amazon' | 'Flipkart' | 'Meesho'

export type Product = {
  id: string
  name: string
  price: number
  originalPrice: number
  rating: number
  reviews: string
  marketplace: Marketplace
  category: string
  image: string
  affiliateUrl?: string
  badge?: string
  description: string

  trending?: boolean
  isNew?: boolean
  picksyPick?: boolean
  published?: boolean
}