'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { use } from 'react'
import Link from 'next/link'
import { ShoppingCart, Star, Search, Timer, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'

// ─── Theme types (must match theme editor) ────────────────────────────────────
interface ThemeSection {
    id: string
    type: string
    settings: Record<string, any>
}
interface ThemeGlobal {
    primary_color: string
    secondary_color: string
    font_family: string
    border_radius: number
    header_sticky: boolean
    show_announcement: boolean
    announcement_text_ar: string
    nav_links?: { label: string; url: string; type: 'builtin' | 'page' }[]
}
interface ThemeConfig {
    version?: number
    global?: Partial<ThemeGlobal>
    sections?: ThemeSection[]
    // Legacy keys:
    primaryColor?: string
    primary_color?: string
}

function extractConfig(theme: ThemeConfig | null): { primary: string; secondary: string; font: string; radius: number; global: Partial<ThemeGlobal>; sections: ThemeSection[] } {
    const g = theme?.global || {}
    return {
        primary: g.primary_color || theme?.primaryColor || theme?.primary_color || '#6C3CE1',
        secondary: g.secondary_color || '#F59E0B',
        font: g.font_family || 'Tajawal',
        radius: g.border_radius ?? 12,
        global: g,
        sections: theme?.sections || [],
    }
}

// ─── Section renderers ────────────────────────────────────────────────────────
function SectionRenderer({ section, primary, radius, products, slug }: {
    section: ThemeSection; primary: string; radius: number; products: any[]; slug: string
}) {
    const s = section.settings

    switch (section.type) {
        case 'hero_banner':
            return (
                <div style={{
                    minHeight: s.height || '420px',
                    background: s.image_url
                        ? `linear-gradient(rgba(0,0,0,${s.overlay_opacity ?? 0.4}),rgba(0,0,0,${s.overlay_opacity ?? 0.4})), url(${s.image_url}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${primary}, ${primary}cc)`,
                    display: 'flex', flexDirection: 'column', alignItems: s.text_align === 'right' ? 'flex-end' : s.text_align === 'left' ? 'flex-start' : 'center',
                    justifyContent: 'center', padding: '60px 48px', textAlign: s.text_align || 'center',
                }}>
                    <h1 style={{ color: s.text_color || '#fff', fontSize: 'clamp(24px,5vw,42px)', fontWeight: 900, marginBottom: 14, lineHeight: 1.3, textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                        {s.title_ar || 'مرحباً بك'}
                    </h1>
                    {s.subtitle_ar && <p style={{ color: `${s.text_color || '#fff'}cc`, fontSize: 17, marginBottom: 28, maxWidth: 560 }}>{s.subtitle_ar}</p>}
                    {s.cta_text_ar && (
                        <Link href={s.cta_url || `/store/${slug}/products`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: primary, borderRadius: radius, padding: '12px 32px', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                            {s.cta_text_ar} <ChevronLeft size={16} />
                        </Link>
                    )}
                </div>
            )

        case 'featured_products': {
            const cols = s.columns || 4
            const display = products.filter(p => !s.product_ids?.length || s.product_ids.includes(p.id)).slice(0, 8)
            return (
                <div style={{ padding: '56px 24px', maxWidth: 1200, margin: '0 auto' }}>
                    {s.title_ar && (
                        <div style={{ textAlign: 'center', marginBottom: 36 }}>
                            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#111827' }}>{s.title_ar}</h2>
                            <div style={{ width: 48, height: 4, background: primary, borderRadius: 2, margin: '12px auto 0' }} />
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)`, gap: 20 }}>
                        {(display.length ? display : Array.from({ length: 4 }, (_, i) => null)).map((product, i) => (
                            product ? (
                                <ProductCard key={product.id} product={product} primary={primary} radius={radius} slug={slug} />
                            ) : (
                                <PlaceholderCard key={i} primary={primary} radius={radius} />
                            )
                        ))}
                    </div>
                </div>
            )
        }

        case 'product_slider': {
            const display = products.slice(0, 8)
            return (
                <div style={{ padding: '48px 0' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827' }}>{s.title_ar || 'وصل حديثاً'}</h2>
                        {s.show_all_link && <Link href={`/store/${slug}/products`} style={{ color: primary, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>عرض الكل <ChevronLeft size={14} /></Link>}
                    </div>
                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '8px 24px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                        {(display.length ? display : Array.from({ length: 6 }, () => null)).map((product, i) =>
                            product ? (
                                <div key={product.id} style={{ minWidth: 200, flexShrink: 0 }}>
                                    <ProductCard product={product} primary={primary} radius={radius} slug={slug} compact />
                                </div>
                            ) : (
                                <div key={i} style={{ minWidth: 200, flexShrink: 0 }}>
                                    <PlaceholderCard primary={primary} radius={radius} compact />
                                </div>
                            )
                        )}
                    </div>
                </div>
            )
        }

        case 'countdown_timer':
            return <CountdownSection s={s} primary={primary} radius={radius} />

        case 'testimonials':
            return (
                <div style={{ padding: '56px 24px', background: '#F9FAFB' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        {s.title_ar && (
                            <div style={{ textAlign: 'center', marginBottom: 36 }}>
                                <h2 style={{ fontSize: 26, fontWeight: 900, color: '#111827' }}>{s.title_ar}</h2>
                                <div style={{ width: 48, height: 4, background: primary, borderRadius: 2, margin: '12px auto 0' }} />
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                            {(s.items?.length ? s.items : [
                                { name: 'أحمد محمد', text: 'منتجات ممتازة وتوصيل سريع، سعيد جداً بتجربتي!', stars: 5 },
                                { name: 'فاطمة سالم', text: 'خدمة عملاء رائعة وجودة عالية. أنصح الجميع!', stars: 5 },
                                { name: 'خالد العمري', text: 'أسعار تنافسية والمنتجات بالضبط كما هي في الصور', stars: 4 },
                            ]).map((t: any, i: number) => (
                                <div key={i} style={{ background: 'white', borderRadius: radius, padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div style={{ color: '#F59E0B', fontSize: 18, marginBottom: 12, letterSpacing: 2 }}>{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
                                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: primary }}>— {t.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )

        case 'rich_text':
            return (
                <div style={{ padding: '56px 24px', textAlign: s.text_align || 'center' }}>
                    <div style={{ maxWidth: 700, margin: '0 auto', fontSize: 16, color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                        {s.content_ar || ''}
                    </div>
                </div>
            )

        case 'collections_grid':
            return (
                <div style={{ padding: '56px 24px', maxWidth: 1200, margin: '0 auto' }}>
                    {s.title_ar && (
                        <div style={{ textAlign: 'center', marginBottom: 36 }}>
                            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#111827' }}>{s.title_ar}</h2>
                            <div style={{ width: 48, height: 4, background: primary, borderRadius: 2, margin: '12px auto 0' }} />
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${s.columns || 3}, 1fr)`, gap: 20 }}>
                        {(s.items?.length ? s.items : ['أزياء', 'إلكترونيات', 'أكسسوارات', 'منزل', 'طعام', 'رياضة'].slice(0, s.columns || 3)).map((item: any, i: number) => (
                            <div key={i} style={{
                                borderRadius: radius, overflow: 'hidden', aspectRatio: '1',
                                background: `linear-gradient(135deg, ${primary}25, ${primary}50)`,
                                display: 'flex', alignItems: 'flex-end', cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transition: 'transform 0.2s',
                            }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
                            >
                                <div style={{ width: '100%', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', padding: '16px 14px' }}>
                                    <div style={{ fontWeight: 800, color: 'white', fontSize: 15 }}>{typeof item === 'string' ? item : item.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'announcement_bar':
            return (
                <div style={{ background: s.background_color || primary, color: s.text_color || 'white', textAlign: 'center', padding: '11px 16px', fontSize: 14, fontWeight: 600 }}>
                    {s.text_ar || ''}
                </div>
            )

        case 'custom_html':
            return (
                <div
                    dangerouslySetInnerHTML={{ __html: `<style>${s.css || ''}</style>${s.html || ''}` }}
                    style={{ padding: '0' }}
                />
            )

        default:
            return null
    }
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, primary, radius, slug, compact }: any) {
    return (
        <Link href={`/store/${slug}/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
                background: 'white', borderRadius: 16,
                overflow: 'hidden', border: '1px solid #E8E0D5',
                boxShadow: '0 2px 12px rgba(34,34,34,0.06)',
                transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                cursor: 'pointer',
            }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 20px 56px rgba(34,34,34,0.13)';
                    el.style.transform = 'translateY(-6px)';
                    const img = el.querySelector('.prod-img-inner') as HTMLElement;
                    if (img) img.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 2px 12px rgba(34,34,34,0.06)';
                    el.style.transform = 'translateY(0)';
                    const img = el.querySelector('.prod-img-inner') as HTMLElement;
                    if (img) img.style.transform = 'scale(1)';
                }}
            >
                {/* Image Container */}
                <div style={{ height: compact ? 140 : 220, overflow: 'hidden', position: 'relative' }}>
                    <div className="prod-img-inner" style={{
                        width: '100%', height: '100%',
                        background: product.image ? `url(${product.image}) center/cover` : '#F5F0E8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                    }}>
                        {!product.image && <span style={{ fontSize: compact ? 36 : 56, opacity: 0.4 }}>🛍️</span>}
                    </div>
                    {/* Gold featured badge */}
                    {product.is_featured && (
                        <div style={{
                            position: 'absolute', top: 12, right: 12,
                            background: '#C6A75E', color: '#111111',
                            borderRadius: 6, padding: '4px 10px',
                            fontSize: 11, fontWeight: 900, letterSpacing: '0.04em',
                        }}>حصري</div>
                    )}
                    {/* Discount badge */}
                    {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                        <div style={{
                            position: 'absolute', top: product.is_featured ? 44 : 12, right: 12,
                            background: '#222222', color: 'white',
                            borderRadius: 6, padding: '4px 10px',
                            fontSize: 11, fontWeight: 900,
                        }}>
                            -{Math.round((1 - product.price / product.compare_price) * 100)}%
                        </div>
                    )}
                    {product.stock <= 3 && product.stock > 0 && (
                        <div style={{
                            position: 'absolute', top: 12, left: 12,
                            background: 'rgba(239,232,221,0.95)', color: '#7A5A1A',
                            borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 800,
                        }}>{product.stock} فقط</div>
                    )}
                    {product.stock === 0 && (
                        <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{ color: 'white', fontWeight: 900, fontSize: 14, background: 'rgba(0,0,0,0.6)', padding: '6px 16px', borderRadius: 8 }}>نفد المخزون</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={{ padding: compact ? '12px 14px' : '16px 18px 20px' }}>
                    <div style={{ fontWeight: 700, fontSize: compact ? 13 : 15, marginBottom: 6, color: '#111111', lineHeight: 1.4 }}>{product.name}</div>
                    {!compact && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                            <Star size={12} fill="#C6A75E" stroke="none" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#6B6058' }}>4.8</span>
                            <span style={{ fontSize: 11, color: '#A09080' }}>(12)</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ color: '#111111', fontWeight: 900, fontSize: compact ? 15 : 18 }}>{Number(product.price).toFixed(3)}</span>
                            <span style={{ color: '#6B6058', fontSize: 11, marginRight: 3 }}>د.أ</span>
                            {product.compare_price && (
                                <div style={{ color: '#A09080', fontSize: 11, textDecoration: 'line-through' }}>{Number(product.compare_price).toFixed(3)} د.أ</div>
                            )}
                        </div>
                        {!compact && (
                            <button
                                disabled={product.stock === 0}
                                style={{
                                    background: product.stock === 0 ? '#F0EDE8' : '#222222',
                                    color: product.stock === 0 ? '#A09080' : 'white',
                                    border: 'none', borderRadius: 8,
                                    padding: '8px 16px', fontSize: 12, fontWeight: 800,
                                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                                    fontFamily: 'inherit', transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.background = '#C6A75E' }}
                                onMouseLeave={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.background = '#222222' }}
                            >
                                + السلة
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}

function PlaceholderCard({ primary, radius, compact }: any) {
    return (
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8E0D5' }}>
            <div style={{ height: compact ? 140 : 220, background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, opacity: 0.3 }}>🛍️</div>
            <div style={{ padding: compact ? '10px 12px' : '14px 16px', opacity: 0.3 }}>
                <div style={{ height: 12, background: '#E0D6C8', borderRadius: 4, marginBottom: 8, width: '70%' }} />
                <div style={{ height: 16, background: '#C6A75E', borderRadius: 4, width: '40%' }} />
            </div>
        </div>
    )
}

// ─── Countdown ────────────────────────────────────────────────────────────────
function CountdownSection({ s, primary, radius }: any) {
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, sec: 0 })

    useEffect(() => {
        const target = s.end_date ? new Date(s.end_date).getTime() : Date.now() + 2 * 86400000
        const update = () => {
            const diff = Math.max(0, target - Date.now())
            setTimeLeft({ d: Math.floor(diff / 86400000), h: Math.floor(diff / 3600000) % 24, m: Math.floor(diff / 60000) % 60, sec: Math.floor(diff / 1000) % 60 })
        }
        update()
        const t = setInterval(update, 1000)
        return () => clearInterval(t)
    }, [s.end_date])

    const bg = s.background_color || primary
    const fg = s.text_color || 'white'

    return (
        <div style={{ background: bg, padding: '48px 24px', textAlign: 'center' }}>
            <h2 style={{ color: fg, fontSize: 24, fontWeight: 900, marginBottom: 24 }}>{s.title_ar || 'عرض محدود!'}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                {[{ v: timeLeft.d, l: 'يوم' }, { v: timeLeft.h, l: 'ساعة' }, { v: timeLeft.m, l: 'دقيقة' }, { v: timeLeft.sec, l: 'ثانية' }].map(({ v, l }) => (
                    <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: radius, padding: '16px 20px', minWidth: 72, backdropFilter: 'blur(8px)' }}>
                        <div style={{ fontSize: 36, fontWeight: 900, color: 'white', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{String(v).padStart(2, '0')}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>{l}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Main Storefront ──────────────────────────────────────────────────────────
export default function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const supabase = createClient()

    const [store, setStore] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [cartCount, setCartCount] = useState(0)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState('الكل')
    const [categories, setCategories] = useState<string[]>(['الكل'])
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function fetchStoreData() {
            try {
                const { data: storeData } = await supabase.from('stores').select('*').eq('slug', slug).single()
                if (!storeData) { setLoading(false); return }
                setStore(storeData)

                const { data: productsData } = await supabase
                    .from('products').select('*, categories(name_ar)').eq('store_id', storeData.id).eq('is_active', true).order('created_at', { ascending: false })

                if (productsData) {
                    setProducts(productsData)
                    const cats = Array.from(new Set(productsData.map(p => p.categories?.name_ar).filter(Boolean))) as string[]
                    setCategories(['الكل', ...cats])
                }
            } catch (err) { console.error(err) } finally { setLoading(false) }
        }
        fetchStoreData()
    }, [supabase, slug])

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}><div className="spinner" /></div>

    if (!store) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🏷️</div>
            <h2 style={{ marginBottom: 16 }}>المتجر غير موجود</h2>
            <Link href="/" style={{ color: '#6C3CE1', fontWeight: 700 }}>العودة للرئيسية</Link>
        </div>
    )

    const { primary, secondary, font, radius, global: themeGlobal, sections } = extractConfig(store.theme)
    const hasSections = sections && sections.length > 0

    // Filter products for fallback grid
    const filteredProducts = products.filter(p => {
        const matchCat = activeCategory === 'الكل' || p.categories?.name_ar === activeCategory
        const matchSearch = !search || p.name_ar?.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: `${font}, Tajawal, Inter, sans-serif`, direction: 'rtl' }}>

            {/* ── Announcement Bar (global) ─────────────────────────────── */}
            {themeGlobal?.show_announcement && themeGlobal.announcement_text_ar && (
                <div style={{ background: primary, color: 'white', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>
                    {themeGlobal.announcement_text_ar}
                </div>
            )}

            {/* ── Header ───────────────────────────────────────────────── */}
            <header style={{
                background: 'white', borderBottom: '1px solid #E5E7EB',
                position: themeGlobal?.header_sticky ? 'sticky' : 'static', top: 0, zIndex: 100,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
                    {/* Logo */}
                    <div style={{ fontWeight: 900, fontSize: 20, color: primary }}>{store.name_ar || store.name}</div>

                    {/* Nav links from theme */}
                    <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {(themeGlobal?.nav_links?.length
                            ? themeGlobal.nav_links
                            : [{ label: 'الرئيسية', url: '/', type: 'builtin' }, { label: 'المنتجات', url: '/products', type: 'builtin' }]
                        ).map((link: any) => {
                            const href = link.type === 'page'
                                ? `/store/${slug}/p/${link.url.replace(/^\/p\//, '')}`
                                : link.url === '/'
                                    ? `/store/${slug}`
                                    : `/store/${slug}${link.url}`
                            return (
                                <Link key={link.url} href={href} style={{
                                    padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                                    color: '#374151', textDecoration: 'none', transition: 'all 0.15s',
                                }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${primary}12`; (e.currentTarget as HTMLElement).style.color = primary }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
                                >{link.label}</Link>
                            )
                        })}
                    </nav>

                    {/* Search */}
                    <div style={{ position: 'relative', width: 260, display: 'flex' }}>
                        <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="ابحث..." style={{ width: '100%', padding: '8px 36px 8px 12px', borderRadius: radius, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#F9FAFB' }} />
                    </div>

                    {/* Cart */}
                    <Link href={`/store/${slug}/cart`} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, background: primary, color: 'white', borderRadius: radius, padding: '8px 18px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                        <ShoppingCart size={17} />
                        السلة
                        {cartCount > 0 && (
                            <span style={{ position: 'absolute', top: -8, left: -8, background: secondary, color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>{cartCount}</span>
                        )}
                    </Link>
                </div>
            </header>

            {/* ── Category Nav ─────────────────────────────────────────── */}
            {categories.length > 1 && (
                <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                                padding: '14px 22px', border: 'none', background: 'transparent', cursor: 'pointer',
                                fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'inherit',
                                color: activeCategory === cat ? primary : '#6B7280',
                                borderBottom: `2.5px solid ${activeCategory === cat ? primary : 'transparent'}`,
                                transition: 'all 0.15s',
                            }}>{cat}</button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Theme Sections OR Fallback ────────────────────────────── */}
            {hasSections ? (
                <main style={{ flex: 1 }}>
                    {sections.map(section => (
                        <SectionRenderer
                            key={section.id}
                            section={section}
                            primary={primary}
                            radius={radius}
                            products={filteredProducts}
                            slug={slug}
                        />
                    ))}
                </main>
            ) : (
                // ── Fallback: default storefront layout ──────────────────
                <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '36px 20px', width: '100%', boxSizing: 'border-box' }}>
                    {/* Hero */}
                    <div style={{
                        background: `linear-gradient(135deg, ${primary}, ${primary}99)`,
                        borderRadius: radius + 4, padding: '48px', color: 'white', marginBottom: 44,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 10 }}>✨ مرحباً بك في</div>
                            <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.3, marginBottom: 20 }}>
                                {store.name_ar || store.name}
                            </h1>
                            {store.description_ar && <p style={{ fontSize: 15, opacity: 0.85, marginBottom: 24, maxWidth: 400 }}>{store.description_ar}</p>}
                            <Link href={`/store/${slug}/products`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: primary, borderRadius: radius, padding: '12px 28px', fontWeight: 800, textDecoration: 'none', fontSize: 15 }}>
                                تسوق الآن <ChevronLeft size={16} />
                            </Link>
                        </div>
                        <div style={{ fontSize: 96, lineHeight: 1, filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}>🛍️</div>
                    </div>

                    {/* Products */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111827' }}>منتجاتنا</h2>
                        <span style={{ color: '#6B7280', fontSize: 14 }}>{filteredProducts.length} منتج</span>
                    </div>
                    {filteredProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9CA3AF' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                            <p style={{ fontSize: 15 }}>لا توجد منتجات تطابق البحث</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} primary={primary} radius={radius} slug={slug} />
                            ))}
                        </div>
                    )}
                </main>
            )}

            {/* ── Footer ───────────────────────────────────────────────── */}
            <footer style={{ background: '#111827', color: 'white', marginTop: 80 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48 }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 22, color: primary, marginBottom: 12 }}>{store.name_ar || store.name}</div>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.8 }}>{store.description_ar || 'متجر إلكتروني موثوق وسريع'}</p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            {store.instagram && <a href={`https://instagram.com/${store.instagram}`} target="_blank" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, textDecoration: 'none' }}>📸</a>}
                            {store.whatsapp && <a href={`https://wa.me/${store.whatsapp}`} target="_blank" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, textDecoration: 'none' }}>📱</a>}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>روابط سريعة</div>
                        {[['الرئيسية', `/store/${slug}`], ['المنتجات', `/store/${slug}/products`], ['تتبع طلبك', `/store/${slug}/track`]].map(([l, h]) => (
                            <div key={l} style={{ marginBottom: 10 }}>
                                <Link href={h} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, textDecoration: 'none', transition: 'color 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'white'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'}>{l}</Link>
                            </div>
                        ))}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>معلومات</div>
                        {['سياسة الخصوصية', 'شروط الاستخدام', 'سياسة الإرجاع'].map(l => (
                            <div key={l} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 10 }}>{l}</div>
                        ))}
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', padding: '16px 20px', color: 'rgba(255,255,255,0.35)', fontSize: 13, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span>© {new Date().getFullYear()} {store.name_ar || store.name} — جميع الحقوق محفوظة</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                    <span>لـ منصة <span style={{ color: '#6C3CE1', fontWeight: 700 }}>تجارنا</span></span>
                </div>
            </footer>
        </div>
    )
}
