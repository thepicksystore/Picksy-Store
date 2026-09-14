import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Package,
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

const categories = [
  'Women',
  'Men',
  'Kids',
  'Home',
  'Kitchen',
  'Beauty',
  'Electronics',
  'Gadgets',
  'Fashion',
  'Lifestyle',
  'Accessories',
  'Festival',
]

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
  affiliate_url: string | null
  badge: string | null
  description: string | null
  trending: boolean
  is_new: boolean
  picksy_pick: boolean
  published: boolean
}

type NoticeType = 'success' | 'error'

type Notice = {
  type: NoticeType
  message: string
}

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
    image: row.image ?? '',
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
    name: product.name,
    price: product.price,
    original_price: product.originalPrice,
    rating: product.rating,
    reviews: Number(product.reviews) || 0,
    marketplace: product.marketplace,
    category: product.category,
    image: product.image || null,
    affiliate_url: product.affiliateUrl || null,
    badge: product.badge || null,
    description: product.description || null,
    trending: product.trending ?? false,
    is_new: product.isNew ?? false,
    picksy_pick: product.picksyPick ?? false,
    published: product.published ?? true,
    updated_at: new Date().toISOString(),
  }
}

export default function Admin() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])

  const [activeSection, setActiveSection] =
    useState<AdminSection>('overview')

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [marketplaceFilter, setMarketplaceFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [quickFilter, setQuickFilter] = useState('All')

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [notice, setNotice] = useState<Notice | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function showNotice(
    type: NoticeType,
    message: string,
  ) {
    setNotice({
      type,
      message,
    })

    window.setTimeout(() => {
      setNotice(null)
    }, 3500)
  }

  useEffect(() => {
    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)

      if (currentSession) {
        loadProducts()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setSession(session)

    if (session) {
      await loadProducts()
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoginError(error.message)
      setLoginLoading(false)
      return
    }

    setEmail('')
    setPassword('')
    setLoginLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setProducts([])
    setNotice(null)
  }

  async function handleDelete(id: string) {
    const product = products.find((item) => item.id === id)

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
      current.filter((product) => product.id !== id),
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

    if (product.rating < 0 || product.rating > 5) {
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
          item.id === product.id ? dbToProduct(data) : item,
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchMatch =
        !search.trim() ||
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.category
          .toLowerCase()
          .includes(search.toLowerCase())

      const categoryMatch =
        categoryFilter === 'All' ||
        product.category === categoryFilter

      const marketplaceMatch =
        marketplaceFilter === 'All' ||
        product.marketplace === marketplaceFilter

      const statusMatch =
        statusFilter === 'All' ||
        (statusFilter === 'Published' && product.published) ||
        (statusFilter === 'Unpublished' && !product.published)

      const quickMatch =
        quickFilter === 'All' ||
        (quickFilter === 'Trending' && product.trending) ||
        (quickFilter === 'New' && product.isNew) ||
        (quickFilter === 'Picksy Pick' && product.picksyPick)

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

  const stats = {
    total: products.length,
    published: products.filter((p) => p.published).length,
    unpublished: products.filter((p) => !p.published).length,
    trending: products.filter((p) => p.trending).length,
    newFinds: products.filter((p) => p.isNew).length,
    picksyPicks: products.filter((p) => p.picksyPick).length,
  }

  const recentProducts = products.slice(0, 5)

  function clearFilters() {
    setSearch('')
    setCategoryFilter('All')
    setMarketplaceFilter('All')
    setStatusFilter('All')
    setQuickFilter('All')
  }

  const hasFilters =
    search ||
    categoryFilter !== 'All' ||
    marketplaceFilter !== 'All' ||
    statusFilter !== 'All' ||
    quickFilter !== 'All'

  function handleSectionChange(section: AdminSection) {
    setActiveSection(section)
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
    return (
      <div className="admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <div className="admin-login-icon">
            <LayoutDashboard size={28} />
          </div>

          <h1>Picksy Admin</h1>
          <p>Sign in to manage your products.</p>

          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            disabled={loginLoading}
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loginLoading}
          />

          {loginError && (
            <div className="admin-error">
              {loginError}
            </div>
          )}

          <button
            className="admin-primary-btn"
            type="submit"
            disabled={loginLoading}
          >
            {loginLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    )
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
          <div className="admin-brand-icon">
            <Package size={22} />
          </div>

          <div>
            <strong>Picksy</strong>
            <span>Admin</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={
              activeSection === 'overview' ? 'active' : ''
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
              activeSection === 'products' ? 'active' : ''
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
                <p>Manage your Picksy products</p>
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
                <strong>{stats.unpublished}</strong>
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
                <strong>{stats.picksyPicks}</strong>
              </div>
            </section>

            <section className="admin-products-section">
              <div className="admin-section-header">
                <div>
                  <h2>Recent Products</h2>
                  <p>
                    Your latest products added to Picksy
                  </p>
                </div>

                <button
                  className="admin-secondary-btn"
                  onClick={() =>
                    handleSectionChange('products')
                  }
                >
                  View All Products
                </button>
              </div>

              <div className="admin-table-wrapper">
                {recentProducts.length === 0 ? (
                  <div className="admin-empty">
                    <Package size={38} />
                    <h3>No products yet</h3>
                    <p>
                      Add your first product to start
                      building Picksy.
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
                      {recentProducts.map((product) => (
                        <ProductTableRow
                          key={product.id}
                          product={product}
                          onEdit={openEditForm}
                          onDelete={handleDelete}
                          deletingId={deletingId}
                        />
                      ))}
                    </tbody>
                  </table>
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
                  Manage your Picksy product catalog
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
                <strong>{stats.unpublished}</strong>
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
                <strong>{stats.picksyPicks}</strong>
              </div>
            </section>

            <section className="admin-products-section">
              <div className="admin-section-header">
                <div>
                  <h2>All Products</h2>
                  <p>
                    Showing {filteredProducts.length} of{' '}
                    {products.length} products
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
                      setSearch(e.target.value)
                    }
                  />

                  {search && (
                    <button
                      onClick={() => setSearch('')}
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
                    setCategoryFilter(e.target.value)
                  }
                >
                  <option value="All">
                    All Categories
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={marketplaceFilter}
                  onChange={(e) =>
                    setMarketplaceFilter(e.target.value)
                  }
                >
                  <option value="All">
                    All Marketplaces
                  </option>
                  <option value="Amazon">Amazon</option>
                  <option value="Flipkart">
                    Flipkart
                  </option>
                  <option value="Meesho">Meesho</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
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
                    setQuickFilter(e.target.value)
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
                {filteredProducts.length === 0 ? (
                  <div className="admin-empty">
                    <Package size={38} />

                    <h3>No products found</h3>

                    <p>
                      Try changing your filters or add a
                      new product.
                    </p>

                    {hasFilters && (
                      <button onClick={clearFilters}>
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
                      {filteredProducts.map((product) => (
                        <ProductTableRow
                          key={product.id}
                          product={product}
                          onEdit={openEditForm}
                          onDelete={handleDelete}
                          deletingId={deletingId}
                        />
                      ))}
                    </tbody>
                  </table>
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
                <p>Manage product categories</p>
              </div>
            </header>

            <div className="admin-empty">
              <Tags size={42} />
              <h3>
                Categories module coming next
              </h3>
              <p>
                Your current product categories are already
                available in the product form.
              </p>
            </div>
          </section>
        )}

        {activeSection === 'analytics' && (
          <section className="admin-products-section">
            <header className="admin-topbar">
              <div>
                <h1>Analytics</h1>
                <p>
                  Track your Picksy performance
                </p>
              </div>
            </header>

            <div className="admin-empty">
              <BarChart3 size={42} />
              <h3>
                Analytics module coming next
              </h3>
              <p>
                We will connect product and affiliate
                analytics here later.
              </p>
            </div>
          </section>
        )}

        {activeSection === 'settings' && (
          <section className="admin-products-section">
            <header className="admin-topbar">
              <div>
                <h1>Settings</h1>
                <p>
                  Manage your Picksy admin settings
                </p>
              </div>
            </header>

            <div className="admin-empty">
              <Settings size={42} />
              <h3>
                Settings module coming next
              </h3>
              <p>
                Admin and website settings will be added
                here.
              </p>
            </div>
          </section>
        )}
      </main>

      {showForm && (
        <ProductForm
          product={editingProduct ?? emptyProduct}
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
  const isDeleting = deletingId === product.id

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
            onClick={() => onEdit(product)}
            title="Edit product"
            disabled={isDeleting}
          >
            <Pencil size={16} />
          </button>

          <button
            className="delete-btn"
            onClick={() => onDelete(product.id)}
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
  onClose: () => void
  onSave: (product: Product) => Promise<void>
  saving: boolean
}

function ProductForm({
  product,
  onClose,
  onSave,
  saving,
}: ProductFormProps) {
  const [form, setForm] = useState<Product>({
    ...product,
    published: product.published ?? true,
  })

  const [uploading, setUploading] = useState(false)

  function updateField<K extends keyof Product>(
    key: K,
    value: Product[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function uploadImage(file: File) {
    setUploading(true)

    const extension =
      file.name.split('.').pop() || 'jpg'

    const fileName = `products/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error(error)

      setUploading(false)

      alert(
        `Unable to upload image: ${error.message}`,
      )

      return
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    updateField('image', data.publicUrl)

    setUploading(false)
  }

  const discount =
    form.originalPrice > form.price &&
    form.originalPrice > 0
      ? Math.round(
          ((form.originalPrice - form.price) /
            form.originalPrice) *
            100,
        )
      : 0

  const isBusy = uploading || saving

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
              <label>Product Name</label>

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
              <label>Marketplace</label>

              <select
                value={form.marketplace}
                onChange={(e) =>
                  updateField(
                    'marketplace',
                    e.target.value as Marketplace,
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
                disabled={isBusy}
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
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
                    Number(e.target.value),
                  )
                }
                disabled={isBusy}
              />
            </div>

            <div className="admin-field">
              <label>Original Price</label>

              <input
                type="number"
                min="0"
                value={form.originalPrice}
                onChange={(e) =>
                  updateField(
                    'originalPrice',
                    Number(e.target.value),
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
                    Number(e.target.value),
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
              <label>Affiliate URL</label>

              <input
                type="url"
                value={form.affiliateUrl ?? ''}
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
                value={form.description}
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
              <label>Product Image</label>

              <div className="admin-image-upload">
                {form.image ? (
                  <img
                    src={form.image}
                    alt={
                      form.name || 'Product'
                    }
                  />
                ) : (
                  <div className="admin-image-placeholder">
                    <ImagePlus size={30} />

                    <div>
                      <strong>
                        No image selected
                      </strong>
                      <small>
                        Upload a product image
                      </small>
                    </div>
                  </div>
                )}

                <label
                  className={`upload-button ${
                    isBusy
                      ? 'is-disabled'
                      : ''
                  }`}
                >
                  <Upload size={17} />

                  {uploading
                    ? 'Uploading...'
                    : 'Upload Image'}

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={isBusy}
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0]

                      if (file) {
                        uploadImage(file)
                      }

                      e.target.value = ''
                    }}
                  />
                </label>
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

          {/* =========================
              PRODUCT VISIBILITY OPTIONS
              ========================= */}

          <div className="admin-toggle-section">
            <ToggleOption
              title="Published"
              description="Visible on the public website"
              checked={
                form.published ?? true
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
                form.trending ?? false
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
                form.picksyPick ?? false
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
              onClick={() => onSave(form)}
              disabled={isBusy}
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
  onChange: (checked: boolean) => void
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