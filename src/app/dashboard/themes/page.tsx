'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'
import {
    Search, Star, Smartphone, Zap, TrendingUp, Check, X,
    Monitor, Tablet, Crown, Sparkles, ChevronRight,
    Grid3X3, Eye, Download, Palette
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Theme {
    id: string
    name: string
    nameAr: string
    description: string
    descriptionAr: string
    category: string
    style_type: string
    style_type_ar: string
    is_free: boolean
    is_trending: boolean
    is_new: boolean
    price: number
    preview_image: string
    accent_color: string
    bg_color: string
    features: string[]
    featuresAr: string[]
    screenshots: string[]
    performance: number
    installs: number
    rating: number
}

// ─── Demo Theme Data ──────────────────────────────────────────────────────────
const DEMO_THEMES: Theme[] = [
    {
        id: 'aurora',
        name: 'Aurora',
        nameAr: 'أورورا',
        description: 'Elegant luxury fashion theme with smooth animations',
        descriptionAr: 'قالب أزياء فاخر أنيق مع حركات سلسة',
        category: 'fashion',
        style_type: 'Elegant',
        style_type_ar: 'أنيق',
        is_free: false,
        is_trending: true,
        is_new: false,
        price: 29,
        preview_image: '/aurora-preview.jpg',
        accent_color: '#C6A75E',
        bg_color: '#FAF7F2',
        features: ['mobile', 'fast', 'seo'],
        featuresAr: ['متوافق مع الجوال', 'تحميل سريع', 'محسّن للسيو'],
        screenshots: [],
        performance: 98,
        installs: 1240,
        rating: 4.9,
    },
    {
        id: 'pulse',
        name: 'Pulse',
        nameAr: 'بولس',
        description: 'Bold and vibrant theme for electronics & tech stores',
        descriptionAr: 'قالب جريء وحيوي للمتاجر التقنية والإلكترونيات',
        category: 'electronics',
        style_type: 'Bold',
        style_type_ar: 'جريء',
        is_free: false,
        is_trending: true,
        is_new: true,
        price: 19,
        preview_image: '/pulse-preview.jpg',
        accent_color: '#00D4FF',
        bg_color: '#0A0A14',
        features: ['mobile', 'fast', 'seo'],
        featuresAr: ['متوافق مع الجوال', 'تحميل سريع', 'محسّن للسيو'],
        screenshots: [],
        performance: 95,
        installs: 870,
        rating: 4.7,
    },
    {
        id: 'petjoy',
        name: 'PetJoy',
        nameAr: 'بت جوي',
        description: 'Playful and warm theme perfect for pet supply stores',
        descriptionAr: 'قالب مرح ودافئ مثالي لمتاجر مستلزمات الحيوانات',
        category: 'general',
        style_type: 'Playful',
        style_type_ar: 'مرح',
        is_free: true,
        is_trending: false,
        is_new: true,
        price: 0,
        preview_image: '/petjoy-preview.jpg',
        accent_color: '#FF7B35',
        bg_color: '#FFF8F0',
        features: ['mobile', 'seo'],
        featuresAr: ['متوافق مع الجوال', 'محسّن للسيو'],
        screenshots: [],
        performance: 91,
        installs: 530,
        rating: 4.6,
    },
    {
        id: 'corporatepro',
        name: 'CorporatePro',
        nameAr: 'كوربوريت برو',
        description: 'Professional B2B theme for enterprise & office supplies',
        descriptionAr: 'قالب احترافي للأعمال الكبيرة ومستلزمات المكاتب',
        category: 'general',
        style_type: 'Corporate',
        style_type_ar: 'مؤسسي',
        is_free: false,
        is_trending: false,
        is_new: false,
        price: 39,
        preview_image: '/corporate-preview.jpg',
        accent_color: '#1E3A5F',
        bg_color: '#F0F4F8',
        features: ['mobile', 'fast', 'seo'],
        featuresAr: ['متوافق مع الجوال', 'تحميل سريع', 'محسّن للسيو'],
        screenshots: [],
        performance: 97,
        installs: 420,
        rating: 4.8,
    },
    {
        id: 'minimalcart',
        name: 'MinimalCart',
        nameAr: 'ميني مال كارت',
        description: 'Ultra-minimal theme with Apple-inspired clean design',
        descriptionAr: 'قالب فائق الأناقة بتصميم نظيف مستوحى من أبل',
        category: 'minimal',
        style_type: 'Minimal',
        style_type_ar: 'بسيط',
        is_free: true,
        is_trending: false,
        is_new: false,
        price: 0,
        preview_image: '/minimal-preview.jpg',
        accent_color: '#111111',
        bg_color: '#FFFFFF',
        features: ['mobile', 'fast', 'seo'],
        featuresAr: ['متوافق مع الجوال', 'تحميل سريع', 'محسّن للسيو'],
        screenshots: [],
        performance: 99,
        installs: 2100,
        rating: 4.9,
    },
    {
        id: 'luxe',
        name: 'Luxe',
        nameAr: 'لوكس',
        description: 'Opulent dark-mode luxury theme for high-end brands',
        descriptionAr: 'قالب فاخر بوضع داكن للعلامات التجارية الراقية',
        category: 'luxury',
        style_type: 'Elegant',
        style_type_ar: 'أنيق',
        is_free: false,
        is_trending: true,
        is_new: false,
        price: 49,
        preview_image: '/luxe-preview.jpg',
        accent_color: '#D4AF37',
        bg_color: '#0D0D0D',
        features: ['mobile', 'fast', 'seo'],
        featuresAr: ['متوافق مع الجوال', 'تحميل سريع', 'محسّن للسيو'],
        screenshots: [],
        performance: 96,
        installs: 780,
        rating: 4.8,
    },
    {
        id: 'bloom',
        name: 'Bloom',
        nameAr: 'بلوم',
        description: 'Fresh and natural theme for beauty & cosmetics stores',
        descriptionAr: 'قالب طازج وطبيعي لمتاجر الجمال ومستحضرات التجميل',
        category: 'beauty',
        style_type: 'Elegant',
        style_type_ar: 'أنيق',
        is_free: false,
        is_trending: false,
        is_new: true,
        price: 24,
        preview_image: '/bloom-preview.jpg',
        accent_color: '#E91E8C',
        bg_color: '#FFF5F9',
        features: ['mobile', 'fast', 'seo'],
        featuresAr: ['متوافق مع الجوال', 'تحميل سريع', 'محسّن للسيو'],
        screenshots: [],
        performance: 94,
        installs: 610,
        rating: 4.7,
    },
    {
        id: 'woodcraft',
        name: 'Woodcraft',
        nameAr: 'وود كرافت',
        description: 'Warm earthy theme for furniture & home decor stores',
        descriptionAr: 'قالب دافئ وطبيعي لمتاجر الأثاث والديكور المنزلي',
        category: 'furniture',
        style_type: 'Corporate',
        style_type_ar: 'مؤسسي',
        is_free: false,
        is_trending: false,
        is_new: false,
        price: 29,
        preview_image: '/woodcraft-preview.jpg',
        accent_color: '#8B5E3C',
        bg_color: '#F5F0E8',
        features: ['mobile', 'seo'],
        featuresAr: ['متوافق مع الجوال', 'محسّن للسيو'],
        screenshots: [],
        performance: 92,
        installs: 350,
        rating: 4.6,
    },
]

const CATEGORIES = [
    { id: 'all', label: 'الكل', labelEn: 'All' },
    { id: 'fashion', label: 'أزياء', labelEn: 'Fashion' },
    { id: 'electronics', label: 'إلكترونيات', labelEn: 'Electronics' },
    { id: 'beauty', label: 'جمال وعناية', labelEn: 'Beauty' },
    { id: 'furniture', label: 'أثاث ومنزل', labelEn: 'Furniture' },
    { id: 'minimal', label: 'بسيط', labelEn: 'Minimal' },
    { id: 'luxury', label: 'فاخر', labelEn: 'Luxury' },
    { id: 'general', label: 'عام', labelEn: 'General' },
]

const TYPE_FILTERS = [
    { id: 'all', label: 'الكل', labelEn: 'All' },
    { id: 'free', label: 'مجاني', labelEn: 'Free' },
    { id: 'premium', label: 'مميز', labelEn: 'Premium' },
    { id: 'trending', label: 'رائج', labelEn: 'Trending' },
    { id: 'new', label: 'جديد', labelEn: 'New' },
]

// ─── Theme Preview Color Demo ─────────────────────────────────────────────────
function ThemeColorPreview({ theme, size = 'normal' }: { theme: Theme; size?: 'normal' | 'large' }) {
    const h = size === 'large' ? 280 : 180
    const gradient = theme.id === 'pulse'
        ? `linear-gradient(135deg, #0A0A14 0%, #0D1B2A 50%, #1a0533 100%)`
        : theme.id === 'luxe'
            ? `linear-gradient(135deg, #0D0D0D 0%, #1a1400 100%)`
            : `linear-gradient(135deg, ${theme.bg_color} 0%, ${theme.accent_color}22 100%)`

    return (
        <div style={{
            width: '100%', height: h, background: gradient,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', position: 'relative',
        }}>
            {/* Mock nav bar */}
            <div style={{
                height: 32, background: theme.id === 'pulse' || theme.id === 'luxe' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
                padding: '0 14px', gap: 10, borderBottom: `1px solid ${theme.accent_color}20`,
            }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: theme.accent_color, flexShrink: 0 }} />
                <div style={{ width: 40, height: 5, borderRadius: 3, background: theme.id === 'pulse' || theme.id === 'luxe' ? 'rgba(255,255,255,0.3)' : '#33333320' }} />
                <div style={{ flex: 1 }} />
                {[36, 28, 22].map((w, i) => (
                    <div key={i} style={{ width: w, height: 5, borderRadius: 3, background: theme.id === 'pulse' || theme.id === 'luxe' ? 'rgba(255,255,255,0.15)' : '#33333318' }} />
                ))}
            </div>

            {/* Hero section */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ width: size === 'large' ? 130 : 90, height: size === 'large' ? 14 : 10, borderRadius: 4, background: theme.id === 'pulse' || theme.id === 'luxe' ? 'rgba(255,255,255,0.8)' : theme.accent_color, marginBottom: 8 }} />
                    <div style={{ width: size === 'large' ? 100 : 70, height: size === 'large' ? 9 : 7, borderRadius: 3, background: theme.id === 'pulse' || theme.id === 'luxe' ? 'rgba(255,255,255,0.3)' : '#33333330', marginBottom: size === 'large' ? 16 : 10 }} />
                    <div style={{
                        display: 'inline-block', padding: size === 'large' ? '8px 18px' : '5px 12px',
                        borderRadius: 6, background: theme.accent_color,
                        color: 'white', fontSize: size === 'large' ? 11 : 9, fontWeight: 700,
                    }}>
                        {theme.id === 'aurora' || theme.id === 'bloom' ? '✦ تسوق الآن' :
                            theme.id === 'pulse' ? '⚡ اكتشف' :
                                theme.id === 'petjoy' ? '🐾 تسوق' :
                                    theme.id === 'corporatepro' ? '→ اعرف أكثر' :
                                        theme.id === 'minimalcart' ? 'اكتشف' :
                                            theme.id === 'woodcraft' ? '● اكتشف' : '✦ تسوق الآن'}
                    </div>
                </div>
                <div style={{
                    width: size === 'large' ? 110 : 70, height: size === 'large' ? 130 : 80,
                    borderRadius: 8, background: `${theme.accent_color}25`,
                    border: `1px solid ${theme.accent_color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: size === 'large' ? 32 : 22, flexShrink: 0,
                }}>
                    {theme.category === 'fashion' ? '👗' :
                        theme.category === 'electronics' ? '📱' :
                            theme.category === 'beauty' ? '💄' :
                                theme.category === 'furniture' ? '🪑' :
                                    theme.category === 'luxury' ? '💎' :
                                        theme.id === 'petjoy' ? '🐕' :
                                            theme.id === 'minimalcart' ? '○' : '🛍️'}
                </div>
            </div>

            {/* Product row */}
            <div style={{ display: 'flex', gap: 6, padding: size === 'large' ? '0 16px 12px' : '0 12px 8px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        flex: 1, height: size === 'large' ? 56 : 36, borderRadius: 6,
                        background: theme.id === 'pulse' || theme.id === 'luxe' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)',
                        border: `1px solid ${theme.accent_color}20`,
                    }} />
                ))}
            </div>

            {/* Accent overlay glow for dark themes */}
            {(theme.id === 'pulse' || theme.id === 'luxe') && (
                <div style={{
                    position: 'absolute', top: '30%', left: '30%',
                    width: 80, height: 80, borderRadius: '50%',
                    background: `radial-gradient(circle, ${theme.accent_color}30, transparent 70%)`,
                    pointerEvents: 'none',
                }} />
            )}
        </div>
    )
}

// ─── Feature Icon ─────────────────────────────────────────────────────────────
function FeatureIcon({ type, lang }: { type: string, lang: string }) {
    const map: Record<string, { icon: any, label: string, labelAr: string, color: string }> = {
        mobile: { icon: Smartphone, label: 'Mobile Ready', labelAr: 'متوافق مع الجوال', color: '#10B981' },
        fast: { icon: Zap, label: 'Fast Loading', labelAr: 'تحميل سريع', color: '#F59E0B' },
        seo: { icon: TrendingUp, label: 'SEO Optimized', labelAr: 'محسّن للسيو', color: '#3B82F6' },
    }
    const f = map[type]
    if (!f) return null
    const Icon = f.icon
    return (
        <div title={lang === 'ar' ? f.labelAr : f.label} style={{
            display: 'flex', alignItems: 'center', gap: 3, fontSize: 10,
            color: f.color, background: `${f.color}12`, padding: '3px 7px',
            borderRadius: 50, fontWeight: 600,
        }}>
            <Icon size={10} />
            <span style={{ fontSize: 10 }}>{lang === 'ar' ? f.labelAr : f.label}</span>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ThemesPage() {
    const { lang, dir } = useLanguage()
    const router = useRouter()
    const supabase = createClient()

    const [search, setSearch] = useState('')
    const [activeType, setActiveType] = useState('all')
    const [activeCategory, setActiveCategory] = useState('all')
    const [previewTheme, setPreviewTheme] = useState<Theme | null>(null)
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [applyTheme, setApplyTheme] = useState<Theme | null>(null)
    const [applying, setApplying] = useState(false)
    const [appliedId, setAppliedId] = useState<string | null>(null)
    const [storeId, setStoreId] = useState<string | null>(null)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    useEffect(() => {
        async function loadStore() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }
            const { data: stores } = await supabase.from('stores').select('id, theme').eq('user_id', user.id).limit(1)
            if (stores && stores[0]) {
                setStoreId(stores[0].id)
                if (stores[0].theme?.activeThemeId) {
                    setAppliedId(stores[0].theme.activeThemeId)
                }
            }
        }
        loadStore()
    }, [])

    const filtered = useMemo(() => {
        let themes = DEMO_THEMES
        if (search) themes = themes.filter(t =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.nameAr.includes(search) ||
            t.style_type.toLowerCase().includes(search.toLowerCase())
        )
        if (activeType === 'free') themes = themes.filter(t => t.is_free)
        if (activeType === 'premium') themes = themes.filter(t => !t.is_free)
        if (activeType === 'trending') themes = themes.filter(t => t.is_trending)
        if (activeType === 'new') themes = themes.filter(t => t.is_new)
        if (activeCategory !== 'all') themes = themes.filter(t => t.category === activeCategory)
        return themes
    }, [search, activeType, activeCategory])

    const handleApply = async () => {
        if (!applyTheme || !storeId) return
        setApplying(true)
        try {
            const { data: current } = await supabase.from('stores').select('theme').eq('id', storeId).single()
            const updatedTheme = { ...(current?.theme || {}), activeThemeId: applyTheme.id, activeThemeName: applyTheme.name }
            await supabase.from('stores').update({ theme: updatedTheme }).eq('id', storeId)
            setAppliedId(applyTheme.id)
            toast.success(lang === 'ar' ? `✅ تم تطبيق قالب "${applyTheme.nameAr}" بنجاح!` : `✅ Theme "${applyTheme.name}" applied successfully!`)
            setApplyTheme(null)
            setPreviewTheme(null)
        } catch {
            toast.error(lang === 'ar' ? 'خطأ في تطبيق القالب' : 'Error applying theme')
        } finally {
            setApplying(false)
        }
    }

    const isAr = lang === 'ar'

    return (
        <div dir={dir} style={{ minHeight: '100vh', background: '#F5F3EF', fontFamily: 'Tajawal, Inter, sans-serif' }}>

            {/* ── Page Header ────────────────────────────────────────────────────── */}
            <div style={{
                background: 'linear-gradient(135deg, #1C1C1C 0%, #2D1B69 50%, #1C1C1C 100%)',
                padding: '56px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative orbs */}
                <div style={{ position: 'absolute', top: -60, left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,60,225,0.2), transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -80, right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(198,167,94,0.12), transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(108,60,225,0.2)', border: '1px solid rgba(108,60,225,0.4)', padding: '5px 14px', borderRadius: 50, marginBottom: 20 }}>
                        <Palette size={13} color="#A78BFA" />
                        <span style={{ color: '#A78BFA', fontSize: 12, fontWeight: 700 }}>{isAr ? 'سوق القوالب' : 'Themes Marketplace'}</span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#FFFFFF', marginBottom: 14, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        {isAr ? 'اختر قالباً لمتجرك' : 'Choose a Theme for Your Store'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(14px,2vw,17px)', maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.7 }}>
                        {isAr ? 'خصّص مظهر متجرك باختيار أحد القوالب المصممة باحترافية.' : 'Customize the look and feel of your store with professionally designed themes.'}
                    </p>

                    {/* Search */}
                    <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
                        <Search size={17} style={{ position: 'absolute', top: '50%', [isAr ? 'right' : 'left']: 16, transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder={isAr ? 'ابحث عن قالب...' : 'Search themes...'}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: `13px ${isAr ? '16px' : '44px'} 13px ${isAr ? '44px' : '16px'}`,
                                borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
                                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
                                color: 'white', fontSize: 15, fontFamily: 'inherit', outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {/* Type filter pills */}
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
                        {TYPE_FILTERS.map(f => (
                            <button key={f.id} onClick={() => setActiveType(f.id)} style={{
                                padding: '7px 18px', borderRadius: 50, fontWeight: 700, fontSize: 13,
                                border: `1.5px solid ${activeType === f.id ? '#6C3CE1' : 'rgba(255,255,255,0.15)'}`,
                                background: activeType === f.id ? '#6C3CE1' : 'rgba(255,255,255,0.06)',
                                color: activeType === f.id ? 'white' : 'rgba(255,255,255,0.7)',
                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                            }}>
                                {isAr ? f.label : f.labelEn}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main Content ────────────────────────────────────────────────────── */}
            <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 20px 60px' }}>
                <div style={{ display: 'flex', gap: 28, marginTop: -32 }}>

                    {/* ── Left Sidebar (Desktop Category Filter) ──────────────────────── */}
                    <aside style={{
                        width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4,
                    }} className="themes-sidebar">
                        <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #E5E1D8' }}>
                            <p style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                                {isAr ? 'التصنيف' : 'Category'}
                            </p>
                            {CATEGORIES.map(cat => (
                                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                                    width: '100%', textAlign: isAr ? 'right' : 'left', padding: '9px 12px',
                                    borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                                    fontSize: 13, fontWeight: activeCategory === cat.id ? 700 : 500,
                                    background: activeCategory === cat.id ? 'rgba(108,60,225,0.08)' : 'transparent',
                                    color: activeCategory === cat.id ? '#6C3CE1' : '#6B7280',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    transition: 'all 0.15s',
                                }}>
                                    <span>{isAr ? cat.label : cat.labelEn}</span>
                                    {activeCategory === cat.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C3CE1' }} />}
                                </button>
                            ))}
                        </div>

                        {/* Stats card */}
                        <div style={{ background: 'linear-gradient(135deg, #6C3CE1, #9B59D9)', borderRadius: 14, padding: 16, marginTop: 4, color: 'white' }}>
                            <Grid3X3 size={20} style={{ marginBottom: 8, opacity: 0.8 }} />
                            <div style={{ fontSize: 22, fontWeight: 900 }}>{DEMO_THEMES.length}</div>
                            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{isAr ? 'قالب متاح' : 'Themes Available'}</div>
                        </div>
                    </aside>

                    {/* ── Theme Grid ────────────────────────────────────────────────────── */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Results bar */}
                        <div style={{
                            background: 'white', borderRadius: 12, padding: '14px 20px', marginBottom: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #E5E1D8',
                        }}>
                            <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>
                                <span style={{ fontWeight: 800, color: '#111' }}>{filtered.length}</span> {isAr ? 'قالب' : 'themes found'}
                            </p>
                            {appliedId && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#D1FAE5', padding: '5px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700, color: '#065F46' }}>
                                    <Check size={12} />
                                    {isAr ? `القالب الحالي: ${DEMO_THEMES.find(t => t.id === appliedId)?.nameAr || appliedId}` : `Active: ${DEMO_THEMES.find(t => t.id === appliedId)?.name || appliedId}`}
                                </div>
                            )}
                        </div>

                        {/* Grid */}
                        {filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9CA3AF' }}>
                                <Search size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                                <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>{isAr ? 'لا توجد قوالب' : 'No themes found'}</p>
                                <p style={{ fontSize: 13 }}>{isAr ? 'جرب تغيير معايير البحث' : 'Try adjusting your search or filters'}</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                                gap: 20,
                            }}>
                                {filtered.map(theme => (
                                    <ThemeCard
                                        key={theme.id}
                                        theme={theme}
                                        lang={lang}
                                        isActive={appliedId === theme.id}
                                        onPreview={() => { setPreviewTheme(theme); setPreviewDevice('desktop') }}
                                        onApply={() => setApplyTheme(theme)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Preview Modal ────────────────────────────────────────────────────── */}
            {previewTheme && (
                <PreviewModal
                    theme={previewTheme}
                    lang={lang}
                    dir={dir}
                    device={previewDevice}
                    onDeviceChange={setPreviewDevice}
                    isActive={appliedId === previewTheme.id}
                    onApply={() => setApplyTheme(previewTheme)}
                    onClose={() => setPreviewTheme(null)}
                />
            )}

            {/* ── Apply Confirmation Modal ─────────────────────────────────────────── */}
            {applyTheme && (
                <ApplyModal
                    theme={applyTheme}
                    lang={lang}
                    dir={dir}
                    applying={applying}
                    onConfirm={handleApply}
                    onCancel={() => setApplyTheme(null)}
                />
            )}

            {/* ── Mobile sidebar filter toggle ─────────────────────────────────────── */}
            <style>{`
        @media (max-width: 768px) {
          .themes-sidebar { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-filter-btn { display: none !important; }
        }
      `}</style>
        </div>
    )
}

// ─── Theme Card ───────────────────────────────────────────────────────────────
function ThemeCard({
    theme, lang, isActive, onPreview, onApply
}: {
    theme: Theme
    lang: string
    isActive: boolean
    onPreview: () => void
    onApply: () => void
}) {
    const [hovered, setHovered] = useState(false)
    const isAr = lang === 'ar'

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                border: isActive ? '2px solid #6C3CE1' : `1px solid ${hovered ? '#D0C8E0' : '#E5E1D8'}`,
                boxShadow: hovered ? '0 12px 36px rgba(108,60,225,0.12)' : '0 2px 10px rgba(0,0,0,0.06)',
                transition: 'all 0.25s ease',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                cursor: 'pointer',
                position: 'relative',
            }}
        >
            {/* Active badge */}
            {isActive && (
                <div style={{
                    position: 'absolute', top: 10, [isAr ? 'left' : 'right']: 10, zIndex: 10,
                    background: '#6C3CE1', color: 'white', padding: '4px 10px',
                    borderRadius: 50, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    <Check size={11} />{isAr ? 'مُطبّق' : 'Active'}
                </div>
            )}

            {/* Badges */}
            <div style={{ position: 'absolute', top: 10, [isAr ? 'right' : 'left']: 10, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {theme.is_new && (
                    <span style={{ background: '#10B981', color: 'white', padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 700 }}>
                        {isAr ? 'جديد' : 'NEW'}
                    </span>
                )}
                {theme.is_trending && (
                    <span style={{ background: '#F59E0B', color: 'white', padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 700 }}>
                        {isAr ? 'رائج' : '🔥 HOT'}
                    </span>
                )}
            </div>

            {/* Preview area */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <ThemeColorPreview theme={theme} />

                {/* Hover overlay */}
                {hovered && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}>
                        <button onClick={e => { e.stopPropagation(); onPreview() }} style={{
                            padding: '9px 18px', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.8)',
                            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                            color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <Eye size={14} />{isAr ? 'معاينة' : 'Preview'}
                        </button>
                    </div>
                )}
            </div>

            {/* Card body */}
            <div style={{ padding: '16px 16px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 3 }}>
                            {isAr ? theme.nameAr : theme.name}
                        </h3>
                        <span style={{
                            fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 50,
                            background: `${theme.accent_color}15`, color: theme.accent_color,
                        }}>
                            {isAr ? theme.style_type_ar : theme.style_type}
                        </span>
                    </div>
                    <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                        {theme.is_free
                            ? <span style={{ fontSize: 13, fontWeight: 900, color: '#10B981' }}>{isAr ? 'مجاني' : 'Free'}</span>
                            : <div>
                                <span style={{ fontSize: 14, fontWeight: 900, color: '#1C1C1C' }}>{theme.price}</span>
                                <span style={{ fontSize: 11, color: '#9CA3AF' }}> {isAr ? 'د.أ' : 'JOD'}</span>
                            </div>
                        }
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: isAr ? 'flex-start' : 'flex-end', marginTop: 2 }}>
                            <Star size={10} color="#F59E0B" fill="#F59E0B" />
                            <span style={{ fontSize: 11, color: '#6B7280' }}>{theme.rating}</span>
                        </div>
                    </div>
                </div>

                {/* Feature tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                    {theme.features.map(f => <FeatureIcon key={f} type={f} lang={lang} />)}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={onPreview} style={{
                        flex: 1, padding: '8px 0', borderRadius: 9, border: '1.5px solid #E5E1D8',
                        background: 'transparent', color: '#374151', fontWeight: 600, fontSize: 13,
                        cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6C3CE1'; (e.currentTarget as HTMLElement).style.color = '#6C3CE1' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E1D8'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
                    >
                        <Eye size={13} />{isAr ? 'معاينة' : 'Preview'}
                    </button>
                    <button onClick={onApply} disabled={isActive} style={{
                        flex: 1, padding: '8px 0', borderRadius: 9, border: 'none',
                        background: isActive ? '#6C3CE120' : '#6C3CE1', color: isActive ? '#6C3CE1' : 'white',
                        fontWeight: 700, fontSize: 13, cursor: isActive ? 'default' : 'pointer',
                        fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#5B2FC7' }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#6C3CE1' }}
                    >
                        {isActive ? <><Check size={13} />{isAr ? 'مُطبّق' : 'Applied'}</> : <><Download size={13} />{isAr ? 'تطبيق' : 'Apply'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ theme, lang, dir, device, onDeviceChange, isActive, onApply, onClose }: {
    theme: Theme
    lang: string
    dir: string
    device: 'desktop' | 'tablet' | 'mobile'
    onDeviceChange: (d: 'desktop' | 'tablet' | 'mobile') => void
    isActive: boolean
    onApply: () => void
    onClose: () => void
}) {
    const isAr = lang === 'ar'
    const deviceWidth: Record<string, string> = { desktop: '100%', tablet: '768px', mobile: '375px' }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Modal header */}
            <div style={{
                height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', background: '#1C1C2E', borderBottom: '1px solid rgba(255,255,255,0.08)',
                gap: 12, flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8, color: 'white', cursor: 'pointer', padding: '7px 10px',
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit',
                    }}>
                        <X size={15} />{isAr ? 'إغلاق' : 'Close'}
                    </button>
                    <span style={{ fontWeight: 800, color: 'white', fontSize: 15 }}>
                        {isAr ? theme.nameAr : theme.name} — {isAr ? 'معاينة' : 'Preview'}
                    </span>
                </div>

                {/* Device toggles */}
                <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 4 }}>
                    {[
                        { id: 'desktop', Icon: Monitor, label: isAr ? 'سطح المكتب' : 'Desktop' },
                        { id: 'tablet', Icon: Tablet, label: isAr ? 'تابلت' : 'Tablet' },
                        { id: 'mobile', Icon: Smartphone, label: isAr ? 'جوال' : 'Mobile' },
                    ].map(({ id, Icon, label }) => (
                        <button key={id} onClick={() => onDeviceChange(id as any)} style={{
                            padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                            background: device === id ? '#6C3CE1' : 'transparent',
                            color: device === id ? 'white' : '#9CA3AF',
                            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                            fontFamily: 'inherit', transition: 'all 0.2s',
                        }}>
                            <Icon size={14} />{label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onApply} disabled={isActive} style={{
                        padding: '9px 22px', borderRadius: 10, border: 'none',
                        background: isActive ? '#2A2A3E' : '#6C3CE1', color: isActive ? '#6C3CE160' : 'white',
                        fontWeight: 700, fontSize: 14, cursor: isActive ? 'default' : 'pointer',
                        fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
                        boxShadow: isActive ? 'none' : '0 4px 16px rgba(108,60,225,0.4)',
                    }}>
                        {isActive ? <><Check size={15} />{isAr ? 'مُطبّق' : 'Applied'}</> : <><Download size={15} />{isAr ? 'تطبيق القالب' : 'Apply Theme'}</>}
                    </button>
                </div>
            </div>

            {/* Preview body */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, background: '#11111F' }}>
                <div style={{
                    width: deviceWidth[device], maxWidth: '100%',
                    background: 'white',
                    borderRadius: device !== 'desktop' ? 20 : 12,
                    overflow: 'hidden',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                    border: device !== 'desktop' ? '8px solid #2A2A3E' : '1px solid #2A2A3E',
                    minHeight: 600,
                    transition: 'all 0.3s ease',
                    direction: dir as any,
                }}>
                    <ThemeColorPreview theme={theme} size="large" />
                    {/* Info section */}
                    <div style={{ padding: 28 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>{isAr ? theme.nameAr : theme.name}</h2>
                        <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                            {isAr ? theme.descriptionAr : theme.description}
                        </p>

                        {/* Stats row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                            {[
                                { label: isAr ? 'الأداء' : 'Performance', value: `${theme.performance}%`, color: '#10B981' },
                                { label: isAr ? 'عدد التثبيتات' : 'Installs', value: theme.installs.toLocaleString(), color: '#6C3CE1' },
                                { label: isAr ? 'التقييم' : 'Rating', value: `${theme.rating}/5`, color: '#F59E0B' },
                            ].map(stat => (
                                <div key={stat.label} style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', border: '1px solid #E5E7EB' }}>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Features */}
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em', marginBottom: 12, textTransform: 'uppercase' }}>
                                {isAr ? 'الميزات' : 'Features'}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {theme.features.map(f => <FeatureIcon key={f} type={f} lang={lang} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Apply Confirmation Modal ─────────────────────────────────────────────────
function ApplyModal({ theme, lang, dir, applying, onConfirm, onCancel }: {
    theme: Theme
    lang: string
    dir: string
    applying: boolean
    onConfirm: () => void
    onCancel: () => void
}) {
    const isAr = lang === 'ar'
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
        }}>
            <div dir={dir as any} style={{
                background: 'white', borderRadius: 20, padding: 36, maxWidth: 440, width: '100%',
                boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
                animation: 'slideUp 0.25s ease',
            }}>
                <div style={{
                    width: 56, height: 56, borderRadius: 14, background: '#EDE7FA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                }}>
                    <Sparkles size={24} color="#6C3CE1" />
                </div>

                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#111', marginBottom: 8 }}>
                    {isAr ? 'تطبيق القالب؟' : 'Apply this theme?'}
                </h2>
                <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                    {isAr
                        ? `هل أنت متأكد أنك تريد تطبيق قالب "${theme.nameAr}" على متجرك؟`
                        : `Are you sure you want to apply the "${theme.name}" theme to your store?`}
                </p>

                <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '14px 16px', marginBottom: 24, border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: `${theme.accent_color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 20, height: 20, borderRadius: 4, background: theme.accent_color }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{isAr ? theme.nameAr : theme.name}</div>
                            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{isAr ? theme.style_type_ar : theme.style_type} · {theme.is_free ? (isAr ? 'مجاني' : 'Free') : `${theme.price} ${isAr ? 'د.أ' : 'JOD'}`}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '11px 0', borderRadius: 10, border: '1.5px solid #E5E7EB',
                        background: 'transparent', color: '#374151', fontWeight: 600, fontSize: 14,
                        cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button onClick={onConfirm} disabled={applying} style={{
                        flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
                        background: applying ? '#9B59D9' : '#6C3CE1', color: 'white',
                        fontWeight: 800, fontSize: 14, cursor: applying ? 'default' : 'pointer',
                        fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 4px 16px rgba(108,60,225,0.35)', transition: 'background 0.2s',
                    }}>
                        {applying
                            ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{isAr ? 'جاري التطبيق...' : 'Applying...'}</>
                            : <><Check size={16} />{isAr ? 'تطبيق القالب' : 'Apply Theme'}</>
                        }
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    )
}
