'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, Heart, Star, ChevronRight, Minus, Plus, ArrowRight } from 'lucide-react'

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = use(params)
    const supabase = createClient()

    const [store, setStore] = useState<any>(null)
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [qty, setQty] = useState(1)
    const [activeImg, setActiveImg] = useState(0)
    const [wished, setWished] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: storeData } = await supabase.from('stores').select('*').eq('slug', slug).single()
                if (!storeData) { setLoading(false); return }
                setStore(storeData)

                const { data: productData } = await supabase
                    .from('products')
                    .select('*, categories(name_ar)')
                    .eq('id', id)
                    .eq('store_id', storeData.id)
                    .single()

                if (productData) setProduct(productData)
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        fetchData()
    }, [supabase, slug, id])

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
            <div className="spinner" />
        </div>
    )

    if (!store || !product) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h2 style={{ color: '#111827', marginBottom: 12 }}>المنتج غير موجود</h2>
            <Link href={`/store/${slug}`} style={{ color: '#6C3CE1', fontWeight: 700, textDecoration: 'none' }}>العودة للمتجر</Link>
        </div>
    )

    const themeGlobal = store.theme?.global || {}
    const primary = themeGlobal.primary_color || store.theme?.primaryColor || '#6C3CE1'
    const radius = themeGlobal.border_radius ?? 12
    const images: string[] = product.images || []
    const discount = product.compare_price && product.compare_price > product.price
        ? Math.round((1 - product.price / product.compare_price) * 100)
        : 0

    const handleAddToCart = () => {
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: 'IBM Plex Sans Arabic, Inter, sans-serif', direction: 'rtl' }}>

            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                    <Link href={`/store/${slug}`} style={{ fontWeight: 900, fontSize: 20, color: primary, textDecoration: 'none' }}>{store.name_ar || store.name}</Link>
                    <Link href={`/store/${slug}/cart`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: primary, color: 'white', borderRadius: radius, padding: '8px 18px', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                        <ShoppingCart size={16} /> السلة
                    </Link>
                </div>
            </header>

            {/* Breadcrumb */}
            <div style={{ background: 'white', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                    <Link href={`/store/${slug}`} style={{ color: primary, fontWeight: 600, textDecoration: 'none' }}>المتجر</Link>
                    <ChevronRight size={14} />
                    {product.categories?.name_ar && (
                        <>
                            <span>{product.categories.name_ar}</span>
                            <ChevronRight size={14} />
                        </>
                    )}
                    <span style={{ color: '#374151', fontWeight: 600 }}>{product.name_ar}</span>
                </div>
            </div>

            <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '36px 20px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52, alignItems: 'start' }}>

                    {/* ─── Images ────────────────────────────────────────────────── */}
                    <div>
                        <div style={{
                            height: 440, borderRadius: radius + 4, overflow: 'hidden',
                            background: images[activeImg]
                                ? `url(${images[activeImg]}) center/contain no-repeat white`
                                : `linear-gradient(135deg, ${primary}15, ${primary}30)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 12, border: '1px solid #E5E7EB', position: 'relative',
                        }}>
                            {!images[activeImg] && <span style={{ fontSize: 96 }}>🛍️</span>}
                            {discount > 0 && (
                                <div style={{ position: 'absolute', top: 16, right: 16, background: '#EF4444', color: 'white', borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontSize: 13 }}>
                                    -{discount}%
                                </div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {images.map((img, i) => (
                                    <div key={i} onClick={() => setActiveImg(i)} style={{
                                        width: 76, height: 76, borderRadius: radius, border: `2.5px solid ${activeImg === i ? primary : '#E5E7EB'}`,
                                        background: `url(${img}) center/cover`, cursor: 'pointer', transition: 'border-color 0.15s',
                                    }} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ─── Info ──────────────────────────────────────────────────── */}
                    <div>
                        {/* Title + wishlist */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', lineHeight: 1.35, flex: 1, marginLeft: 12 }}>{product.name_ar}</h1>
                            <button onClick={() => setWished(!wished)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, transition: 'background 0.15s' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEE2E2'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                                <Heart size={24} fill={wished ? '#EF4444' : 'none'} stroke={wished ? '#EF4444' : '#9CA3AF'} />
                            </button>
                        </div>

                        {/* Category tag */}
                        {product.categories?.name_ar && (
                            <span style={{ display: 'inline-block', background: `${primary}15`, color: primary, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginBottom: 16 }}>
                                {product.categories.name_ar}
                            </span>
                        )}

                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
                            <span style={{ fontSize: 38, fontWeight: 900, color: primary }}>{Number(product.price).toFixed(3)}</span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: primary }}>د.أ</span>
                            {product.compare_price && (
                                <span style={{ fontSize: 18, color: '#9CA3AF', textDecoration: 'line-through' }}>{Number(product.compare_price).toFixed(3)} د.أ</span>
                            )}
                            {discount > 0 && (
                                <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                                    وفّر {(product.compare_price - product.price).toFixed(3)} د.أ
                                </span>
                            )}
                        </div>

                        {/* Stock badge */}
                        <div style={{ marginBottom: 20 }}>
                            {product.stock === 0 ? (
                                <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 8 }}>نفد المخزون</span>
                            ) : product.stock <= 5 ? (
                                <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 8 }}>
                                    {product.stock} قطعة متبقية فقط!
                                </span>
                            ) : (
                                <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 8 }}>✓ متوفر في المخزون</span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description_ar && (
                            <div style={{ background: '#F9FAFB', borderRadius: radius, padding: '16px 18px', fontSize: 14, color: '#4B5563', lineHeight: 1.85, marginBottom: 24, border: '1px solid #F3F4F6' }}>
                                {product.description_ar}
                            </div>
                        )}

                        {/* Qty + Add to cart */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: radius, overflow: 'hidden', background: 'white' }}>
                                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 44, height: 48, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6B7280' }}>−</button>
                                <span style={{ width: 44, textAlign: 'center', fontWeight: 800, fontSize: 17 }}>{qty}</span>
                                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} style={{ width: 44, height: 48, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6B7280' }}>+</button>
                            </div>
                            <button onClick={handleAddToCart} disabled={product.stock === 0}
                                style={{ flex: 1, background: addedToCart ? '#10B981' : product.stock === 0 ? '#E5E7EB' : primary, color: product.stock === 0 ? '#9CA3AF' : 'white', border: 'none', borderRadius: radius, padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: product.stock === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', transition: 'background 0.2s' }}>
                                {addedToCart ? '✓ تمت الإضافة!' : <><ShoppingCart size={18} /> أضف إلى السلة — {(Number(product.price) * qty).toFixed(3)} د.أ</>}
                            </button>
                        </div>

                        {/* Trust chips */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {['🚚 شحن سريع', '↩️ إرجاع مجاني', '✅ منتج أصلي'].map(t => (
                                <span key={t} style={{ fontSize: 12, background: '#F3F4F6', padding: '5px 14px', borderRadius: 100, color: '#374151', fontWeight: 500 }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Back to store */}
                <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #E5E7EB' }}>
                    <Link href={`/store/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: primary, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                        <ArrowRight size={16} /> العودة إلى المتجر
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ background: '#111827', color: 'white', marginTop: 'auto' }}>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', padding: '16px 20px', color: 'rgba(255,255,255,0.35)', fontSize: 13, display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <span>© {new Date().getFullYear()} {store.name_ar || store.name} — جميع الحقوق محفوظة</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                    <span>لـ منصة <span style={{ color: '#6C3CE1', fontWeight: 700 }}>تجارنا</span></span>
                </div>
            </footer>
        </div>
    )
}
