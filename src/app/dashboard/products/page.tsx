'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Plus, Search, Package, Edit, Trash2, Eye, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

function getStockBadge(stock: number) {
    if (stock === 0) return { label: 'نفد', bg: '#FEE2E2', color: '#B91C1C' }
    if (stock <= 3) return { label: `${stock} فقط`, bg: '#FEF3C7', color: '#92400E' }
    return { label: `${stock}`, bg: '#D1FAE5', color: '#065F46' }
}

export default function ProductsPage() {
    const supabase = createClient()
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('الكل')
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>(['الكل'])
    const [loading, setLoading] = useState(true)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [maxProducts, setMaxProducts] = useState<number | null>(null)
    const [canAddProduct, setCanAddProduct] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: stores } = await supabase
                    .from('stores')
                    .select('id, plans(max_products)')
                    .eq('user_id', user.id)

                if (!stores || stores.length === 0) { setLoading(false); return }

                // @ts-ignore
                const maxLimit = stores[0].plans?.max_products ?? null
                setMaxProducts(maxLimit)

                const storeIds = stores.map(s => s.id)

                const { data: productsData } = await supabase
                    .from('products')
                    .select('*, categories(name_ar)')
                    .in('store_id', storeIds)
                    .order('created_at', { ascending: false })

                if (productsData) {
                    setProducts(productsData.map(p => ({
                        ...p,
                        name: p.name_ar,
                        category: p.categories?.name_ar || 'غير مصنف',
                        status: p.is_active ? 'active' : 'inactive',
                        sales: p.sold_count || 0,
                    })))
                    setCanAddProduct(maxLimit === null || productsData.length < maxLimit)
                    const cats = Array.from(new Set(productsData.map(p => p.categories?.name_ar).filter(Boolean))) as string[]
                    setCategories(['الكل', ...cats])
                }
            } catch (err) {
                console.error('Error fetching products:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [supabase])

    async function handleDelete(id: string) {
        try {
            const { error } = await supabase.from('products').delete().eq('id', id)
            if (error) throw error
            toast.success('تم حذف المنتج بنجاح')
            setProducts(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            toast.error('حدث خطأ أثناء حذف المنتج')
        }
    }

    const filtered = products.filter(p => {
        const matchesCat = activeCategory === 'الكل' || p.category === activeCategory
        const matchesSearch = p.name.includes(search) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
        return matchesCat && matchesSearch
    })

    if (loading) return (
        <div className="page-container" dir="rtl">
            <div style={{ marginBottom: 20 }}>
                <div className="skeleton skeleton-text" style={{ width: 120, height: 22, marginBottom: 8 }} />
                <div className="skeleton skeleton-text" style={{ width: 80, height: 14 }} />
            </div>
            <div className="mobile-grid-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="skeleton" style={{ height: 160, borderRadius: 14 }} />
                ))}
            </div>
        </div>
    )

    return (
        <div className="page-container" dir="rtl">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">المنتجات</h1>
                    <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>
                        {products.length} منتج في متجرك
                        {maxProducts !== null && <span style={{ color: canAddProduct ? '#6B6058' : '#B91C1C' }}> / {maxProducts}</span>}
                    </p>
                </div>
                {/* Desktop add button */}
                <div className="hide-on-mobile">
                    {canAddProduct ? (
                        <Link href="/dashboard/products/new" className="btn btn-primary">
                            <Plus size={16} />
                            إضافة منتج
                        </Link>
                    ) : (
                        <button className="btn btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                            <Plus size={16} />
                            ترقية الباقة
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="mobile-search" style={{ marginBottom: 14 }}>
                <Search size={17} className="search-icon" />
                <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="ابحث باسم المنتج أو الكود..."
                    style={{ paddingRight: 44 }}
                />
            </div>

            {/* Category chips */}
            <div className="chips-row" style={{ marginBottom: 20 }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`chip ${activeCategory === cat ? 'active' : ''}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* ── Desktop Table (hidden on mobile) ── */}
            <div className="card hide-on-mobile">
                {filtered.length === 0 ? (
                    <div style={{ padding: 80, textAlign: 'center' }}>
                        <Package size={48} color="#A09080" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ color: '#6B6058', fontWeight: 600 }}>لا توجد منتجات</h3>
                        <p style={{ color: '#A09080', fontSize: 14, marginTop: 8 }}>
                            <Link href="/dashboard/products/new" style={{ color: '#222222', fontWeight: 700 }}>أضف منتجاً الآن ←</Link>
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['المنتج', 'الكود', 'السعر', 'المخزون', 'المبيعات', 'الحالة', 'إجراءات'].map(h => (
                                    <th key={h} style={{ textAlign: 'right', padding: '14px 16px', background: '#F5F0E8', fontSize: 12, color: '#6B6058', fontWeight: 700 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(product => {
                                const stockBadge = getStockBadge(product.stock)
                                return (
                                    <tr key={product.id} style={{ borderTop: '1px solid #E0D6C8' }}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#F5F0E8', border: '1px solid #E0D6C8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {product.image_url
                                                        ? <img src={product.image_url} alt={product.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                                                        : <Package size={22} color="#A09080" />
                                                    }
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{product.name}</div>
                                                    <div style={{ fontSize: 12, color: '#A09080', marginTop: 2 }}>{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#6B6058', fontSize: 13 }}>{product.sku || '—'}</td>
                                        <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14 }}>{product.price?.toFixed(2)} د.أ</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ background: stockBadge.bg, color: stockBadge.color, padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                                                {stockBadge.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#6B6058', fontSize: 13 }}>{product.sales} مبيعة</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ background: product.status === 'active' ? '#D1FAE5' : '#F3F4F6', color: product.status === 'active' ? '#065F46' : '#374151', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                                                {product.status === 'active' ? 'نشط' : 'مخفي'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <Link href={`/dashboard/products/${product.id}/edit`} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E0D6C8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6058' }}>
                                                    <Edit size={14} />
                                                </Link>
                                                <button onClick={() => setItemToDelete(product.id)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #FEE2E2', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Trash2 size={14} color="#B91C1C" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Mobile Cards (hidden on desktop) ── */}
            <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#A09080' }}>
                        <Package size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                        لا توجد منتجات مطابقة
                    </div>
                ) : filtered.map(product => {
                    const stockBadge = getStockBadge(product.stock)
                    return (
                        <div key={product.id} className="mobile-card">
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                {/* Product image */}
                                <div style={{ width: 64, height: 64, borderRadius: 12, background: '#F5F0E8', border: '1px solid #E8E0D5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                    {product.image_url
                                        ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                        : <Package size={28} color="#C6A75E" />
                                    }
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                                    <div style={{ fontSize: 12, color: '#A09080', marginTop: 2 }}>{product.category}</div>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                                        <span style={{ fontWeight: 800, fontSize: 15, color: '#222' }}>{product.price?.toFixed(2)} <span style={{ fontSize: 11, fontWeight: 600, color: '#6B6058' }}>د.أ</span></span>
                                        <span style={{ background: stockBadge.bg, color: stockBadge.color, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                                            {stockBadge.label}
                                        </span>
                                        <span style={{ background: product.status === 'active' ? '#D1FAE5' : '#F3F4F6', color: product.status === 'active' ? '#065F46' : '#374151', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                                            {product.status === 'active' ? 'نشط' : 'مخفي'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid #F0EBE3' }}>
                                <Link
                                    href={`/dashboard/products/${product.id}/edit`}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, background: '#F5F0E8', border: '1px solid #E0D6C8', color: '#222', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}
                                >
                                    <Edit size={14} />
                                    تعديل
                                </Link>
                                <button
                                    onClick={() => setItemToDelete(product.id)}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#B91C1C', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                                >
                                    <Trash2 size={14} />
                                    حذف
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── FAB: floating Add button (mobile only) ── */}
            {canAddProduct ? (
                <Link href="/dashboard/products/new" className="fab" title="إضافة منتج">
                    <Plus size={26} />
                </Link>
            ) : (
                <div className="fab" style={{ background: '#A09080', cursor: 'not-allowed' }} title="وصلت للحد الأقصى">
                    <Plus size={26} />
                </div>
            )}

            {/* Delete confirmation modal */}
            {itemToDelete && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <AlertTriangle size={24} color="#B91C1C" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 6 }}>تأكيد الحذف</h3>
                                <p style={{ fontSize: 14, color: '#6B6058', lineHeight: 1.6 }}>هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button onClick={() => setItemToDelete(null)} className="btn btn-ghost" style={{ flex: 1, border: '1px solid #E0D6C8' }}>إلغاء</button>
                            <button
                                onClick={() => { handleDelete(itemToDelete); setItemToDelete(null) }}
                                className="btn btn-danger"
                                style={{ flex: 1 }}
                            >
                                نعم، احذف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
