import type { Product } from '../types/product'

const img = (seed: string) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=700&q=85`

export const products: Product[] = [
  {
    id: 'wireless-earbuds',
    name: 'boAt Airdopes 141 Wireless Earbuds',
    price: 1299, originalPrice: 2999, rating: 4.3, reviews: '12.5k',
    marketplace: 'Amazon', category: 'Electronics',
    image: img('photo-1606220945770-b5b6c2c55bf1'),
    badge: 'Trending', trending: true,
    description: 'Compact wireless earbuds with a clean everyday look and great value.'
  },
  {
    id: 'smartwatch',
    name: 'Fire-Boltt Ninja Calling Smartwatch',
    price: 1999, originalPrice: 4999, rating: 4.2, reviews: '8.3k',
    marketplace: 'Flipkart', category: 'Gadgets',
    image: img('photo-1523275335684-37898b6baf30'),
    badge: 'Trending', trending: true,
    description: 'A stylish everyday smartwatch for calls, notifications and activity tracking.'
  },
  {
    id: 'moon-lamp',
    name: '3D Moon Lamp Night Light',
    price: 299, originalPrice: 799, rating: 4.4, reviews: '6.2k',
    marketplace: 'Meesho', category: 'Home',
    image: img('photo-1513506003901-1e6a229e2d15'),
    badge: 'Trending', trending: true,
    description: 'A warm decorative lamp that adds a cozy touch to bedrooms and corners.'
  },
  {
    id: 'air-fryer',
    name: 'Philips Air Fryer (4.1L)',
    price: 7499, originalPrice: 12999, rating: 4.5, reviews: '4.2k',
    marketplace: 'Amazon', category: 'Kitchen',
    image: img('photo-1585515320310-259814833e62'),
    badge: 'Best Rated', trending: true,
    description: 'A practical air fryer for everyday cooking with less oil.'
  },
  {
    id: 'backpack',
    name: 'Safari 28L Laptop Backpack',
    price: 1199, originalPrice: 2499, rating: 4.1, reviews: '2.8k',
    marketplace: 'Flipkart', category: 'Accessories',
    image: img('photo-1553062407-98eeb64c6a62'),
    badge: 'Trending', trending: true,
    description: 'A versatile backpack for college, work and everyday travel.'
  },
  {
    id: 'bottle',
    name: 'Milton Thermosteel Water Bottle',
    price: 749, originalPrice: 999, rating: 4.4, reviews: '1.2k',
    marketplace: 'Amazon', category: 'Lifestyle',
    image: img('photo-1602143407151-7111542de6e8'),
    badge: 'New', isNew: true,
    description: 'A reusable bottle designed for everyday hydration on the go.'
  },
  {
    id: 'ring-light',
    name: '10” LED Ring Light with Tripod',
    price: 699, originalPrice: 999, rating: 4.2, reviews: '850',
    marketplace: 'Flipkart', category: 'Gadgets',
    image: img('photo-1550745165-9bc0b252726f'),
    badge: 'New', isNew: true,
    description: 'A compact lighting setup for reels, video calls and content creation.'
  },
  {
    id: 'hand-fan',
    name: 'Portable Hand Fan',
    price: 199, originalPrice: 499, rating: 4.1, reviews: '642',
    marketplace: 'Meesho', category: 'Lifestyle',
    image: img('photo-1523275335684-37898b6baf30'),
    badge: 'New', isNew: true,
    description: 'A small portable fan for quick cooling at home or outdoors.'
  },
  {
    id: 'sunglasses',
    name: 'Polarized Sunglasses',
    price: 399, originalPrice: 999, rating: 4.3, reviews: '1.1k',
    marketplace: 'Amazon', category: 'Fashion',
    image: img('photo-1511499767150-a48a237f0083'),
    badge: 'New', isNew: true,
    description: 'A clean everyday pair with a versatile frame.'
  },
  {
    id: 'organizer',
    name: 'Wooden Desk Organizer',
    price: 349, originalPrice: 699, rating: 4.5, reviews: '903',
    marketplace: 'Flipkart', category: 'Home',
    image: img('photo-1516321318423-f06f85e504b3'),
    badge: 'New', isNew: true,
    description: 'A tidy desktop organizer for stationery and small essentials.'
  },
  {
    id: 'flash-smartwatch',
    name: 'boAt Flash Smartwatch',
    price: 1799, originalPrice: 3999, rating: 4.3, reviews: '3.5k',
    marketplace: 'Amazon', category: 'Gadgets',
    badge: 'Picksy Pick', picksyPick: true,
    image: img('photo-1523275335684-37898b6baf30'),
    description: 'A value-focused smartwatch selected as a Picksy favorite.'
  },
  {
    id: 'cushion-covers',
    name: 'Decorative Cushion Covers',
    price: 299, originalPrice: 599, rating: 4.2, reviews: '2.4k',
    marketplace: 'Meesho', category: 'Home',
    badge: 'Picksy Pick', picksyPick: true,
    image: img('photo-1618221195710-dd6b41faaea6'),
    description: 'Easy decor refresh for sofas, beds and reading corners.'
  },
  {
    id: 'hair-straightener',
    name: 'Nova Hair Straightener',
    price: 749, originalPrice: 1499, rating: 4.0, reviews: '2.7k',
    marketplace: 'Flipkart', category: 'Beauty',
    badge: 'Picksy Pick', picksyPick: true,
    image: img('photo-1522338242992-e1a54906a8da'),
    description: 'A compact styling tool for everyday hair routines.'
  },
  {
    id: 'remote-car',
    name: 'Remote Control Car',
    price: 999, originalPrice: 2199, rating: 4.1, reviews: '1.8k',
    marketplace: 'Amazon', category: 'Kids',
    badge: 'Picksy Pick', picksyPick: true,
    image: img('photo-1558618666-fcd25c85cd64'),
    description: 'A fun gift option for kids who love remote-control toys.'
  },
  {
    id: 'mixer',
    name: 'Prestige Mixer Grinder',
    price: 2499, originalPrice: 4699, rating: 4.3, reviews: '3.2k',
    marketplace: 'Flipkart', category: 'Kitchen',
    badge: 'Picksy Pick', picksyPick: true,
    image: img('photo-1570222094114-d054a817e56b'),
    description: 'A practical kitchen essential for everyday preparation.'
  }
]