'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Plus,
    Search,
    Filter,
    Package,
    Edit,
    Trash2,
    Eye,
    MoreVertical,
    AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

function getStockBadge(stock: number) {
    if (stock === 0) return { label: 'نفد المخزون', bg: '#FEE2E2', color: '#EF4444' }
    if (stock <= 3) return { label: `${stock} فقط`, bg: '#FEF3C7', color: '#F59E0B' }
    return { label: `${stock}`, bg: '#D1FAE5', color: '#065F46' }
}

import { createClient } from '@/lib/supabase/client'

export default function ProductsPage() {
    const supabase = createClient()
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('الكل')
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>(['الكل'])
    const [loading, setLoading] = useState(true)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Get stores first to filter products by store
                const { data: stores } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('user_id', user.id)

                if (!stores || stores.length === 0) {
                    setLoading(false)
                    return
                }

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

                    // Extract unique categories
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
            // Refresh products list by removing the deleted one
            setProducts(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            console.error('Error deleting product:', err)
            toast.error('حدث خطأ أثناء حذف المنتج')
        }
    }

    const filtered = products.filter((p) => {
        const matchesCat = activeCategory === 'الكل' || p.category === activeCategory
        const matchesSearch =
            p.name.includes(search) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
        return matchesCat && matchesSearch
    })

    if (loading) return (
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">المنتجات</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        {products.length} منتج في متجرك
                    </p>
                </div>
                <Link href="/dashboard/products/new" className="btn btn-primary">
                    <Plus size={16} />
                    إضافة منتج
                </Link>
            </div>

            {/* Filters Row */}
            <div
                style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 24,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                    <Search
                        size={16}
                        color="var(--text-muted)"
                        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                    />
                    <input
                        type="text"
                        className="form-control"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث باسم المنتج أو الكود..."
                        style={{ paddingRight: 42 }}
                    />
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '7px 16px',
                                borderRadius: 100,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: '1.5px solid',
                                transition: 'all 0.2s ease',
                                background: activeCategory === cat ? 'var(--primary)' : 'transparent',
                                borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border)',
                                color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)', gap: 6 }}>
                    <Filter size={15} />
                    تصفية
                </button>
            </div>

            {/* Products Table */}
            <div className="card">
                {filtered.length === 0 ? (
                    <div style={{ padding: 80, textAlign: 'center' }}>
                        <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>لا توجد منتجات</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
                            جرّب البحث بكلمة مختلفة أو{' '}
                            <Link href="/dashboard/products/new" style={{ color: 'var(--primary)' }}>
                                أضف منتجاً جديداً
                            </Link>
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'right', padding: '14px 20px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>المنتج</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>الكود</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>السعر</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>المخزون</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>المبيعات</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>الحالة</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((product) => {
                                const stockBadge = getStockBadge(product.stock)
                                return (
                                    <tr key={product.id} style={{ borderTop: '1px solid var(--border)' }}>
                                        {/* Product info */}
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div
                                                    className="product-img"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Package size={22} color="var(--text-muted)" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                                                        {product.name}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                        {product.category}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                                            {product.sku}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14 }}>
                                            {product.price.toFixed(2)} د.أ
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {product.stock <= 3 && product.stock > 0 && (
                                                    <AlertTriangle size={14} color="#F59E0B" />
                                                )}
                                                <span
                                                    style={{
                                                        background: stockBadge.bg,
                                                        color: stockBadge.color,
                                                        padding: '3px 10px',
                                                        borderRadius: 100,
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {stockBadge.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                                            {product.sales} مبيعة
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span
                                                className={`badge ${product.status === 'active' ? 'badge-success' : 'badge-gray'}`}
                                            >
                                                {product.status === 'active' ? 'نشط' : 'مخفي'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    title="معاينة"
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 8,
                                                        border: '1px solid var(--border)',
                                                        background: 'transparent',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Eye size={14} color="var(--text-secondary)" />
                                                </button>
                                                <Link
                                                    href={`/dashboard/products/${product.id}/edit`}
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 8,
                                                        border: '1px solid var(--border)',
                                                        background: 'transparent',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Edit size={14} color="var(--text-secondary)" />
                                                </Link>
                                                <button
                                                    onClick={() => setItemToDelete(product.id)}
                                                    title="حذف"
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 8,
                                                        border: '1px solid #FEE2E2',
                                                        background: 'transparent',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Trash2 size={14} color="#EF4444" />
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

            {/* Custom Delete Confirmation Modal */}
            {itemToDelete && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24, margin: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <AlertTriangle size={24} color="#EF4444" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>تأكيد الحذف</h3>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>هل أنت متأكد من حذف هذا المنتج نهائياً؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذفه من متجرك.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button onClick={() => setItemToDelete(null)} className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }}>إلغاء</button>
                            <button
                                onClick={() => {
                                    handleDelete(itemToDelete);
                                    setItemToDelete(null);
                                }}
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
