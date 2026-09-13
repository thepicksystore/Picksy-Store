import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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
import type { Product } from '../types/product'

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

type DbProduct = {
  id: string
  name: string
  slug: string | null
  description: string | null
  short_description: string | null
  price: number
  original_price: number
  rating: number
  reviews: number
  marketplace: string
  affiliate_url: string | null
  image: string | null
  category: string
  tags: string[] | null
  highlights: string[] | null
  material: string | null
  dimensions: string | null
  availability: string | null
  badge: string | null
  trending: boolean
  is_new: boolean
  picksy_pick: boolean
  published: boolean
  created_at: string
  updated_at: string
}

function dbToProduct(p: DbProduct): Product {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price ?? 0),
    originalPrice: Number(p.original_price ?? 0),
    rating: Number(p.rating ?? 0),
    reviews: String(p.reviews ?? 0),
    marketplace: p.marketplace as Product['marketplace'],
    affiliateUrl: p.affiliate_url || '',
    image: p.image || '',
    category: p.category,
    description: p.description || '',
    badge: p.badge || '',
    trending: !!p.trending,
    isNew: !!p.is_new,
    picksyPick: !!p.picksy_pick,
  }
}

function productToDb(product: Product) {
  return {
    name: product.name,
    slug:
      product.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || null,
    description: product.description || '',
    short_description: product.description || '',
    price: Number(product.price) || 0,
    original_price: Number(product.originalPrice) || 0,
    rating: Number(product.rating) || 0,
    reviews:
      Number.parseInt(String(product.reviews || 0), 10) || 0,
    marketplace: product.marketplace,
    affiliate_url: product.affiliateUrl || null,
    image: product.image || null,
    category: product.category,
    tags: [],
    highlights: [],
    material: null,
    dimensions: null,
    availability: 'In Stock',
    badge: product.badge || null,
    trending: !!product.trending,
    is_new: !!product.isNew,
    picksy_pick: !!product.picksyPick,
    published: true,
    updated_at: new Date().toISOString(),
  }
}

export default function Admin() {
  const [sessionChecked, setSessionChecked] = useState(false)
  const [session, setSession] = useState<any>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
        setSessionChecked(true)

        if (currentSession) {
          loadProducts()
        } else {
          setItems([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkSession = async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()

    setSession(currentSession)
    setSessionChecked(true)

    if (currentSession) {
      loadProducts()
    }
  }

  const login = async () => {
    setLoginError('')

    if (!email.trim() || !password) {
      setLoginError(
        'Please enter your email and password.'
      )
      return
    }

    setLoginLoading(true)

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

    setLoginLoading(false)

    if (error) {
      setLoginError(error.message)
      return
    }

    setPassword('')
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setItems([])
    setEditing(null)
    setShowForm(false)
  }

  const loadProducts = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase load error:', error)
      showToast(
        `Could not load products: ${error.message}`
      )
      setLoading(false)
      return
    }

    setItems(
      (data as DbProduct[]).map(dbToProduct)
    )

    setLoading(false)
  }

  const showToast = (message: string) => {
    setToast(message)

    setTimeout(() => {
      setToast('')
    }, 3000)
  }

  const visible = useMemo(
    () =>
      items.filter(
        (p) =>
          p.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          p.category
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [items, search]
  )

  const published = items.length

  const trending = items.filter(
    (p) => p.trending
  ).length

  const picks = items.filter(
    (p) => p.picksyPick
  ).length

  const save = async (product: Product) => {
    const dbProduct = productToDb(product)

    if (editing) {
      const { data, error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', product.id)
        .select()
        .single()

      if (error) {
        console.error(
          'Supabase update error:',
          error
        )

        showToast(
          `Update failed: ${error.message}`
        )

        return
      }

      setItems((current) =>
        current.map((p) =>
          p.id === product.id
            ? dbToProduct(data as DbProduct)
            : p
        )
      )

      setEditing(null)
      setShowForm(false)

      showToast(
        'Product updated successfully'
      )

      return
    }

    const { data, error } = await supabase
      .from('products')
      .insert(dbProduct)
      .select()
      .single()

    if (error) {
      console.error(
        'Supabase insert error:',
        error
      )

      showToast(
        `Add failed: ${error.message}`
      )

      return
    }

    setItems((current) => [
      dbToProduct(data as DbProduct),
      ...current,
    ])

    setEditing(null)
    setShowForm(false)

    showToast(
      'Product added successfully'
    )
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) {
      return
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(
        'Supabase delete error:',
        error
      )

      showToast(
        `Delete failed: ${error.message}`
      )

      return
    }

    setItems((current) =>
      current.filter((p) => p.id !== id)
    )

    showToast(
      'Product deleted successfully'
    )
  }

  if (!sessionChecked) {
    return (
      <div className="admin-login-page">
        <div className="login-card">
          <div className="login-logo">
            <span className="brand-mark">
              <Package size={20} />
            </span>
          </div>

          <h1>
            Loading Picksy Admin...
          </h1>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="admin-login-page">
        <div className="login-card">
          <div className="login-logo">
            <span className="brand-mark">
              <Package size={20} />
            </span>
          </div>

          <p className="eyebrow">
            PICKSY ADMIN
          </p>

          <h1>
            Welcome back
          </h1>

          <p className="login-subtitle">
            Sign in to manage your Picksy products.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              login()
            }}
          >
            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </label>

            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </label>

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="admin-primary login-button"
              disabled={loginLoading}
            >
              {loginLoading
                ? 'Signing in...'
                : 'Sign in'}
            </button>
          </form>

          <a
            href="/"
            className="back-home"
          >
            ← Back to Picksy Store
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a
          href="/"
          className="brand"
        >
          <span className="brand-mark">
            <Package size={18} />
          </span>

          <span>
            <strong>Picksy</strong>
            <small>
              Admin Studio
            </small>
          </span>
        </a>

        <div className="admin-nav">
          <button className="selected">
            <LayoutDashboard size={17} />
            Overview
          </button>

          <button>
            <Package size={17} />
            Products
            <span>
              {items.length}
            </span>
          </button>

          <button>
            <Tags size={17} />
            Categories
          </button>

          <button>
            <BarChart3 size={17} />
            Analytics
          </button>

          <button>
            <Settings size={17} />
            Settings
          </button>
        </div>

        <button
          className="admin-logout"
          onClick={logout}
        >
          <LogOut size={17} />
          Sign out
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div>
            <p className="eyebrow">
              PICKSY ADMIN
            </p>

            <h1>
              Good morning 👋
            </h1>

            <p>
              Manage your daily product finds from one place.
            </p>
          </div>

          <button
            className="admin-primary"
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        <div className="admin-stats">
          <Stat
            label="Total Products"
            value={items.length}
            icon={<Package />}
          />

          <Stat
            label="Published"
            value={published}
            icon={<CheckCircle2 />}
          />

          <Stat
            label="Trending"
            value={trending}
            icon={<BarChart3 />}
          />

          <Stat
            label="Picksy Picks"
            value={picks}
            icon={<Tags />}
          />
        </div>

        <section className="admin-panel">
          <div className="panel-head">
            <div>
              <h2>
                Products
              </h2>

              <p>
                Add, edit and organize your daily finds.
              </p>
            </div>

            <div className="admin-search">
              <Search size={16} />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products..."
              />
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Marketplace</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: 'center',
                        padding: '40px',
                      }}
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : visible.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: 'center',
                        padding: '40px',
                      }}
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  visible.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin-product">
                          <img
                            src={p.image}
                            alt=""
                          />

                          <div>
                            <b>
                              {p.name}
                            </b>

                            <small>
                              {p.rating} ★ ·{' '}
                              {p.reviews} reviews
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="marketplace">
                          {p.marketplace}
                        </span>
                      </td>

                      <td>
                        {p.category}
                      </td>

                      <td>
                        <b>
                          ₹
                          {Number(
                            p.price
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </b>
                      </td>

                      <td>
                        <div className="admin-tags">
                          {p.trending && (
                            <span>
                              Trending
                            </span>
                          )}

                          {p.isNew && (
                            <span>
                              New
                            </span>
                          )}

                          {p.picksyPick && (
                            <span>
                              Picksy Pick
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="row-actions">
                          <button
                            aria-label="Edit"
                            onClick={() => {
                              setEditing(p)
                              setShowForm(true)
                            }}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            aria-label="Delete"
                            onClick={() =>
                              remove(p.id)
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showForm && (
        <ProductForm
          initial={editing}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
          onSave={save}
        />
      )}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: ReactNode
}) {
  return (
    <div className="admin-stat">
      <span>
        {icon}
      </span>

      <div>
        <small>
          {label}
        </small>

        <strong>
          {value}
        </strong>
      </div>
    </div>
  )
}

function ProductForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Product | null
  onClose: () => void
  onSave: (p: Product) => void
}) {
  const [form, setForm] =
    useState<Product>(
      initial ?? {
        id: '',
        name: '',
        price: 0,
        originalPrice: 0,
        rating: 0,
        reviews: '0',
        marketplace: 'Amazon',
        affiliateUrl: '',
        category: 'Home',
        image:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85',
        description: '',
        badge: '',
        trending: false,
        isNew: true,
        picksyPick: false,
      }
    )

  const [uploading, setUploading] =
    useState(false)

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [uploadError, setUploadError] =
    useState('')

  const set = (
    key: keyof Product,
    val: unknown
  ) =>
    setForm((f) => ({
      ...f,
      [key]: val,
    }))

  const uploadImage = async (
    file: File
  ) => {
    setUploadError('')

    if (!file.type.startsWith('image/')) {
      setUploadError(
        'Please select an image file.'
      )
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setUploadError(
        'Image must be smaller than 5MB.'
      )
      return
    }

    setSelectedFile(file)
    setUploading(true)

    const extension =
      file.name.split('.').pop()?.toLowerCase() ||
      'jpg'

    const fileName = `${crypto.randomUUID()}.${extension}`

    const filePath = `products/${fileName}`

    const { error } =
      await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

    if (error) {
      console.error(
        'Image upload error:',
        error
      )

      setUploadError(
        `Image upload failed: ${error.message}`
      )

      setUploading(false)
      return
    }

    const {
      data: publicUrlData,
    } =
      supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

    set(
      'image',
      publicUrlData.publicUrl
    )

    setUploading(false)
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0]

    if (!file) return

    uploadImage(file)
  }

  return (
    <div className="modal-backdrop">
      <div className="product-modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">
              {initial
                ? 'EDIT PRODUCT'
                : 'NEW PRODUCT'}
            </p>

            <h2>
              {initial
                ? 'Update product'
                : 'Add a new find'}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        <div className="form-grid">
          <label>
            Product name

            <input
              value={form.name}
              onChange={(e) =>
                set(
                  'name',
                  e.target.value
                )
              }
              placeholder="e.g. Minimal Desk Lamp"
            />
          </label>

          <label>
            Marketplace

            <select
              value={form.marketplace}
              onChange={(e) =>
                set(
                  'marketplace',
                  e.target.value as Product['marketplace']
                )
              }
            >
              <option>
                Amazon
              </option>

              <option>
                Flipkart
              </option>

              <option>
                Meesho
              </option>
            </select>
          </label>

          <label>
            Category

            <select
              value={form.category}
              onChange={(e) =>
                set(
                  'category',
                  e.target.value
                )
              }
            >
              {categories.map(
                (c) => (
                  <option
                    key={c}
                  >
                    {c}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Price (₹)

            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                set(
                  'price',
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </label>

          <label>
            Original price (₹)

            <input
              type="number"
              value={
                form.originalPrice
              }
              onChange={(e) =>
                set(
                  'originalPrice',
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </label>

          <label>
            Rating

            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={(e) =>
                set(
                  'rating',
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </label>

          <label>
            Reviews

            <input
              value={form.reviews}
              onChange={(e) =>
                set(
                  'reviews',
                  e.target.value
                )
              }
              placeholder="1200"
            />
          </label>

          <label>
            Affiliate URL

            <input
              type="url"
              value={
                form.affiliateUrl ||
                ''
              }
              onChange={(e) =>
                set(
                  'affiliateUrl',
                  e.target.value
                )
              }
              placeholder="Paste Amazon / Flipkart / Meesho link"
            />
          </label>

          <label className="full">
            Description

            <textarea
              value={
                form.description
              }
              onChange={(e) =>
                set(
                  'description',
                  e.target.value
                )
              }
              rows={3}
              placeholder="Short useful description..."
            />
          </label>

          <div className="image-upload-section full">
            <div className="image-upload-header">
              <div>
                <b>
                  Product Image
                </b>

                <small>
                  Upload an image to
                  Supabase Storage.
                </small>
              </div>

              <label className="image-upload-button">
                <Upload size={16} />

                {uploading
                  ? 'Uploading...'
                  : 'Choose Image'}

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFileChange
                  }
                  disabled={
                    uploading
                  }
                  hidden
                />
              </label>
            </div>

            {form.image && (
              <div className="image-preview">
                <img
                  src={form.image}
                  alt="Product preview"
                />

                <div>
                  <small>
                    {selectedFile
                      ? selectedFile.name
                      : initial
                        ? 'Current product image'
                        : 'Product image'}
                  </small>
                </div>
              </div>
            )}

            {!form.image && (
              <label className="image-drop">
                <ImagePlus size={24} />

                <div>
                  <b>
                    Upload product image
                  </b>

                  <small>
                    JPG, PNG or WEBP · Max 5MB
                  </small>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFileChange
                  }
                  disabled={
                    uploading
                  }
                  hidden
                />
              </label>
            )}

            {uploading && (
              <div className="upload-status">
                Uploading image...
              </div>
            )}

            {uploadError && (
              <div className="login-error">
                {uploadError}
              </div>
            )}
          </div>

          <div className="toggle-row full">
            <label>
              <input
                type="checkbox"
                checked={
                  !!form.trending
                }
                onChange={(e) =>
                  set(
                    'trending',
                    e.target.checked
                  )
                }
              />

              Trending
            </label>

            <label>
              <input
                type="checkbox"
                checked={
                  !!form.isNew
                }
                onChange={(e) =>
                  set(
                    'isNew',
                    e.target.checked
                  )
                }
              />

              New
            </label>

            <label>
              <input
                type="checkbox"
                checked={
                  !!form.picksyPick
                }
                onChange={(e) =>
                  set(
                    'picksyPick',
                    e.target.checked
                  )
                }
              />

              Picksy Pick
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="secondary-cta"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="admin-primary"
            disabled={
              !form.name.trim() ||
              uploading
            }
            onClick={() =>
              onSave({
                ...form,
                badge: form.picksyPick
                  ? 'Picksy Pick'
                  : form.trending
                    ? 'Trending'
                    : form.isNew
                      ? 'New'
                      : '',
              })
            }
          >
            {initial
              ? 'Save Changes'
              : 'Publish Product'}
          </button>
        </div>
      </div>
    </div>
  )
}