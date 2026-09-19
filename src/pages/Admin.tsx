import AdminLogin from '../components/AdminLogin'
import AdminSettings from '../components/AdminSettings'
import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  MousePointerClick,
  RefreshCw,
  Pencil,
  Plus,
  Search,
  Settings,
  Tags,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Marketplace, Product } from '../types/product'

type Category = {
  id: string
  name: string
  slug: string
}

type AdminSection =
  | 'overview'
  | 'products'
  | 'categories'
  | 'analytics'
  | 'settings'

type DbProduct = {
  id: string
  name: string
  price: number
  original_price: number
  rating: number
  reviews: number
  marketplace: Marketplace
  category: string
  image: string | null
  images: string[] | null
  affiliate_url: string | null
  badge: string | null
  description: string | null
  trending: boolean
  is_new: boolean
  picksy_pick: boolean
  published: boolean
}

type AffiliateClick = {
  id: string
  product_id: string | null
  marketplace: string | null
  affiliate_url: string | null
  clicked_at: string
  referrer: string | null
  user_agent: string | null
  device_type: string | null
}

type AnalyticsView = 'day' | 'week' | 'month'

const emptyProduct: Product = {
  id: '',
  name: '',
  price: 0,
  originalPrice: 0,
  rating: 0,
  reviews: '0',
  marketplace: 'Amazon',
  category: 'Home',
  image: '',
  images: [],
  affiliateUrl: '',
  badge: '',
  description: '',
  trending: false,
  isNew: true,
  picksyPick: false,
  published: true,
}

function dbToProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price ?? 0),
    originalPrice: Number(row.original_price ?? 0),
    rating: Number(row.rating ?? 0),
    reviews: String(row.reviews ?? 0),
    marketplace: row.marketplace,
    category: row.category,
    image: row.image ?? row.images?.[0] ?? '',
    images: row.images ?? (row.image ? [row.image] : []),
    affiliateUrl: row.affiliate_url ?? '',
    badge: row.badge ?? '',
    description: row.description ?? '',
    trending: row.trending ?? false,
    isNew: row.is_new ?? false,
    picksyPick: row.picksy_pick ?? false,
    published: row.published ?? true,
  }
}

function productToDb(product: Product) {
  return {
    name: product.name.trim(),
    price: product.price,
    original_price: product.originalPrice,
    rating: product.rating,
    reviews: Number(product.reviews) || 0,
    marketplace: product.marketplace,
    category: product.category,
    image: product.images?.[0] || product.image || null,
    images: product.images ?? (product.image ? [product.image] : []),
    affiliate_url: product.affiliateUrl?.trim() || null,
    badge: product.badge?.trim() || null,
    description: product.description?.trim() || null,
    trending: product.trending ?? false,
    is_new: product.isNew ?? false,
    picksy_pick: product.picksyPick ?? false,
    published: product.published ?? true,
    updated_at: new Date().toISOString(),
  }
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function Admin() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [activeSection, setActiveSection] =
    useState<AdminSection>('overview')

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [marketplaceFilter, setMarketplaceFilter] =
    useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [quickFilter, setQuickFilter] = useState('All')

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null)

  const [notice, setNotice] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  const [categoryName, setCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] =
    useState<string | null>(null)
  const [categorySaving, setCategorySaving] =
    useState(false)
  const [categoryDeletingId, setCategoryDeletingId] =
    useState<string | null>(null)

  const [showCategoryForm, setShowCategoryForm] =
    useState(false)

  const [affiliateClicks, setAffiliateClicks] =
    useState<AffiliateClick[]>([])
  const [analyticsLoading, setAnalyticsLoading] =
    useState(false)
  const [analyticsView, setAnalyticsView] =
    useState<AnalyticsView>('month')
  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalClicks: 0,
    todayClicks: 0,
    last7DaysClicks: 0,
    last30DaysClicks: 0,
  })

  const PRODUCTS_PER_PAGE = 10

  const [overviewPage, setOverviewPage] = useState(1)
  const [productsPage, setProductsPage] = useState(1)

  function showNotice(
    type: 'success' | 'error',
    message: string,
  ) {
    setNotice({ type, message })

    window.setTimeout(() => {
      setNotice(null)
    }, 3500)
  }

  useEffect(() => {
    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)

        if (currentSession) {
          loadProducts()
          loadCategories()
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  async function checkSession() {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()

    setSession(currentSession)

    if (currentSession) {
      await Promise.all([
        loadProducts(),
        loadCategories(),
      ])
    }

    setLoading(false)
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)

      showNotice(
        'error',
        'Unable to load products. Please try again.',
      )

      return
    }

    setProducts((data ?? []).map(dbToProduct))
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true })

    if (error) {
      console.error(error)

      showNotice(
        'error',
        'Unable to load categories. Please try again.',
      )

      return
    }

    setCategories((data ?? []) as Category[])
  }

  async function loadAffiliateClicks() {
    setAnalyticsLoading(true)

    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const last7 = new Date(today)
    last7.setDate(last7.getDate() - 6)

    const last30 = new Date(today)
    last30.setDate(last30.getDate() - 29)

    const rangeStart =
      analyticsView === 'day'
        ? today
        : analyticsView === 'week'
          ? last7
          : last30

    const [rangeResult, totalResult, todayResult, last7Result, last30Result] =
      await Promise.all([
        supabase
          .from('affiliate_clicks')
          .select(
            'id, product_id, marketplace, affiliate_url, clicked_at, referrer, user_agent, device_type',
          )
          .gte('clicked_at', rangeStart.toISOString())
          .order('clicked_at', { ascending: false }),
        supabase
          .from('affiliate_clicks')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('affiliate_clicks')
          .select('id', { count: 'exact', head: true })
          .gte('clicked_at', today.toISOString()),
        supabase
          .from('affiliate_clicks')
          .select('id', { count: 'exact', head: true })
          .gte('clicked_at', last7.toISOString()),
        supabase
          .from('affiliate_clicks')
          .select('id', { count: 'exact', head: true })
          .gte('clicked_at', last30.toISOString()),
      ])

    const firstError =
      rangeResult.error ||
      totalResult.error ||
      todayResult.error ||
      last7Result.error ||
      last30Result.error

    if (firstError) {
      console.error(firstError)
      showNotice(
        'error',
        `Unable to load analytics: ${firstError.message}`,
      )
      setAnalyticsLoading(false)
      return
    }

    setAffiliateClicks(
      (rangeResult.data ?? []) as AffiliateClick[],
    )

    setAnalyticsSummary({
      totalClicks: totalResult.count ?? 0,
      todayClicks: todayResult.count ?? 0,
      last7DaysClicks: last7Result.count ?? 0,
      last30DaysClicks: last30Result.count ?? 0,
    })

    setAnalyticsLoading(false)
  }

  useEffect(() => {
    if (session && activeSection === 'analytics') {
      loadAffiliateClicks()
    }
  }, [session, activeSection, analyticsView])

  async function handleLogout() {
    await supabase.auth.signOut()

    setProducts([])
    setCategories([])
    setNotice(null)
    setActiveSection('overview')
    setShowForm(false)
    setEditingProduct(null)
    setShowCategoryForm(false)
    setEditingCategoryId(null)
    setCategoryName('')
    setAffiliateClicks([])
    setAnalyticsSummary({
      totalClicks: 0,
      todayClicks: 0,
      last7DaysClicks: 0,
      last30DaysClicks: 0,
    })
  }

  async function handleDelete(id: string) {
    const product = products.find(
      (item) => item.id === id,
    )

    const confirmed = window.confirm(
      `Are you sure you want to delete "${
        product?.name || 'this product'
      }"?`,
    )

    if (!confirmed) return

    setDeletingId(id)

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)

      showNotice(
        'error',
        `Unable to delete product: ${error.message}`,
      )

      setDeletingId(null)
      return
    }

    setProducts((current) =>
      current.filter(
        (product) => product.id !== id,
      ),
    )

    setDeletingId(null)

    showNotice(
      'success',
      'Product deleted successfully.',
    )
  }

  function openAddForm() {
    setEditingProduct(null)
    setShowForm(true)
  }

  function openEditForm(product: Product) {
    setEditingProduct(product)
    setShowForm(true)
  }

  async function handleSave(product: Product) {
    if (!product.name.trim()) {
      showNotice(
        'error',
        'Please enter product name.',
      )

      return
    }

    if (!product.category) {
      showNotice(
        'error',
        'Please select a category.',
      )

      return
    }

    if (product.price < 0) {
      showNotice(
        'error',
        'Price cannot be negative.',
      )

      return
    }

    if (product.originalPrice < 0) {
      showNotice(
        'error',
        'Original price cannot be negative.',
      )

      return
    }

    if (
      product.rating < 0 ||
      product.rating > 5
    ) {
      showNotice(
        'error',
        'Rating must be between 0 and 5.',
      )

      return
    }

    setSaving(true)

    if (product.id) {
      const { data, error } = await supabase
        .from('products')
        .update(productToDb(product))
        .eq('id', product.id)
        .select()
        .single()

      if (error) {
        console.error(error)

        showNotice(
          'error',
          `Unable to update product: ${error.message}`,
        )

        setSaving(false)
        return
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? dbToProduct(data)
            : item,
        ),
      )

      setShowForm(false)
      setEditingProduct(null)
      setSaving(false)

      showNotice(
        'success',
        'Product updated successfully.',
      )

      return
    }

    const { data, error } = await supabase
      .from('products')
      .insert(productToDb(product))
      .select()
      .single()

    if (error) {
      console.error(error)

      showNotice(
        'error',
        `Unable to save product: ${error.message}`,
      )

      setSaving(false)
      return
    }

    setProducts((current) => [
      dbToProduct(data),
      ...current,
    ])

    setShowForm(false)
    setEditingProduct(null)
    setSaving(false)

    showNotice(
      'success',
      'Product added successfully.',
    )
  }

  function startAddCategory() {
    setEditingCategoryId(null)
    setCategoryName('')
    setShowCategoryForm(true)
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id)
    setCategoryName(category.name)
    setShowCategoryForm(true)
  }

  function cancelEditCategory() {
    setEditingCategoryId(null)
    setCategoryName('')
    setShowCategoryForm(false)
  }

  async function handleAddCategory() {
    const trimmedName = categoryName.trim()

    if (!trimmedName) {
      showNotice(
        'error',
        'Please enter category name.',
      )
      return
    }

    const slug = createSlug(trimmedName)

    if (!slug) {
      showNotice(
        'error',
        'Please enter a valid category name.',
      )
      return
    }

    const alreadyExists = categories.some(
      (category) =>
        category.name.toLowerCase() ===
        trimmedName.toLowerCase(),
    )

    if (alreadyExists) {
      showNotice(
        'error',
        'This category already exists.',
      )
      return
    }

    setCategorySaving(true)

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: trimmedName,
        slug,
      })
      .select()
      .single()

    if (error) {
      console.error(error)

      showNotice(
        'error',
        error.code === '23505'
          ? 'This category or slug already exists.'
          : `Unable to add category: ${error.message}`,
      )

      setCategorySaving(false)
      return
    }

    setCategories((current) =>
      [...current, data as Category].sort(
        (a, b) => a.name.localeCompare(b.name),
      ),
    )

    setCategoryName('')
    setCategorySaving(false)

    showNotice(
      'success',
      'Category added successfully.',
    )
  }

  async function handleUpdateCategory() {
    if (!editingCategoryId) return

    const trimmedName = categoryName.trim()

    if (!trimmedName) {
      showNotice(
        'error',
        'Please enter category name.',
      )
      return
    }

    const slug = createSlug(trimmedName)

    if (!slug) {
      showNotice(
        'error',
        'Please enter a valid category name.',
      )
      return
    }

    const oldCategory = categories.find(
      (category) =>
        category.id === editingCategoryId,
    )

    if (!oldCategory) return

    const duplicateCategory = categories.some(
      (category) =>
        category.id !== editingCategoryId &&
        category.name.toLowerCase() ===
          trimmedName.toLowerCase(),
    )

    if (duplicateCategory) {
      showNotice(
        'error',
        'This category already exists.',
      )
      return
    }

    setCategorySaving(true)

    const { data, error } = await supabase
      .from('categories')
      .update({
        name: trimmedName,
        slug,
      })
      .eq('id', editingCategoryId)
      .select()
      .single()

    if (error) {
      console.error(error)

      showNotice(
        'error',
        error.code === '23505'
          ? 'This category or slug already exists.'
          : `Unable to update category: ${error.message}`,
      )

      setCategorySaving(false)
      return
    }

    if (oldCategory.name !== trimmedName) {
      const { error: productUpdateError } =
        await supabase
          .from('products')
          .update({
            category: trimmedName,
            updated_at: new Date().toISOString(),
          })
          .eq('category', oldCategory.name)

      if (productUpdateError) {
        console.error(productUpdateError)

        showNotice(
          'error',
          `Category renamed, but products could not be updated: ${productUpdateError.message}`,
        )

        await loadProducts()
      } else {
        setProducts((current) =>
          current.map((product) =>
            product.category === oldCategory.name
              ? {
                  ...product,
                  category: trimmedName,
                }
              : product,
          ),
        )
      }
    }

    setCategories((current) =>
      current
        .map((category) =>
          category.id === editingCategoryId
            ? (data as Category)
            : category,
        )
        .sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
    )

    if (
      categoryFilter === oldCategory.name
    ) {
      setCategoryFilter(trimmedName)
    }

    cancelEditCategory()
    setCategorySaving(false)

    showNotice(
      'success',
      'Category updated successfully.',
    )
  }

  async function handleDeleteCategory(
    category: Category,
  ) {
    const { count, error: countError } =
      await supabase
        .from('products')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('category', category.name)

    if (countError) {
      console.error(countError)

      showNotice(
        'error',
        `Unable to check category usage: ${countError.message}`,
      )

      return
    }

    if ((count ?? 0) > 0) {
      showNotice(
        'error',
        `Cannot delete "${category.name}" because ${
          count ?? 0
        } product${count === 1 ? '' : 's'} use this category.`,
      )

      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    )

    if (!confirmed) return

    setCategoryDeletingId(category.id)

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      console.error(error)

      showNotice(
        'error',
        `Unable to delete category: ${error.message}`,
      )

      setCategoryDeletingId(null)
      return
    }

    setCategories((current) =>
      current.filter(
        (item) => item.id !== category.id,
      ),
    )

    if (categoryFilter === category.name) {
      setCategoryFilter('All')
    }

    setCategoryDeletingId(null)

    showNotice(
      'success',
      'Category deleted successfully.',
    )
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    return products.filter((product) => {
      const searchMatch =
        !normalizedSearch ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.marketplace
          .toLowerCase()
          .includes(normalizedSearch)

      const categoryMatch =
        categoryFilter === 'All' ||
        product.category === categoryFilter

      const marketplaceMatch =
        marketplaceFilter === 'All' ||
        product.marketplace ===
          marketplaceFilter

      const statusMatch =
        statusFilter === 'All' ||
        (statusFilter === 'Published' &&
          product.published) ||
        (statusFilter === 'Unpublished' &&
          !product.published)

      const quickMatch =
        quickFilter === 'All' ||
        (quickFilter === 'Trending' &&
          product.trending) ||
        (quickFilter === 'New' &&
          product.isNew) ||
        (quickFilter === 'Picksy Pick' &&
          product.picksyPick)

      return (
        searchMatch &&
        categoryMatch &&
        marketplaceMatch &&
        statusMatch &&
        quickMatch
      )
    })
  }, [
    products,
    search,
    categoryFilter,
    marketplaceFilter,
    statusFilter,
    quickFilter,
  ])

  const productsTotalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / PRODUCTS_PER_PAGE,
    ),
  )

  const paginatedProducts = filteredProducts.slice(
    (productsPage - 1) * PRODUCTS_PER_PAGE,
    productsPage * PRODUCTS_PER_PAGE,
  )

  const overviewTotalPages = Math.max(
    1,
    Math.ceil(
      products.length / PRODUCTS_PER_PAGE,
    ),
  )

  const paginatedOverviewProducts = products.slice(
    (overviewPage - 1) * PRODUCTS_PER_PAGE,
    overviewPage * PRODUCTS_PER_PAGE,
  )

  const stats = {
    total: products.length,
    published: products.filter(
      (p) => p.published,
    ).length,
    unpublished: products.filter(
      (p) => !p.published,
    ).length,
    trending: products.filter(
      (p) => p.trending,
    ).length,
    newFinds: products.filter(
      (p) => p.isNew,
    ).length,
    picksyPicks: products.filter(
      (p) => p.picksyPick,
    ).length,
  }

  const analyticsFilteredClicks = useMemo(() => {
    const now = new Date()
    const start = new Date(now)

    if (analyticsView === 'day') {
      start.setHours(0, 0, 0, 0)
    } else if (analyticsView === 'week') {
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - 6)
    } else {
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() - 29)
    }

    return affiliateClicks.filter(
      (click) => new Date(click.clicked_at) >= start,
    )
  }, [affiliateClicks, analyticsView])

  const analyticsStats = useMemo(() => {
    const affiliateLinks = products.filter(
      (product) => Boolean(product.affiliateUrl?.trim()),
    ).length

    return {
      ...analyticsSummary,
      affiliateLinks,
    }
  }, [analyticsSummary, products])

  const analyticsChart = useMemo(() => {
    const points: {
      key: string
      label: string
      clicks: number
    }[] = []

    const now = new Date()

    if (analyticsView === 'day') {
      for (let hour = 0; hour < 24; hour += 1) {
        const date = new Date(now)
        date.setHours(hour, 0, 0, 0)

        const clicks = analyticsFilteredClicks.filter(
          (click) => {
            const clicked = new Date(
              click.clicked_at,
            )

            return (
              clicked.getFullYear() ===
                date.getFullYear() &&
              clicked.getMonth() ===
                date.getMonth() &&
              clicked.getDate() ===
                date.getDate() &&
              clicked.getHours() === hour
            )
          },
        ).length

        points.push({
          key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${hour}`,
          label: date.toLocaleTimeString(
            'en-IN',
            { hour: 'numeric' },
          ),
          clicks,
        })
      }
    } else {
      const days =
        analyticsView === 'week' ? 7 : 30

      for (
        let offset = days - 1;
        offset >= 0;
        offset -= 1
      ) {
        const date = new Date(now)
        date.setHours(0, 0, 0, 0)
        date.setDate(
          date.getDate() - offset,
        )

        const clicks =
          analyticsFilteredClicks.filter(
            (click) => {
              const clicked = new Date(
                click.clicked_at,
              )

              return (
                clicked.getFullYear() ===
                  date.getFullYear() &&
                clicked.getMonth() ===
                  date.getMonth() &&
                clicked.getDate() ===
                  date.getDate()
              )
            },
          ).length

        points.push({
          key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
          label: date.toLocaleDateString(
            'en-IN',
            {
              day: 'numeric',
              month: 'short',
            },
          ),
          clicks,
        })
      }
    }

    return points
  }, [analyticsFilteredClicks, analyticsView])

  const analyticsMaxClicks = Math.max(
    1,
    ...analyticsChart.map(
      (point) => point.clicks,
    ),
  )

  const marketplaceBreakdown = useMemo(() => {
    const counts = new Map<string, number>()

    analyticsFilteredClicks.forEach(
      (click) => {
        const marketplace =
          click.marketplace || 'Unknown'

        counts.set(
          marketplace,
          (counts.get(marketplace) || 0) + 1,
        )
      },
    )

    return Array.from(
      counts.entries(),
    ).sort((a, b) => b[1] - a[1])
  }, [analyticsFilteredClicks])

  const deviceBreakdown = useMemo(() => {
    const counts = new Map<string, number>()

    analyticsFilteredClicks.forEach(
      (click) => {
        const device =
          click.device_type || 'Unknown'

        counts.set(
          device,
          (counts.get(device) || 0) + 1,
        )
      },
    )

    return Array.from(
      counts.entries(),
    ).sort((a, b) => b[1] - a[1])
  }, [analyticsFilteredClicks])

  const topClickedProducts = useMemo(() => {
    const counts = new Map<string, number>()

    analyticsFilteredClicks.forEach(
      (click) => {
        if (!click.product_id) return

        counts.set(
          click.product_id,
          (counts.get(click.product_id) || 0) + 1,
        )
      },
    )

    return Array.from(
      counts.entries(),
    )
      .map(([productId, clicks]) => ({
        productId,
        clicks,
        product: products.find(
          (item) => item.id === productId,
        ),
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
  }, [analyticsFilteredClicks, products])

  const analyticsRangeLabel =
    analyticsView === 'day'
      ? 'Today'
      : analyticsView === 'week'
        ? 'Last 7 days'
        : 'Last 30 days'

  function clearFilters() {
    setSearch('')
    setCategoryFilter('All')
    setMarketplaceFilter('All')
    setStatusFilter('All')
    setQuickFilter('All')
  }

  const hasFilters =
    Boolean(search) ||
    categoryFilter !== 'All' ||
    marketplaceFilter !== 'All' ||
    statusFilter !== 'All' ||
    quickFilter !== 'All'

  useEffect(() => {
    setProductsPage(1)
  }, [
    search,
    categoryFilter,
    marketplaceFilter,
    statusFilter,
    quickFilter,
  ])

  useEffect(() => {
    if (productsPage > productsTotalPages) {
      setProductsPage(productsTotalPages)
    }
  }, [productsPage, productsTotalPages])

  useEffect(() => {
    if (overviewPage > overviewTotalPages) {
      setOverviewPage(overviewTotalPages)
    }
  }, [overviewPage, overviewTotalPages])

  function handleSectionChange(
    section: AdminSection,
  ) {
    setActiveSection(section)

    if (section !== 'categories') {
      setShowCategoryForm(false)
      setEditingCategoryId(null)
      setCategoryName('')
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <Package size={28} />
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  if (!session) {
    return <AdminLogin />
  }

  return (
    <div className="admin-page">
      {notice && (
        <div
          className={`admin-notice ${
            notice.type === 'success'
              ? 'admin-notice-success'
              : 'admin-notice-error'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <X size={18} />
          )}

          <span>{notice.message}</span>

          <button
            type="button"
            onClick={() => setNotice(null)}
            title="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img
            className="admin-brand-logo"
            src={import.meta.env.BASE_URL + 'picksy-logo.svg'}
            alt="Picksy Store"
          />

          <span>Admin</span>
        </div>

        <nav className="admin-nav">
          <button
            className={
              activeSection === 'overview'
                ? 'active'
                : ''
            }
            onClick={() =>
              handleSectionChange('overview')
            }
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button
            className={
              activeSection === 'products'
                ? 'active'
                : ''
            }
            onClick={() =>
              handleSectionChange('products')
            }
          >
            <Package size={18} />
            Products
          </button>

          <button
            className={
              activeSection === 'categories'
                ? 'active'
                : ''
            }
            onClick={() =>
              handleSectionChange('categories')
            }
          >
            <Tags size={18} />
            Categories
          </button>

          <button
            className={
              activeSection === 'analytics'
                ? 'active'
                : ''
            }
            onClick={() =>
              handleSectionChange('analytics')
            }
          >
            <BarChart3 size={18} />
            Analytics
          </button>

          <button
            className={
              activeSection === 'settings'
                ? 'active'
                : ''
            }
            onClick={() =>
              handleSectionChange('settings')
            }
          >
            <Settings size={18} />
            Settings
          </button>
        </nav>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="admin-main">
        {activeSection === 'overview' && (
          <>
            <header className="admin-topbar">
              <div>
                <h1>Dashboard</h1>
                <p>
                  Manage your Picksy products
                </p>
              </div>

              <button
                className="admin-add-btn"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add Product
              </button>
            </header>

            <section className="admin-stats">
              <div className="admin-stat-card">
                <span>Total Products</span>
                <strong>{stats.total}</strong>
              </div>

              <div className="admin-stat-card">
                <span>Published</span>
                <strong>{stats.published}</strong>
              </div>

              <div className="admin-stat-card">
                <span>Unpublished</span>
                <strong>
                  {stats.unpublished}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>Trending</span>
                <strong>{stats.trending}</strong>
              </div>

              <div className="admin-stat-card">
                <span>New Finds</span>
                <strong>{stats.newFinds}</strong>
              </div>

              <div className="admin-stat-card">
                <span>Picksy Picks</span>
                <strong>
                  {stats.picksyPicks}
                </strong>
              </div>
            </section>

            <section className="admin-products-section">
              <div className="admin-section-header">
                <div>
                  <h2>Recent Products</h2>
                  <p>
                    Your latest products added to
                    Picksy
                  </p>
                </div>

                <button
                  className="admin-secondary-btn"
                  onClick={() =>
                    handleSectionChange(
                      'products',
                    )
                  }
                >
                  View All Products
                </button>
              </div>

              <div className="admin-table-wrapper">
                {products.length === 0 ? (
                  <div className="admin-empty">
                    <Package size={38} />

                    <h3>No products yet</h3>

                    <p>
                      Add your first product to
                      start building Picksy.
                    </p>

                    <button onClick={openAddForm}>
                      <Plus size={16} />
                      Add Product
                    </button>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Marketplace</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Tags</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedOverviewProducts.map(
                        (product) => (
                          <ProductTableRow
                            key={product.id}
                            product={product}
                            onEdit={
                              openEditForm
                            }
                            onDelete={
                              handleDelete
                            }
                            deletingId={
                              deletingId
                            }
                          />
                        ),
                      )}
                    </tbody>
                  </table>
                )}

                {products.length > PRODUCTS_PER_PAGE && (
                  <Pagination
                    currentPage={overviewPage}
                    totalPages={overviewTotalPages}
                    onPageChange={setOverviewPage}
                  />
                )}
              </div>
            </section>
          </>
        )}

        {activeSection === 'products' && (
          <>
            <header className="admin-topbar">
              <div>
                <h1>Products</h1>
                <p>
                  Manage your Picksy product
                  catalog
                </p>
              </div>

              <button
                className="admin-add-btn"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add Product
              </button>
            </header>

            <section className="admin-stats">
              <div className="admin-stat-card">
                <span>Total Products</span>
                <strong>{stats.total}</strong>
              </div>

              <div className="admin-stat-card">
                <span>Published</span>
                <strong>{stats.published}</strong>
              </div>

              <div className="admin-stat-card">
                <span>Unpublished</span>
                <strong>
                  {stats.unpublished}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>Trending</span>
                <strong>{stats.trending}</strong>
              </div>

              <div className="admin-stat-card">
                <span>New Finds</span>
                <strong>{stats.newFinds}</strong>
              </div>

              <div className="admin-stat-card">
                <span>Picksy Picks</span>
                <strong>
                  {stats.picksyPicks}
                </strong>
              </div>
            </section>

            <section className="admin-products-section">
              <div className="admin-section-header">
                <div>
                  <h2>All Products</h2>

                  <p>
                    Showing{' '}
                    {filteredProducts.length}{' '}
                    of {products.length}{' '}
                    products
                  </p>
                </div>
              </div>

              <div className="admin-search-row">
                <div className="admin-search-box">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value,
                      )
                    }
                  />

                  {search && (
                    <button
                      onClick={() =>
                        setSearch('')
                      }
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="admin-filter-row">
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target.value,
                    )
                  }
                >
                  <option value="All">
                    All Categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ),
                  )}
                </select>

                <select
                  value={marketplaceFilter}
                  onChange={(e) =>
                    setMarketplaceFilter(
                      e.target.value,
                    )
                  }
                >
                  <option value="All">
                    All Marketplaces
                  </option>

                  <option value="Amazon">
                    Amazon
                  </option>

                  <option value="Flipkart">
                    Flipkart
                  </option>

                  <option value="Meesho">
                    Meesho
                  </option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value,
                    )
                  }
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Published">
                    Published
                  </option>

                  <option value="Unpublished">
                    Unpublished
                  </option>
                </select>

                <select
                  value={quickFilter}
                  onChange={(e) =>
                    setQuickFilter(
                      e.target.value,
                    )
                  }
                >
                  <option value="All">
                    All Products
                  </option>

                  <option value="Trending">
                    🔥 Trending
                  </option>

                  <option value="New">
                    🆕 New Finds
                  </option>

                  <option value="Picksy Pick">
                    ⭐ Picksy Pick
                  </option>
                </select>

                {hasFilters && (
                  <button
                    className="clear-filter-btn"
                    onClick={clearFilters}
                  >
                    <X size={16} />
                    Clear
                  </button>
                )}
              </div>

              <div className="admin-table-wrapper">
                {filteredProducts.length ===
                0 ? (
                  <div className="admin-empty">
                    <Package size={38} />

                    <h3>
                      No products found
                    </h3>

                    <p>
                      Try changing your
                      filters or add a new
                      product.
                    </p>

                    {hasFilters && (
                      <button
                        onClick={
                          clearFilters
                        }
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Marketplace</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Tags</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedProducts.map(
                        (product) => (
                          <ProductTableRow
                            key={product.id}
                            product={product}
                            onEdit={
                              openEditForm
                            }
                            onDelete={
                              handleDelete
                            }
                            deletingId={
                              deletingId
                            }
                          />
                        ),
                      )}
                    </tbody>
                  </table>
                )}

                {filteredProducts.length > PRODUCTS_PER_PAGE && (
                  <Pagination
                    currentPage={productsPage}
                    totalPages={productsTotalPages}
                    onPageChange={setProductsPage}
                  />
                )}
              </div>
            </section>
          </>
        )}

        {activeSection === 'categories' && (
          <section className="admin-products-section">
            <header className="admin-topbar">
              <div>
                <h1>Categories</h1>
                <p>
                  Manage product categories
                </p>
              </div>

              <button
                className="admin-add-btn"
                onClick={startAddCategory}
                disabled={categorySaving}
              >
                <Plus size={18} />
                Add Category
              </button>
            </header>

            <div className="admin-category-manager">
              {showCategoryForm && (
                <div className="admin-category-form">
                  <div>
                    <h2>
                      {editingCategoryId
                        ? 'Edit Category'
                        : 'Add Category'}
                    </h2>

                    <p>
                      {editingCategoryId
                        ? 'Update the category name.'
                        : 'Create a new product category.'}
                    </p>
                  </div>

                  <div className="admin-category-input-row">
                    <input
                      type="text"
                      value={categoryName}
                      onChange={(e) =>
                        setCategoryName(
                          e.target.value,
                        )
                      }
                      placeholder="e.g. Home Decor"
                      disabled={categorySaving}
                      autoFocus
                      onKeyDown={(e) => {
                        if (
                          e.key === 'Enter'
                        ) {
                          e.preventDefault()

                          if (
                            editingCategoryId
                          ) {
                            handleUpdateCategory()
                          } else {
                            handleAddCategory()
                          }
                        }

                        if (
                          e.key === 'Escape'
                        ) {
                          cancelEditCategory()
                        }
                      }}
                    />

                    {editingCategoryId ? (
                      <>
                        <button
                          className="admin-primary-btn"
                          onClick={
                            handleUpdateCategory
                          }
                          disabled={
                            categorySaving
                          }
                        >
                          <CheckCircle2
                            size={17}
                          />

                          {categorySaving
                            ? 'Updating...'
                            : 'Save Changes'}
                        </button>

                        <button
                          className="admin-secondary-btn"
                          onClick={
                            cancelEditCategory
                          }
                          disabled={
                            categorySaving
                          }
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="admin-primary-btn"
                        onClick={
                          handleAddCategory
                        }
                        disabled={
                          categorySaving
                        }
                      >
                        <Plus size={17} />

                        {categorySaving
                          ? 'Adding...'
                          : 'Add Category'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="admin-category-list">
                <div className="admin-category-list-header">
                  <div>
                    <h2>
                      All Categories
                    </h2>

                    <p>
                      {categories.length}{' '}
                      {categories.length === 1
                        ? 'category'
                        : 'categories'}
                    </p>
                  </div>
                </div>

                {categories.length ===
                0 ? (
                  <div className="admin-empty">
                    <Tags size={42} />

                    <h3>
                      No categories yet
                    </h3>

                    <p>
                      Add your first category
                      above.
                    </p>
                  </div>
                ) : (
                  <div className="admin-category-grid">
                    {categories.map(
                      (category) => {
                        const count =
                          products.filter(
                            (product) =>
                              product.category ===
                              category.name,
                          ).length

                        const isDeleting =
                          categoryDeletingId ===
                          category.id

                        return (
                          <div
                            className="admin-category-card"
                            key={
                              category.id
                            }
                          >
                            <div className="admin-category-icon">
                              <Tags
                                size={20}
                              />
                            </div>

                            <div className="admin-category-info">
                              <strong>
                                {
                                  category.name
                                }
                              </strong>

                              <span>
                                {count}{' '}
                                {count === 1
                                  ? 'product'
                                  : 'products'}
                              </span>
                            </div>

                            <div className="admin-category-actions">
                              <button
                                className="edit-btn"
                                onClick={() =>
                                  startEditCategory(
                                    category,
                                  )
                                }
                                disabled={
                                  isDeleting ||
                                  categorySaving
                                }
                                title="Edit category"
                              >
                                <Pencil
                                  size={16}
                                />
                              </button>

                              <button
                                className="delete-btn"
                                onClick={() =>
                                  handleDeleteCategory(
                                    category,
                                  )
                                }
                                disabled={
                                  isDeleting ||
                                  categorySaving
                                }
                                title="Delete category"
                              >
                                {isDeleting ? (
                                  <span className="admin-action-loading">
                                    ...
                                  </span>
                                ) : (
                                  <Trash2
                                    size={16}
                                  />
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      },
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'analytics' && (
          <section className="admin-products-section">
            <header className="admin-topbar">
              <div>
                <h1>Analytics</h1>
                <p>
                  Track your Picksy affiliate
                  performance
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <button
                  className="admin-secondary-btn"
                  onClick={loadAffiliateClicks}
                  disabled={analyticsLoading}
                  title="Refresh analytics"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  <RefreshCw
                    size={15}
                    style={{
                      animation:
                        analyticsLoading
                          ? 'admin-spin 1s linear infinite'
                          : undefined,
                    }}
                  />
                  Refresh
                </button>
              </div>
            </header>

            <section className="admin-stats">
              <div className="admin-stat-card">
                <span>Affiliate Clicks</span>
                <strong>
                  {analyticsStats.totalClicks}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>Today</span>
                <strong>
                  {analyticsStats.todayClicks}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>Last 7 Days</span>
                <strong>
                  {analyticsStats.last7DaysClicks}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>Last 30 Days</span>
                <strong>
                  {analyticsStats.last30DaysClicks}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>Products</span>
                <strong>
                  {products.length}
                </strong>
              </div>

              <div className="admin-stat-card">
                <span>Affiliate Links</span>
                <strong>
                  {analyticsStats.affiliateLinks}
                </strong>
              </div>
            </section>

            <section className="admin-products-section">
              <div
                className="admin-section-header"
                style={{
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h2>Click Activity</h2>

                  <p>
                    Affiliate clicks by{' '}
                    {analyticsView === 'day'
                      ? 'hour'
                      : 'day'}
                  </p>
                </div>

                <AnalyticsPeriodTabs
                  value={analyticsView}
                  onChange={setAnalyticsView}
                />
              </div>

              <div
                style={{
                  padding:
                    '28px 18px 18px',
                  overflowX: 'auto',
                }}
              >
                {analyticsLoading ? (
                  <div
                    className="admin-empty"
                    style={{ minHeight: 220 }}
                  >
                    <BarChart3 size={34} />

                    <p>
                      Loading click activity...
                    </p>
                  </div>
                ) : analyticsFilteredClicks.length ===
                  0 ? (
                  <div
                    className="admin-empty"
                    style={{ minHeight: 220 }}
                  >
                    <MousePointerClick
                      size={36}
                    />

                    <h3>
                      No clicks in{' '}
                      {analyticsRangeLabel.toLowerCase()}
                    </h3>

                    <p>
                      Affiliate clicks will
                      appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      minWidth:
                        analyticsView ===
                        'day'
                          ? 760
                          : analyticsView ===
                              'month'
                            ? 900
                            : 620,
                    }}
                  >
                    <div
                      style={{
                        height: 260,
                        display: 'flex',
                        alignItems:
                          'flex-end',
                        gap:
                          analyticsView ===
                          'month'
                            ? 5
                            : 8,
                        padding: '0 6px',
                        borderBottom:
                          '1px solid #e5e7eb',
                      }}
                    >
                      {analyticsChart.map(
                        (point) => {
                          const height =
                            point.clicks ===
                            0
                              ? 4
                              : Math.max(
                                  10,
                                  (point.clicks /
                                    analyticsMaxClicks) *
                                    220,
                                )

                          return (
                            <div
                              key={
                                point.key
                              }
                              style={{
                                flex: 1,
                                minWidth:
                                  analyticsView ===
                                  'month'
                                    ? 12
                                    : 22,
                                height: '100%',
                                display:
                                  'flex',
                                flexDirection:
                                  'column',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'flex-end',
                                gap: 7,
                              }}
                            >
                              {point.clicks >
                                0 && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color:
                                      '#111827',
                                  }}
                                >
                                  {
                                    point.clicks
                                  }
                                </span>
                              )}

                              <div
                                title={`${point.label}: ${point.clicks} click${point.clicks === 1 ? '' : 's'}`}
                                style={{
                                  width:
                                    '100%',
                                  maxWidth:
                                    analyticsView ===
                                    'month'
                                      ? 20
                                      : 34,
                                  height,
                                  minHeight: 4,
                                  borderRadius:
                                    '6px 6px 2px 2px',
                                  background:
                                    point.clicks >
                                    0
                                      ? 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)'
                                      : '#e5e7eb',
                                }}
                              />

                              <span
                                style={{
                                  fontSize: 10,
                                  color:
                                    '#6b7280',
                                  whiteSpace:
                                    'nowrap',
                                  transform:
                                    analyticsView ===
                                    'month'
                                      ? 'rotate(-45deg) translate(-4px, 7px)'
                                      : undefined,
                                  transformOrigin:
                                    'center',
                                }}
                              >
                                {
                                  point.label
                                }
                              </span>
                            </div>
                          )
                        },
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: 16,
                marginTop: 16,
              }}
            >
              <section
                className="admin-products-section"
                style={{ margin: 0 }}
              >
                <div className="admin-section-header">
                  <div>
                    <h2>Marketplace</h2>
                    <p>
                      Clicks by marketplace
                    </p>
                  </div>
                </div>

                {marketplaceBreakdown.length ===
                0 ? (
                  <div
                    className="admin-empty"
                    style={{ minHeight: 120 }}
                  >
                    <p>
                      No marketplace data yet.
                    </p>
                  </div>
                ) : (
                  <div>
                    {marketplaceBreakdown.map(
                      ([name, count]) => (
                        <div
                          key={name}
                          style={{
                            display: 'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'space-between',
                            padding:
                              '14px 16px',
                            borderTop:
                              '1px solid #eef0f4',
                          }}
                        >
                          <strong>
                            {name}
                          </strong>

                          <strong>
                            {count}{' '}
                            {count === 1
                              ? 'click'
                              : 'clicks'}
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </section>

              <section
                className="admin-products-section"
                style={{ margin: 0 }}
              >
                <div className="admin-section-header">
                  <div>
                    <h2>Devices</h2>
                    <p>
                      Visitor device breakdown
                    </p>
                  </div>
                </div>

                {deviceBreakdown.length ===
                0 ? (
                  <div
                    className="admin-empty"
                    style={{ minHeight: 120 }}
                  >
                    <p>
                      No device data yet.
                    </p>
                  </div>
                ) : (
                  <div>
                    {deviceBreakdown.map(
                      ([name, count]) => (
                        <div
                          key={name}
                          style={{
                            display: 'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'space-between',
                            padding:
                              '14px 16px',
                            borderTop:
                              '1px solid #eef0f4',
                          }}
                        >
                          <strong
                            style={{
                              textTransform:
                                'capitalize',
                            }}
                          >
                            {name}
                          </strong>

                          <strong>
                            {count}{' '}
                            {count === 1
                              ? 'click'
                              : 'clicks'}
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </section>
            </div>

            <section
              className="admin-products-section"
              style={{ marginTop: 16 }}
            >
              <div className="admin-section-header">
                <div>
                  <h2>
                    Top Clicked Products
                  </h2>

                  <p>
                    Products receiving the
                    most affiliate clicks in{' '}
                    {analyticsRangeLabel.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="admin-table-wrapper">
                {topClickedProducts.length ===
                0 ? (
                  <div className="admin-empty">
                    <Package size={36} />

                    <h3>
                      No product clicks yet
                    </h3>

                    <p>
                      Once visitors click an
                      affiliate link, products
                      will appear here.
                    </p>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Marketplace</th>
                        <th>Clicks</th>
                      </tr>
                    </thead>

                    <tbody>
                      {topClickedProducts.map(
                        (item, index) => (
                          <tr
                            key={
                              item.productId
                            }
                          >
                            <td>
                              {index + 1}
                            </td>

                            <td>
                              <div className="admin-product-cell">
                                <div className="admin-product-image">
                                  {item.product
                                    ?.image ? (
                                    <img
                                      src={
                                        item
                                          .product
                                          .image
                                      }
                                      alt={
                                        item
                                          .product
                                          .name
                                      }
                                    />
                                  ) : (
                                    <ImagePlus
                                      size={20}
                                    />
                                  )}
                                </div>

                                <strong>
                                  {item.product
                                    ?.name ||
                                    'Deleted product'}
                                </strong>
                              </div>
                            </td>

                            <td>
                              <span className="marketplace-badge">
                                {item.product
                                  ?.marketplace ||
                                  analyticsFilteredClicks.find(
                                    (click) =>
                                      click.product_id ===
                                      item.productId,
                                  )
                                    ?.marketplace ||
                                  'Unknown'}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {item.clicks}
                              </strong>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section
              className="admin-products-section"
              style={{ marginTop: 16 }}
            >
              <div
                className="admin-section-header"
                style={{
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h2>
                    Earnings Tracking
                  </h2>

                  <p>
                    Same{' '}
                    {analyticsRangeLabel.toLowerCase()}{' '}
                    view for your affiliate
                    performance.
                  </p>
                </div>

                <AnalyticsPeriodTabs
                  value={analyticsView}
                  onChange={setAnalyticsView}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap: 16,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    border:
                      '1px solid #e8eaf0',
                    borderRadius: 14,
                    padding: 18,
                    background: '#fafafa',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: 12,
                      color: '#6b7280',
                      marginBottom: 8,
                    }}
                  >
                    Clicks in selected
                    period
                  </span>

                  <strong
                    style={{
                      fontSize: 28,
                      color: '#111827',
                    }}
                  >
                    {
                      analyticsFilteredClicks.length
                    }
                  </strong>

                  <p
                    style={{
                      margin: '8px 0 0',
                      fontSize: 13,
                      color: '#6b7280',
                    }}
                  >
                    {analyticsRangeLabel}
                  </p>
                </div>

                <div
                  style={{
                    border:
                      '1px solid #e8eaf0',
                    borderRadius: 14,
                    padding: 18,
                    background: '#fafafa',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: 12,
                      color: '#6b7280',
                      marginBottom: 8,
                    }}
                  >
                    Actual earnings
                  </span>

                  <strong
                    style={{
                      fontSize: 24,
                      color: '#111827',
                    }}
                  >
                    Not connected
                  </strong>

                  <p
                    style={{
                      margin: '8px 0 0',
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: '#6b7280',
                    }}
                  >
                    Actual commission data will
                    come from marketplace affiliate
                    reports or API data. Click
                    counts are tracked by Picksy
                    and are not treated as earnings.
                  </p>
                </div>
              </div>
            </section>
          </section>
        )}

        {activeSection === 'settings' && (
          <AdminSettings
            session={session}
            onLogout={handleLogout}
          />
        )}
      </main>

      {showForm && (
        <ProductForm
          product={
            editingProduct ?? {
              ...emptyProduct,
              category:
                categories[0]?.name ||
                emptyProduct.category,
            }
          }
          categories={categories}
          onClose={() => {
            if (saving) return

            setShowForm(false)
            setEditingProduct(null)
          }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  )
}

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: number[] = []

  if (totalPages <= 7) {
    for (
      let page = 1;
      page <= totalPages;
      page += 1
    ) {
      pages.push(page)
    }
  } else {
    pages.push(1)

    if (currentPage > 4) {
      pages.push(-1)
    }

    const start = Math.max(
      2,
      currentPage - 1,
    )

    const end = Math.min(
      totalPages - 1,
      currentPage + 1,
    )

    for (
      let page = start;
      page <= end;
      page += 1
    ) {
      pages.push(page)
    }

    if (
      currentPage <
      totalPages - 3
    ) {
      pages.push(-2)
    }

    pages.push(totalPages)
  }

  return (
    <div className="admin-pagination">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          padding: '20px 0 4px',
        }}
      >
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() =>
            onPageChange(currentPage - 1)
          }
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {pages.map((page, index) =>
            page < 0 ? (
              <span
                key={`ellipsis-${index}`}
                style={{
                  padding: '0 4px',
                  color:
                    'var(--text-muted, #777)',
                }}
              >
                ...
              </span>
            ) : (
              <button
                type="button"
                key={page}
                onClick={() =>
                  onPageChange(page)
                }
                aria-current={
                  currentPage === page
                    ? 'page'
                    : undefined
                }
                style={{
                  minWidth: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  border:
                    currentPage === page
                      ? '1px solid #222'
                      : '1px solid #e5e5e5',
                  background:
                    currentPage === page
                      ? '#222'
                      : '#fff',
                  color:
                    currentPage === page
                      ? '#fff'
                      : '#333',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() =>
            onPageChange(currentPage + 1)
          }
          disabled={
            currentPage === totalPages
          }
        >
          Next
        </button>
      </div>
    </div>
  )
}

type AnalyticsPeriodTabsProps = {
  value: AnalyticsView
  onChange: (value: AnalyticsView) => void
}

function AnalyticsPeriodTabs({
  value,
  onChange,
}: AnalyticsPeriodTabsProps) {
  const options: {
    value: AnalyticsView
    label: string
  }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        background: '#f8f9fb',
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() =>
            onChange(option.value)
          }
          style={{
            border: 'none',
            borderRadius: 7,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            background:
              value === option.value
                ? '#111827'
                : 'transparent',
            color:
              value === option.value
                ? '#ffffff'
                : '#6b7280',
            transition:
              'all 0.2s ease',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

type ProductTableRowProps = {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  deletingId: string | null
}

function ProductTableRow({
  product,
  onEdit,
  onDelete,
  deletingId,
}: ProductTableRowProps) {
  const isDeleting =
    deletingId === product.id

  return (
    <tr>
      <td>
        <div className="admin-product-cell">
          <div className="admin-product-image">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
              />
            ) : (
              <ImagePlus size={20} />
            )}
          </div>

          <div>
            <strong>{product.name}</strong>

            <div className="admin-product-rating">
              ⭐ {product.rating || 0} ·{' '}
              {product.reviews || 0} reviews
            </div>
          </div>
        </div>
      </td>

      <td>
        <span className="marketplace-badge">
          {product.marketplace}
        </span>
      </td>

      <td>{product.category}</td>

      <td>
        <strong>₹{product.price}</strong>
      </td>

      <td>
        {product.published ? (
          <span className="status-badge published">
            <CheckCircle2 size={14} />
            Published
          </span>
        ) : (
          <span className="status-badge unpublished">
            Unpublished
          </span>
        )}
      </td>

      <td>
        <div className="admin-tags">
          {product.trending && (
            <span>🔥 Trending</span>
          )}

          {product.isNew && (
            <span>🆕 New</span>
          )}

          {product.picksyPick && (
            <span>⭐ Picksy</span>
          )}
        </div>
      </td>

      <td>
        <div className="admin-actions">
          <button
            className="edit-btn"
            onClick={() =>
              onEdit(product)
            }
            title="Edit product"
            disabled={isDeleting}
          >
            <Pencil size={16} />
          </button>

          <button
            className="delete-btn"
            onClick={() =>
              onDelete(product.id)
            }
            title="Delete product"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="admin-action-loading">
                ...
              </span>
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </td>
    </tr>
  )
}

type ProductFormProps = {
  product: Product
  categories: Category[]
  onClose: () => void
  onSave: (
    product: Product,
  ) => Promise<void>
  saving: boolean
}

function ProductForm({
  product,
  categories,
  onClose,
  onSave,
  saving,
}: ProductFormProps) {
  const [form, setForm] =
    useState<Product>({
      ...product,
      published:
        product.published ?? true,
    })

  const [uploading, setUploading] =
    useState(false)

  function updateField<
    K extends keyof Product,
  >(
    key: K,
    value: Product[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function uploadImage(
    file: File,
  ) {
    if (!file.type.startsWith('image/')) {
      alert(
        'Please select an image file.',
      )
      return
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        'Image size should be less than 5 MB.',
      )
      return
    }

    setUploading(true)

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase() ||
      'jpg'

    const fileName = `products/${crypto.randomUUID()}.${extension}`

    const { error } =
      await supabase.storage
        .from('product-images')
        .upload(
          fileName,
          file,
          {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          },
        )

    if (error) {
      console.error(error)

      setUploading(false)

      alert(
        `Unable to upload image: ${error.message}`,
      )

      return
    }

    const { data } =
      supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

    setForm((current) => {
      const nextImages = [...(current.images ?? [])]
      nextImages.push(data.publicUrl)
      return {
        ...current,
        image: nextImages[0] ?? '',
        images: nextImages,
      }
    })

    setUploading(false)
  }

  const discount =
    form.originalPrice > form.price &&
    form.originalPrice > 0
      ? Math.round(
          ((form.originalPrice -
            form.price) /
            form.originalPrice) *
            100,
        )
      : 0

  const isBusy =
    uploading || saving

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <div>
            <h2>
              {form.id
                ? 'Edit Product'
                : 'Add Product'}
            </h2>

            <p>
              Enter product information below.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isBusy}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-field full">
              <label>
                Product Name
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  updateField(
                    'name',
                    e.target.value,
                  )
                }
                placeholder="Enter product name"
                disabled={isBusy}
              />
            </div>

            <div className="admin-field">
              <label>
                Marketplace
              </label>

              <select
                value={form.marketplace}
                onChange={(e) =>
                  updateField(
                    'marketplace',
                    e.target
                      .value as Marketplace,
                  )
                }
                disabled={isBusy}
              >
                <option value="Amazon">
                  Amazon
                </option>

                <option value="Flipkart">
                  Flipkart
                </option>

                <option value="Meesho">
                  Meesho
                </option>
              </select>
            </div>

            <div className="admin-field">
              <label>Category</label>

              <select
                value={form.category}
                onChange={(e) =>
                  updateField(
                    'category',
                    e.target.value,
                  )
                }
                disabled={
                  isBusy ||
                  categories.length === 0
                }
              >
                {categories.length === 0 ? (
                  <option value="">
                    No categories available
                  </option>
                ) : (
                  categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={
                          category.name
                        }
                      >
                        {category.name}
                      </option>
                    ),
                  )
                )}
              </select>
            </div>

            <div className="admin-field">
              <label>Price</label>

              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) =>
                  updateField(
                    'price',
                    Number(
                      e.target.value,
                    ),
                  )
                }
                disabled={isBusy}
              />
            </div>

            <div className="admin-field">
              <label>
                Original Price
              </label>

              <input
                type="number"
                min="0"
                value={
                  form.originalPrice
                }
                onChange={(e) =>
                  updateField(
                    'originalPrice',
                    Number(
                      e.target.value,
                    ),
                  )
                }
                disabled={isBusy}
              />
            </div>

            <div className="admin-field">
              <label>Rating</label>

              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) =>
                  updateField(
                    'rating',
                    Number(
                      e.target.value,
                    ),
                  )
                }
                disabled={isBusy}
              />
            </div>

            <div className="admin-field">
              <label>Reviews</label>

              <input
                type="number"
                min="0"
                value={form.reviews}
                onChange={(e) =>
                  updateField(
                    'reviews',
                    e.target.value,
                  )
                }
                disabled={isBusy}
              />
            </div>

            <div className="admin-field">
              <label>Badge</label>

              <input
                value={form.badge ?? ''}
                onChange={(e) =>
                  updateField(
                    'badge',
                    e.target.value,
                  )
                }
                placeholder="Best Seller / Hot Deal"
                disabled={isBusy}
              />
            </div>

            <div className="admin-field full">
              <label>
                Affiliate URL
              </label>

              <input
                type="url"
                value={
                  form.affiliateUrl ?? ''
                }
                onChange={(e) =>
                  updateField(
                    'affiliateUrl',
                    e.target.value,
                  )
                }
                placeholder="https://www.amazon.in/..."
                disabled={isBusy}
              />
            </div>

            <div className="admin-field full">
              <label>Description</label>

              <textarea
                rows={5}
                value={
                  form.description
                }
                onChange={(e) =>
                  updateField(
                    'description',
                    e.target.value,
                  )
                }
                placeholder="Write product description..."
                disabled={isBusy}
              />
            </div>

            <div className="admin-field full">
              <label>
                Product Image
              </label>

              <div className="admin-image-upload">
                {(form.images ?? []).length > 0 ? (
                  <div className="admin-image-gallery">
                    {(form.images ?? []).map((src, index) => (
                      <div className="admin-image-thumb" key={src}>
                        <img src={src} alt={`${form.name || 'Product'} image ${index + 1}`} />
                        <div className="admin-image-thumb-actions">
                          <button
                            type="button"
                            onClick={() => {
                              setForm((current) => {
                                const images = (current.images ?? []).filter((_, i) => i !== index)
                                return {
                                  ...current,
                                  images,
                                  image: images[0] ?? '',
                                }
                              })
                            }}
                            disabled={isBusy}
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {index === 0 && (
                          <span className="admin-image-main-label">Main</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-image-placeholder">
                    <ImagePlus size={30} />
                    <div>
                      <strong>No images selected</strong>
                      <small>Add one or more product images</small>
                    </div>
                  </div>
                )}

                <label className={`upload-button ${
                  isBusy ? 'is-disabled' : ''
                }`}>
                  <Upload size={17} />
                  {uploading ? 'Uploading...' : 'Add Image'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    disabled={isBusy}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files ?? [])
                      for (const file of files) {
                        await uploadImage(file)
                      }
                      e.target.value = ''
                    }}
                  />
                </label>
                <small className="admin-upload-help">
                  First image is used as the main product image.
                </small>
              </div>
            </div>
          </div>

          {discount > 0 && (
            <div className="discount-preview">
              <strong>
                {discount}% OFF
              </strong>

              <span>
                Discount will be calculated
                automatically.
              </span>
            </div>
          )}

          <div className="admin-toggle-section">
            <ToggleOption
              title="Published"
              description="Visible on the public website"
              checked={
                form.published ??
                true
              }
              onChange={(checked) =>
                updateField(
                  'published',
                  checked,
                )
              }
              disabled={isBusy}
            />

            <ToggleOption
              title="Trending"
              description="Show in Trending Now"
              checked={
                form.trending ??
                false
              }
              onChange={(checked) =>
                updateField(
                  'trending',
                  checked,
                )
              }
              disabled={isBusy}
            />

            <ToggleOption
              title="New Find"
              description="Show in New Finds"
              checked={
                form.isNew ?? false
              }
              onChange={(checked) =>
                updateField(
                  'isNew',
                  checked,
                )
              }
              disabled={isBusy}
            />

            <ToggleOption
              title="Picksy Pick"
              description="Feature as a Picksy Pick"
              checked={
                form.picksyPick ??
                false
              }
              onChange={(checked) =>
                updateField(
                  'picksyPick',
                  checked,
                )
              }
              disabled={isBusy}
            />
          </div>

          <div className="admin-form-actions">
            <button
              className="admin-secondary-btn"
              onClick={onClose}
              disabled={isBusy}
            >
              Cancel
            </button>

            <button
              className="admin-primary-btn"
              onClick={() =>
                onSave(form)
              }
              disabled={
                isBusy ||
                categories.length === 0
              }
            >
              <CheckCircle2 size={17} />

              {uploading
                ? 'Uploading...'
                : saving
                  ? form.id
                    ? 'Updating...'
                    : 'Saving...'
                  : form.id
                    ? 'Update Product'
                    : 'Save Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

type ToggleOptionProps = {
  title: string
  description: string
  checked: boolean
  onChange: (
    checked: boolean,
  ) => void
  disabled?: boolean
}

function ToggleOption({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleOptionProps) {
  return (
    <button
      type="button"
      className={`admin-toggle-option ${
        checked ? 'is-on' : ''
      }`}
      onClick={() =>
        onChange(!checked)
      }
      aria-pressed={checked}
      disabled={disabled}
    >
      <div className="admin-toggle-content">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <span className="admin-switch">
        <span className="admin-switch-knob" />
      </span>
    </button>
  )
}