'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'
import { Plus, Search, Grid3X3, List, Trash2, Edit, Eye, EyeOff, Package, AlertTriangle } from 'lucide-react'

export default function ProductsPage() {
  const supabase = createClient()
  const { t, lang, dir } = useLanguage()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('الكل')
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(['الكل'])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [maxProducts, setMaxProducts] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: stores } = await supabase.from('stores').select('id, plans(max_products)').eq('user_id', user.id)
        if (!stores?.length) { setLoading(false); return }

        const maxLimit = (stores[0] as any).plans?.max_products ?? null
        setMaxProducts(maxLimit)
        const storeIds = stores.map(s => s.id)

        const { data: productsData } = await supabase
          .from('products').select('*, categories(name_ar, name_en)')
          .in('store_id', storeIds).order('created_at', { ascending: false })

        if (productsData) {
          const mapped = productsData.map(p => ({
            ...p,
            displayName: lang === 'ar' ? p.name_ar : (p.name_en || p.name_ar),
            categoryName: p.categories?.name_ar || 'غير مصنف',
          }))
          setProducts(mapped)
          const cats = ['الكل', ...new Set(mapped.map(p => p.categoryName))]
          setCategories(cats)
        }
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [lang])

  async function toggleActive(id: string, current: boolean) {
    const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', id)
    if (!error) setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  async function deleteProduct(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    setDeletingId(id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { toast.error('فشل الحذف'); setDeletingId(null); return }
    setProducts(prev => prev.filter(p => p.id !== id))
    toast.success('تم حذف المنتج')
    setDeletingId(null)
  }

  const filtered = products.filter(p => {
    const matchSearch = p.displayName?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'الكل' || p.categoryName === activeCategory
    return matchSearch && matchCat
  })

  const atLimit = maxProducts !== null && products.length >= maxProducts

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 1280 }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">المنتجات</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>
            {products.length} منتج{maxProducts ? ` من أصل ${maxProducts}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', gap: 2, background: '#F1F2F6', borderRadius: 8, padding: 3 }}>
            {(['list', 'grid'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: view === v ? '#fff' : 'transparent', color: view === v ? '#0F172A' : '#6B7280', boxShadow: view === v ? '0 1px 3px rgba(15,23,42,0.08)' : 'none', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}>
                {v === 'grid' ? <Grid3X3 size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>
          <Link href="/dashboard/products/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 9, background: atLimit ? '#E5E7EB' : '#6C3CE1', color: atLimit ? '#9CA3AF' : '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', pointerEvents: atLimit ? 'none' : 'auto', boxShadow: atLimit ? 'none' : '0 4px 12px rgba(108,60,225,0.22)' }}>
            <Plus size={16} />
            منتج جديد
          </Link>
        </div>
      </div>

      {atLimit && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#92400E' }}>
          <AlertTriangle size={18} color="#D97706" />
          وصلت إلى الحد الأقصى للمنتجات في باقتك الحالية. <Link href="/dashboard/settings" style={{ color: '#6C3CE1', fontWeight: 700 }}>ترقية الباقة</Link>
        </div>
      )}

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="mobile-search" style={{ maxWidth: 320, flex: 1, minWidth: 200 }}>
          <Search size={16} className="search-icon" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن منتج..." />
        </div>
        <div className="chips-row" style={{ flex: 1 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`chip ${activeCategory === cat ? 'active' : ''}`}>{cat}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <Package size={48} color="#E5E7EB" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 6 }}>لا توجد منتجات</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 24 }}>أضف منتجك الأول وابدأ البيع</p>
          <Link href="/dashboard/products/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 9, background: '#6C3CE1', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            <Plus size={16} />إضافة منتج
          </Link>
        </div>
      ) : view === 'list' ? (
        /* List view */
        <div className="card table-container" style={{ border: '1px solid #E5E7EB' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['المنتج', 'الفئة', 'السعر', 'المخزون', 'الحالة', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: dir === 'rtl' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#F7F8FA', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F7F8FA' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#F7F8FA' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #E5E7EB', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: '#F1F2F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Package size={18} color="#9CA3AF" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{p.displayName}</div>
                        {p.sku && <div style={{ fontSize: 11, color: '#9CA3AF' }}>SKU: {p.sku}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{p.categoryName}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                    {Number(p.price).toFixed(2)} <span style={{ fontSize: 11, color: '#9CA3AF' }}>د.أ</span>
                    {p.compare_price > p.price && <div style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through' }}>{Number(p.compare_price).toFixed(2)}</div>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {p.stock === 0
                      ? <span className="badge badge-error">نفد المخزون</span>
                      : p.stock <= 5
                        ? <span className="badge badge-warning">{p.stock} فقط</span>
                        : <span className="badge badge-success">{p.stock}</span>
                    }
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={p.is_active ? 'badge badge-success' : 'badge badge-gray'}>{p.is_active ? 'نشط' : 'مخفي'}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => toggleActive(p.id, p.is_active)} title={p.is_active ? 'إخفاء' : 'إظهار'}
                        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                        {p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <Link href={`/dashboard/products/${p.id}/edit`}
                        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', textDecoration: 'none' }}>
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => deleteProduct(p.id)} disabled={deletingId === p.id}
                        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid view */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {filtered.map(p => (
            <div key={p.id} className="card hover-lift" style={{ overflow: 'hidden' }}>
              <div style={{ height: 160, background: '#F7F8FA', position: 'relative', overflow: 'hidden' }}>
                {p.images?.[0]
                  ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={32} color="#D1D5DB" /></div>
                }
                <div style={{ position: 'absolute', top: 8, insetInlineStart: 8 }}>
                  <span className={p.is_active ? 'badge badge-success' : 'badge badge-gray'} style={{ fontSize: 10 }}>{p.is_active ? 'نشط' : 'مخفي'}</span>
                </div>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.displayName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#6C3CE1' }}>{Number(p.price).toFixed(2)} د.أ</span>
                  <span className={p.stock === 0 ? 'badge badge-error' : 'badge badge-gray'} style={{ fontSize: 10 }}>{p.stock === 0 ? 'نفد' : `${p.stock}`}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <Link href={`/dashboard/products/${p.id}/edit`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px', borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    <Edit size={13} />تعديل
                  </Link>
                  <button onClick={() => deleteProduct(p.id)}
                    style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #FEE2E2', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <Link href="/dashboard/products/new" className="fab" style={{ display: 'flex' }}>
        <Plus size={24} />
      </Link>
    </div>
  )
}
