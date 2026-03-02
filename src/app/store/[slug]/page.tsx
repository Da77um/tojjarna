'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { use } from 'react'
import Link from 'next/link'
import { ShoppingCart, Star, Search, ChevronLeft } from 'lucide-react'

export default function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
    const unwrappedParams = use(params)
    const slug = unwrappedParams.slug
    const supabase = createClient()

    const [store, setStore] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<string[]>(['الكل'])

    useEffect(() => {
        async function fetchStoreData() {
            try {
                // Fetch store
                const { data: storeData } = await supabase
                    .from('stores')
                    .select('*')
                    .eq('slug', slug)
                    .single()

                if (storeData) {
                    setStore(storeData)

                    // Fetch products
                    const { data: productsData } = await supabase
                        .from('products')
                        .select('*, categories(name_ar)')
                        .eq('store_id', storeData.id)
                        .eq('is_active', true)

                    if (productsData) {
                        setProducts(productsData.map(p => ({
                            id: p.id,
                            name: p.name_ar,
                            price: p.price,
                            comparePrice: p.compare_price,
                            rating: 4.8, // Mocked for now
                            reviews: 12, // Mocked for now
                            stock: p.stock,
                            image: p.images?.[0] || null,
                            tag: p.is_featured ? 'مميز' : null,
                            category: p.categories?.name_ar || 'عام'
                        })))

                        const cats = Array.from(new Set(productsData.map(p => p.categories?.name_ar).filter(Boolean))) as string[]
                        setCategories(['الكل', ...cats])
                    }
                }
            } catch (err) {
                console.error('Error fetching storefront data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStoreData()
    }, [supabase, slug])

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
            <div className="spinner" />
        </div>
    )

    if (!store) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
            <h1 style={{ fontSize: 60 }}>🏷️</h1>
            <h2 style={{ marginTop: 20 }}>المتجر غير موجود</h2>
            <Link href="/" style={{ marginTop: 20, color: '#6C3CE1', fontWeight: 700 }}>العودة للرئيسية</Link>
        </div>
    )

    // Default theme colors if not set
    const primaryColor = store.theme?.primaryColor || '#6C3CE1'

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Tajawal, Inter, sans-serif' }}>
            {/* Store Header */}
            <header style={{ background: store.primaryColor, color: 'white' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
                    {/* Top bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 13 }}>
                        <span>🚚 شحن مجاني للطلبات فوق 50 د.أ</span>
                        <span>📞 للاستفسار: 0791234567</span>
                    </div>
                    {/* Main nav */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20 }}>
                                م
                            </div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: 18 }}>{store.name}</div>
                                <div style={{ fontSize: 12, opacity: 0.7 }}>متجر إلكتروني معتمد</div>
                            </div>
                        </div>
                        {/* Search */}
                        <div style={{ position: 'relative', width: 340 }}>
                            <Search size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                            <input
                                placeholder="ابحث في المتجر..."
                                style={{ width: '100%', padding: '10px 40px 10px 16px', borderRadius: 10, border: 'none', fontSize: 14, background: 'rgba(255,255,255,0.15)', color: 'white', outline: 'none', fontFamily: 'inherit' }}
                            />
                        </div>
                        {/* Cart */}
                        <Link href={`/store/${slug}/cart`} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 16px', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
                            <ShoppingCart size={18} />
                            السلة
                            <span style={{ position: 'absolute', top: -8, left: -8, background: '#F59E0B', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>2</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Categories */}
            <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 4, overflowX: 'auto' }}>
                    {categories.map((cat, i) => (
                        <button
                            key={cat}
                            style={{
                                padding: '14px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
                                fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'inherit',
                                color: i === 0 ? store.primaryColor : '#6B7280',
                                borderBottom: i === 0 ? `3px solid ${store.primaryColor}` : '3px solid transparent',
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
                {/* Banner */}
                <div style={{
                    background: `linear-gradient(135deg, ${store.primaryColor}, #8B5CF6)`,
                    borderRadius: 20, padding: '40px 48px', color: 'white', marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 10 }}>✨ عروض الموسم</div>
                        <h2 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.3, marginBottom: 16 }}>
                            أحدث الأزياء<br />بأسعار تنافسية
                        </h2>
                        <Link
                            href={`/store/${slug}/products`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: store.primaryColor, borderRadius: 10, padding: '10px 24px', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}
                        >
                            تسوق الآن <ChevronLeft size={16} />
                        </Link>
                    </div>
                    <div style={{ fontSize: 100 }}>👗</div>
                </div>

                {/* Products Grid */}
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 20, fontWeight: 900 }}>منتجاتنا</h2>
                    <span style={{ color: '#6B7280', fontSize: 14 }}>{products.length} منتج</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/store/${slug}/products/${product.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', transition: 'all 0.2s ease', cursor: 'pointer' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.transform = '' }}
                            >
                                {/* Product Image */}
                                <div style={{ height: 200, background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <span style={{ fontSize: 60 }}>🛍️</span>
                                    {product.tag && (
                                        <div style={{ position: 'absolute', top: 12, right: 12, background: store.primaryColor, color: 'white', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                                            {product.tag}
                                        </div>
                                    )}
                                    {product.stock <= 3 && (
                                        <div style={{ position: 'absolute', top: 12, left: 12, background: '#FEF3C7', color: '#92400E', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>
                                            {product.stock === 0 ? 'نفد' : `${product.stock} فقط`}
                                        </div>
                                    )}
                                </div>
                                {/* Info */}
                                <div style={{ padding: '16px 16px 20px' }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#111827' }}>{product.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                                        <Star size={12} fill="#F59E0B" stroke="none" />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{product.rating}</span>
                                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>({product.reviews})</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <span style={{ color: store.primaryColor, fontWeight: 900, fontSize: 17 }}>{product.price.toFixed(2)}</span>
                                            <span style={{ color: store.primaryColor, fontSize: 12, fontWeight: 600, marginRight: 2 }}> د.أ</span>
                                            {product.comparePrice && (
                                                <div style={{ color: '#9CA3AF', fontSize: 12, textDecoration: 'line-through' }}>{product.comparePrice.toFixed(2)} د.أ</div>
                                            )}
                                        </div>
                                        <button
                                            style={{
                                                background: store.primaryColor, color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px',
                                                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                                opacity: product.stock === 0 ? 0.5 : 1,
                                            }}
                                            disabled={product.stock === 0}
                                        >
                                            {product.stock === 0 ? 'نفد' : '+ السلة'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer style={{ background: '#1F2937', color: 'white', marginTop: 60 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40 }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 12 }}>{store.name}</div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.8 }}>{store.description}</p>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 14 }}>روابط سريعة</div>
                        {['الرئيسية', 'المنتجات', 'تتبع طلبك', 'اتصل بنا'].map((l) => (
                            <div key={l} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 10, cursor: 'pointer' }}>{l}</div>
                        ))}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 14 }}>معلومات</div>
                        {['سياسة الخصوصية', 'شروط الاستخدام', 'سياسة الإرجاع'].map((l) => (
                            <div key={l} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 10, cursor: 'pointer' }}>{l}</div>
                        ))}
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', padding: '16px 20px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                    © 2025 {store.name} — مدعوم بمنصة مزيدي
                </div>
            </footer>
        </div>
    )
}
