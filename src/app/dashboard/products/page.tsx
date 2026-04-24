'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'

function getStockBadge(stock: number, t: any, lang: string) {
    if (stock === 0) return { label: t.store.outOfStock || 'Out of Stock', bg: 'bg-error-container', color: 'text-on-error-container', icon: 'error' }
    if (stock <= 3) return { label: `${stock} ${lang === 'ar' ? 'فقط' : 'only'}`, bg: 'bg-primary-container', color: 'text-on-primary-container', icon: 'warning' }
    return { label: `${stock}`, bg: 'bg-secondary-container', color: 'text-on-secondary-container', icon: 'inventory' }
}

export default function ProductsPage() {
    const supabase = createClient()
    const { t, lang, dir } = useLanguage()
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState(t.common.all || 'All')
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>([t.common.all || 'All'])
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
                        name: lang === 'ar' ? p.name_ar : (p.name_en || p.name_ar),
                        category: lang === 'ar'
                            ? (p.categories?.name_ar || t.products.uncategorized || 'Uncategorized')
                            : (p.categories?.name_en || p.categories?.name_ar || t.products.uncategorized || 'Uncategorized'),
                        status: p.is_active ? 'active' : 'inactive',
                        sales: p.sold_count || 0,
                    })))
                    setCanAddProduct(maxLimit === null || productsData.length < maxLimit)
                    const cats = Array.from(new Set(productsData.map(p =>
                        lang === 'ar' ? p.categories?.name_ar : (p.categories?.name_en || p.categories?.name_ar)
                    ).filter(Boolean))) as string[]
                    setCategories([t.common.all || 'All', ...cats])
                }
            } catch (err) {
                console.error('Error fetching products:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [supabase, lang, t])

    async function handleDelete(id: string) {
        try {
            const { error } = await supabase.from('products').delete().eq('id', id)
            if (error) throw error
            toast.success(t.success.deleted || 'Deleted successfully')
            setProducts(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            toast.error(t.errors.deleteFailed || 'Failed to delete')
        }
    }

    const filtered = products.filter(p => {
        const matchesCat = activeCategory === (t.common.all || 'All') || p.category === activeCategory
        const matchesSearch = p.name.includes(search) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
        return matchesCat && matchesSearch
    })

    if (loading) return (
        <div className="flex-1 p-4 lg:p-8 space-y-6">
            <div className="h-32 rounded-2xl bg-surface-container-highest animate-pulse"></div>
            <div className="h-64 rounded-2xl bg-surface-container animate-pulse"></div>
        </div>
    )

    return (
        <div dir={dir} className="p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-h1">{t.products.title || 'Product Catalog'}</h1>
                    <p className="text-on-surface-variant mt-1 font-manrope">
                        {products.length} {t.products.productsCount || 'Products'}
                        {maxProducts !== null && <span className={canAddProduct ? 'text-on-surface-variant' : 'text-error font-bold'}> / {maxProducts}</span>}
                    </p>
                </div>
                
                {canAddProduct ? (
                    <Link href="/dashboard/products/new" className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full shadow-md hover:bg-surface-tint hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold active:scale-95 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        {t.products.addProduct || 'New Product'}
                    </Link>
                ) : (
                    <button className="flex items-center gap-2 bg-surface-variant text-on-surface-variant px-6 py-2.5 rounded-full font-semibold cursor-not-allowed">
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                        {t.products.upgradePlan || 'Upgrade Plan'}
                    </button>
                )}
            </div>

            {/* Main List Card */}
            <div className="bg-surface-container-lowest rounded-[2rem] border border-surface-variant shadow-sm overflow-hidden flex flex-col">
                
                {/* Search & Filters */}
                <div className="p-6 border-b border-surface-variant space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
                    <div className="relative w-full md:max-w-md">
                        <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2 left-4 rtl:left-auto rtl:right-4 text-on-surface-variant">search</span>
                        <input 
                            type="search" 
                            placeholder={t.products.searchPlaceholder || 'Search catalogs, tags...'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-surface-container-low border hover:border-outline focus:border-primary border-outline-variant rounded-full py-2.5 pl-11 pr-4 rtl:pl-4 rtl:pr-11 text-sm text-on-surface outline-none transition-colors"
                        />
                    </div>
                    
                    {/* Filter categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold border whitespace-nowrap transition-colors ${
                                    activeCategory === cat
                                    ? 'bg-secondary-container text-on-secondary-container border-secondary-container shadow-sm'
                                    : 'bg-transparent text-on-surface-variant border-outline-variant hover:bg-surface-variant/50 hover:text-on-surface'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-surface-container-low/50">
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Product Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Pricing</th>
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Inventory</th>
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Sales</th>
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-variant">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-on-surface-variant">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-surface-variant rounded-full flex items-center justify-center mb-4 text-primary">
                                                <span className="material-symbols-outlined text-[32px]">inventory_2</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-on-surface">{t.products.noProducts || 'No products found'}</h3>
                                            <p className="text-sm mt-1 mb-4">{t.products.addFirstProduct || 'Add your first product to get started.'}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map(product => {
                                const badge = getStockBadge(product.stock, t, lang)
                                return (
                                    <tr key={product.id} className="hover:bg-surface-container-low/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-surface-variant border border-outline-variant overflow-hidden flex items-center justify-center shrink-0">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-outline">image</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-on-surface text-sm max-w-[200px] truncate" title={product.name}>{product.name}</div>
                                                    <div className="text-xs text-on-surface-variant mt-0.5">{product.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-on-surface-variant bg-surface-variant/50 px-2 py-1 rounded">
                                                {product.sku || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-baseline gap-1" dir="ltr">
                                                <span className="font-extrabold text-on-surface">{product.price?.toFixed(2)}</span>
                                                <span className="text-xs font-semibold text-on-surface-variant">JOD</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${badge.bg} ${badge.color}`}>
                                                <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-on-surface">{product.sales}</span>
                                            <span className="text-xs text-on-surface-variant ml-1">sold</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link 
                                                    href={`/dashboard/products/${product.id}/edit`}
                                                    className="w-8 h-8 rounded-full bg-surface-variant hover:bg-secondary-container text-on-surface-variant hover:text-on-secondary-container flex items-center justify-center transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </Link>
                                                <button 
                                                    onClick={() => setItemToDelete(product.id)}
                                                    className="w-8 h-8 rounded-full bg-surface-variant hover:bg-error-container text-on-surface-variant hover:text-on-error-container flex items-center justify-center transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (placeholder) */}
                {filtered.length > 0 && (
                    <div className="p-4 border-t border-surface-variant flex items-center justify-between text-sm text-on-surface-variant">
                        <span>Showing <span className="font-bold text-on-surface">{filtered.length}</span> results</span>
                    </div>
                )}
            </div>

            {/* Custom Delete Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 bg-on-background/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[24px]">warning</span>
                        </div>
                        <h3 className="text-xl font-bold text-on-surface mb-2">{t.common.confirm || 'Are you sure?'}</h3>
                        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                            {t.coupons?.deleteWarning || 'This action cannot be undone. This product will be permanently deleted from your store.'}
                        </p>
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => setItemToDelete(null)}
                                className="flex-1 bg-surface-variant hover:bg-surface-container-high text-on-surface-variant font-semibold py-2.5 rounded-full transition-colors"
                            >
                                {t.common.cancel || 'Cancel'}
                            </button>
                            <button 
                                onClick={() => { handleDelete(itemToDelete); setItemToDelete(null) }}
                                className="flex-1 bg-error hover:bg-error/90 text-on-error font-semibold py-2.5 rounded-full shadow-sm hover:shadow transition-all"
                            >
                                {t.common.delete || 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
