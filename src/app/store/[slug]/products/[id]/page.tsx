'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, Heart, Star, ChevronRight, ChevronLeft, Minus, Plus, ArrowRight, ArrowLeft, MessageCircle, Phone, Truck, Shield, RotateCcw } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = use(params)
    const supabase = createClient()
    const { t, lang, dir } = useLanguage()

    const [store, setStore] = useState<any>(null)
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [qty, setQty] = useState(1)
    const [activeImg, setActiveImg] = useState(0)
    const [wished, setWished] = useState(false)
    const [addedToCart, setAddedToCart] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontFamily: 'Tajawal, sans-serif' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h2 style={{ color: '#111827', marginBottom: 12 }}>{t.storefront.productNotFound}</h2>
            <Link href={`/store/${slug}`} style={{ color: '#6C3CE1', fontWeight: 700, textDecoration: 'none' }}>{t.storefront.backToStore}</Link>
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

    const handleWhatsAppOrder = () => {
        const storeWhatsApp = store.whatsapp || '+962791234567'
        const productName = dir === 'rtl' ? product.name_ar : product.name_en || product.name_ar
        const message = lang === 'ar' 
            ? `مرحباً! أريد طلب:\n\n🛍️ ${productName}\n💰 السعر: ${Number(product.price).toFixed(3)} ${t.common.currency}\n📦 الكمية: ${qty}\n\nأرجو تأكيد الطلب.`
            : `Hello! I want to order:\n\n🛍️ ${productName}\n💰 Price: ${Number(product.price).toFixed(3)} ${t.common.currency}\n📦 Quantity: ${qty}\n\nPlease confirm the order.`
        const whatsappUrl = `https://wa.me/${storeWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    const productName = dir === 'rtl' ? product.name_ar : product.name_en || product.name_ar

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: 'Tajawal, Inter, sans-serif', direction: dir as 'rtl' | 'ltr' }}>

            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                    <Link href={`/store/${slug}`} style={{ fontWeight: 900, fontSize: 20, color: primary, textDecoration: 'none' }}>{store.name_ar || store.name}</Link>
                    <Link href={`/store/${slug}/cart`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: primary, color: 'white', borderRadius: radius, padding: '8px 18px', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                        <ShoppingCart size={16} /> {t.storefront.cart}
                    </Link>
                </div>
            </header>

            {/* Breadcrumb */}
            <div style={{ background: 'white', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                    <Link href={`/store/${slug}`} style={{ color: primary, fontWeight: 600, textDecoration: 'none' }}>{t.storefront.store}</Link>
                    {dir === 'rtl' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    {(dir === 'rtl' ? product.categories?.name_ar : product.categories?.name_en || product.categories?.name_ar) && (
                        <>
                            <span>{dir === 'rtl' ? product.categories.name_ar : product.categories.name_en || product.categories.name_ar}</span>
                            {dir === 'rtl' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        </>
                    )}
                    <span style={{ color: '#374151', fontWeight: 600 }}>{productName}</span>
                </div>
            </div>

            <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: isMobile ? '20px 16px' : '36px 20px', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 24 : 52, alignItems: 'start' }}>

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
                                <div style={{ position: 'absolute', top: 16, [dir === 'rtl' ? 'right' : 'left']: 16, background: '#EF4444', color: 'white', borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontSize: 13 }}>
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
                            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', lineHeight: 1.35, flex: 1, [dir === 'rtl' ? 'marginLeft' : 'marginRight']: 12 }}>{productName}</h1>
                            <button onClick={() => setWished(!wished)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, transition: 'background 0.15s' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEE2E2'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                                <Heart size={24} fill={wished ? '#EF4444' : 'none'} stroke={wished ? '#EF4444' : '#9CA3AF'} />
                            </button>
                        </div>

                        {/* Category tag */}
                        {(dir === 'rtl' ? product.categories?.name_ar : product.categories?.name_en || product.categories?.name_ar) && (
                            <span style={{ display: 'inline-block', background: `${primary}15`, color: primary, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, marginBottom: 16 }}>
                                {dir === 'rtl' ? product.categories.name_ar : product.categories.name_en || product.categories.name_ar}
                            </span>
                        )}

                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
                            <span style={{ fontSize: 38, fontWeight: 900, color: primary }}>{Number(product.price).toFixed(3)}</span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: primary }}>{t.common.currency}</span>
                            {product.compare_price && (
                                <span style={{ fontSize: 18, color: '#9CA3AF', textDecoration: 'line-through' }}>{Number(product.compare_price).toFixed(3)} {t.common.currency}</span>
                            )}
                            {discount > 0 && (
                                <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                                    {t.storefront.saveAmount.replace('{amount}', (product.compare_price - product.price).toFixed(3)).replace('{currency}', t.common.currency)}
                                </span>
                            )}
                        </div>

                        {/* Stock badge */}
                        <div style={{ marginBottom: 20 }}>
                            {product.stock === 0 ? (
                                <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 8 }}>{t.storefront.outOfStock}</span>
                            ) : product.stock <= 5 ? (
                                <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 8 }}>
                                    {t.storefront.onlyPiecesLeft.replace('{stock}', product.stock)}
                                </span>
                            ) : (
                                <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: 13, fontWeight: 700, padding: '5px 14px', borderRadius: 8 }}>{t.storefront.inStock}</span>
                            )}
                        </div>

                        {/* Description */}
                        {(dir === 'rtl' ? product.description_ar : product.description_en || product.description_ar) && (
                            <div style={{ background: '#F9FAFB', borderRadius: radius, padding: '16px 18px', fontSize: 14, color: '#4B5563', lineHeight: 1.85, marginBottom: 24, border: '1px solid #F3F4F6' }}>
                                {dir === 'rtl' ? product.description_ar : product.description_en || product.description_ar}
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
                                {addedToCart ? t.storefront.addedToCart : <><ShoppingCart size={18} /> {t.storefront.addToCartLong} — {(Number(product.price) * qty).toFixed(3)} {t.common.currency}</>}
                            </button>
                        </div>

                        {/* WhatsApp Order Button */}
                        <button 
                            onClick={handleWhatsAppOrder}
                            style={{ 
                                width: '100%', 
                                background: '#25D366', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: radius, 
                                padding: '14px 24px', 
                                fontSize: 15, 
                                fontWeight: 700, 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: 10, 
                                fontFamily: 'inherit',
                                marginBottom: 20,
                                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                            }}
                        >
                            <MessageCircle size={20} />
                            {lang === 'ar' ? 'اطلب عبر واتساب' : 'Order via WhatsApp'}
                        </button>

                        {/* Trust chips */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {[
                                { icon: Truck, label: lang === 'ar' ? 'توصيل سريع' : 'Fast Shipping' },
                                { icon: RotateCcw, label: lang === 'ar' ? 'إرجاع مجاني' : 'Free Return' },
                                { icon: Shield, label: lang === 'ar' ? 'منتج أصلي' : 'Authentic' },
                            ].map(({ icon: Icon, label }) => (
                                <span key={label} style={{ fontSize: 12, background: '#F3F4F6', padding: '5px 14px', borderRadius: 100, color: '#374151', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Icon size={12} /> {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Back to store */}
                <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #E5E7EB' }}>
                    <Link href={`/store/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: primary, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                        {dir === 'rtl' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {t.storefront.backToStore}
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ background: '#111827', color: 'white', marginTop: 'auto' }}>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', padding: '16px 20px', color: 'rgba(255,255,255,0.35)', fontSize: 13, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', direction: dir as 'rtl' | 'ltr' }}>
                    <span>© {new Date().getFullYear()} {store.name_ar || store.name} — {t.storefront.allRightsReserved}</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                    <span style={{ display: 'flex', gap: 4 }}>{t.storefront.poweredBy} <span style={{ color: '#6C3CE1', fontWeight: 700 }}>Tojjarna</span></span>
                </div>
            </footer>
        </div>
    )
}
