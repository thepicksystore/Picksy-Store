import { useMemo, useState } from 'react'
import { BarChart3, CheckCircle2, ImagePlus, LayoutDashboard, LogOut, Package, Pencil, Plus, Search, Settings, Tags, Trash2, X } from 'lucide-react'
import { products as seedProducts } from '../data/products'
import type { Product } from '../types/product'

const categories = ['Women','Men','Kids','Home','Kitchen','Beauty','Electronics','Gadgets','Fashion','Lifestyle','Accessories','Festival']

export default function Admin() {
  const [items, setItems] = useState<Product[]>(seedProducts)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [toast, setToast] = useState('')

  const visible = useMemo(() => items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())), [items, search])
  const published = items.length
  const trending = items.filter(p => p.trending).length
  const picks = items.filter(p => p.picksyPick).length

  const save = (product: Product) => {
    setItems(current => editing ? current.map(p => p.id === product.id ? product : p) : [product, ...current])
    setEditing(null); setShowForm(false); setToast(editing ? 'Product updated' : 'Product added')
    setTimeout(() => setToast(''), 2200)
  }
  const remove = (id: string) => {
    if (!confirm('Delete this product?')) return
    setItems(current => current.filter(p => p.id !== id)); setToast('Product deleted'); setTimeout(() => setToast(''), 2200)
  }

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a href="/" className="brand"><span className="brand-mark"><Package size={18}/></span><span><strong>Picksy</strong><small>Admin Studio</small></span></a>
      <div className="admin-nav"><button className="selected"><LayoutDashboard size={17}/> Overview</button><button><Package size={17}/> Products <span>{items.length}</span></button><button><Tags size={17}/> Categories</button><button><BarChart3 size={17}/> Analytics</button><button><Settings size={17}/> Settings</button></div>
      <button className="admin-logout"><LogOut size={17}/> Sign out</button>
    </aside>
    <main className="admin-main">
      <div className="admin-top"><div><p className="eyebrow">PICKSY ADMIN</p><h1>Good morning 👋</h1><p>Manage your daily product finds from one place.</p></div><button className="admin-primary" onClick={() => {setEditing(null);setShowForm(true)}}><Plus size={18}/> Add Product</button></div>
      <div className="admin-stats"><Stat label="Total Products" value={items.length} icon={<Package/>}/><Stat label="Published" value={published} icon={<CheckCircle2/>}/><Stat label="Trending" value={trending} icon={<BarChart3/>}/><Stat label="Picksy Picks" value={picks} icon={<Tags/>}/></div>
      <section className="admin-panel"><div className="panel-head"><div><h2>Products</h2><p>Add, edit and organize your daily finds.</p></div><div className="admin-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..."/></div></div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Marketplace</th><th>Category</th><th>Price</th><th>Tags</th><th>Actions</th></tr></thead><tbody>{visible.map(p=><tr key={p.id}><td><div className="admin-product"><img src={p.image} alt=""/><div><b>{p.name}</b><small>{p.rating} ★ · {p.reviews} reviews</small></div></div></td><td><span className="marketplace">{p.marketplace}</span></td><td>{p.category}</td><td><b>₹{p.price.toLocaleString('en-IN')}</b></td><td><div className="admin-tags">{p.trending&&<span>Trending</span>}{p.isNew&&<span>New</span>}{p.picksyPick&&<span>Picksy Pick</span>}</div></td><td><div className="row-actions"><button aria-label="Edit" onClick={()=>{setEditing(p);setShowForm(true)}}><Pencil size={15}/></button><button aria-label="Delete" onClick={()=>remove(p.id)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>
      </section>
    </main>
    {showForm && <ProductForm initial={editing} onClose={()=>{setShowForm(false);setEditing(null)}} onSave={save}/>} 
    {toast && <div className="toast">{toast}</div>}
  </div>
}
function Stat({label,value,icon}:{label:string,value:number,icon:React.ReactNode}){return <div className="admin-stat"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>}
function ProductForm({initial,onClose,onSave}:{initial:Product|null,onClose:()=>void,onSave:(p:Product)=>void}){
 const [form,setForm]=useState<Product>(initial ?? {id:'product-'+Date.now(),name:'',price:0,originalPrice:0,rating:0,reviews:'0',marketplace:'Amazon',category:'Home',image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85',description:'',badge:'',trending:false,isNew:true,picksyPick:false})
 const set=(key:keyof Product,val:unknown)=>setForm(f=>({...f,[key]:val}))
 return <div className="modal-backdrop"><div className="product-modal"><div className="modal-head"><div><p className="eyebrow">{initial?'EDIT PRODUCT':'NEW PRODUCT'}</p><h2>{initial?'Update product':'Add a new find'}</h2></div><button onClick={onClose}><X/></button></div><div className="form-grid"><label>Product name<input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Minimal Desk Lamp"/></label><label>Marketplace<select value={form.marketplace} onChange={e=>set('marketplace',e.target.value)}><option>Amazon</option><option>Flipkart</option><option>Meesho</option></select></label><label>Category<select value={form.category} onChange={e=>set('category',e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Price (₹)<input type="number" value={form.price} onChange={e=>set('price',Number(e.target.value))}/></label><label>Original price (₹)<input type="number" value={form.originalPrice} onChange={e=>set('originalPrice',Number(e.target.value))}/></label><label>Rating<input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e=>set('rating',Number(e.target.value))}/></label><label>Reviews<input value={form.reviews} onChange={e=>set('reviews',e.target.value)} placeholder="1.2k"/></label><label>Image URL<input value={form.image} onChange={e=>set('image',e.target.value)} placeholder="https://..."/></label><label className="full">Description<textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={3} placeholder="Short useful description..."/></label><div className="image-drop full"><ImagePlus size={20}/><div><b>Image upload ready</b><small>Supabase Storage will replace this URL field in the next phase.</small></div></div><div className="toggle-row full"><label><input type="checkbox" checked={!!form.trending} onChange={e=>set('trending',e.target.checked)}/> Trending</label><label><input type="checkbox" checked={!!form.isNew} onChange={e=>set('isNew',e.target.checked)}/> New</label><label><input type="checkbox" checked={!!form.picksyPick} onChange={e=>set('picksyPick',e.target.checked)}/> Picksy Pick</label></div></div><div className="modal-actions"><button className="secondary-cta" onClick={onClose}>Cancel</button><button className="admin-primary" disabled={!form.name.trim()} onClick={()=>onSave({...form,badge:form.picksyPick?'Picksy Pick':form.trending?'Trending':form.isNew?'New':''})}>{initial?'Save Changes':'Publish Product'}</button></div></div></div>
}
