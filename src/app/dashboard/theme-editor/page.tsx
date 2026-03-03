'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Save, Eye, Upload, History, Monitor, Smartphone,
    Plus, GripVertical, Trash2, ChevronRight, ChevronDown,
    ArrowRight, Palette, Type, Layout, Image, AlignCenter,
    LayoutGrid, Megaphone, Star, Timer, Code2, Layers,
    X, Check, RotateCcw, Settings, ExternalLink
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ThemeSection {
    id: string
    type: string
    settings: Record<string, any>
    mobile?: Record<string, any>
}

export interface NavLink {
    label: string
    url: string
    type: 'builtin' | 'page'
}

export interface ThemeGlobal {
    primary_color: string
    secondary_color: string
    font_family: string
    border_radius: number
    layout: 'rtl' | 'ltr'
    header_sticky: boolean
    show_announcement: boolean
    announcement_text_ar: string
    nav_links: NavLink[]
}

export interface ThemeConfig {
    version: number
    global: ThemeGlobal
    sections: ThemeSection[]
}

const DEFAULT_THEME: ThemeConfig = {
    version: 2,
    global: {
        primary_color: '#6C3CE1',
        secondary_color: '#F59E0B',
        font_family: 'Tajawal',
        border_radius: 12,
        layout: 'rtl',
        header_sticky: true,
        show_announcement: false,
        announcement_text_ar: 'شحن مجاني على الطلبات فوق 20 د.أ',
        nav_links: [
            { label: 'الرئيسية', url: '/', type: 'builtin' },
            { label: 'المنتجات', url: '/products', type: 'builtin' },
        ],
    },
    sections: [],
}

// ─── Block Library ────────────────────────────────────────────────────────────
const BLOCK_TYPES = [
    { type: 'hero_banner', label: 'بنر رئيسي', icon: Image, color: '#6C3CE1', description: 'صورة كبيرة مع عنوان وزر' },
    { type: 'featured_products', label: 'منتجات مميزة', icon: LayoutGrid, color: '#10B981', description: 'شبكة منتجات مختارة' },
    { type: 'product_slider', label: 'شريط منتجات', icon: AlignCenter, color: '#3B82F6', description: 'تمرير أفقي للمنتجات' },
    { type: 'countdown_timer', label: 'عداد تنازلي', icon: Timer, color: '#EF4444', description: 'عرض لفترة محدودة' },
    { type: 'testimonials', label: 'آراء العملاء', icon: Star, color: '#F59E0B', description: 'تقييمات ومراجعات' },
    { type: 'rich_text', label: 'نص وصور', icon: Type, color: '#8B5CF6', description: 'محتوى نصي حر' },
    { type: 'collections_grid', label: 'شبكة التصنيفات', icon: Layers, color: '#EC4899', description: 'عرض التصنيفات بصورها' },
    { type: 'announcement_bar', label: 'شريط إعلاني', icon: Megaphone, color: '#0EA5E9', description: 'شريط علوي مثبت' },
    { type: 'custom_html', label: 'HTML مخصص', icon: Code2, color: '#6B7280', description: 'كود HTML/CSS/JS' },
]

// Default settings per block type
function defaultSettingsFor(type: string): Record<string, any> {
    switch (type) {
        case 'hero_banner':
            return {
                title_ar: 'مرحباً بك في متجرنا',
                subtitle_ar: 'اكتشف أجمل المنتجات بأفضل الأسعار',
                cta_text_ar: 'تسوق الآن',
                cta_url: '/products',
                image_url: '',
                height: '480px',
                overlay_opacity: 0.4,
                text_align: 'center',
                text_color: '#FFFFFF',
            }
        case 'featured_products':
            return { title_ar: 'منتجات مميزة', columns: 4, show_price: true, show_rating: true, product_ids: [] }
        case 'product_slider':
            return { title_ar: 'وصل حديثاً', show_all_link: true }
        case 'countdown_timer':
            return { title_ar: 'عرض محدود الوقت!', end_date: '', background_color: '#EF4444', text_color: '#FFFFFF' }
        case 'testimonials':
            return { title_ar: 'ماذا يقول عملاؤنا', items: [] }
        case 'rich_text':
            return { content_ar: 'أضف نصك هنا...', text_align: 'center' }
        case 'collections_grid':
            return { title_ar: 'تصفح التصنيفات', columns: 3 }
        case 'announcement_bar':
            return { text_ar: 'شحن مجاني على الطلبات فوق 20 د.أ', background_color: '#6C3CE1', text_color: '#FFFFFF' }
        case 'custom_html':
            return { html: '<p>أضف كودك هنا</p>', css: '' }
        default:
            return {}
    }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ThemeEditorPage() {
    const supabase = createClient()
    const router = useRouter()

    const [storeId, setStoreId] = useState<string | null>(null)
    const [storeSlug, setStoreSlug] = useState<string>('')
    const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME)
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
    const [activePanel, setActivePanel] = useState<'blocks' | 'global' | 'history'>('blocks')
    const [versions, setVersions] = useState<any[]>([])
    const [storePages, setStorePages] = useState<any[]>([])
    const [storeProducts, setStoreProducts] = useState<any[]>([])
    const [saving, setSaving] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
    const dragSectionRef = useRef<number | null>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    // ──── Load store + theme ────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const { data: stores } = await supabase.from('stores').select('id, slug, theme').eq('user_id', user.id).limit(1)
            if (!stores || stores.length === 0) { setLoading(false); return }

            const store = stores[0]
            setStoreId(store.id)
            setStoreSlug(store.slug)

            if (store.theme && store.theme.sections) {
                setTheme({ ...DEFAULT_THEME, ...store.theme, global: { ...DEFAULT_THEME.global, ...store.theme.global } })
            }

            // Load published pages for nav
            const { data: pages } = await supabase
                .from('store_pages')
                .select('id, title_ar, slug, is_published')
                .eq('store_id', store.id)
                .eq('is_published', true)
                .order('created_at')
            setStorePages(pages || [])

            // Load products for section picker
            const { data: prods } = await supabase
                .from('products')
                .select('id, name_ar, price, images')
                .eq('store_id', store.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(50)
            setStoreProducts(prods || [])

            // Load version history
            const { data: vers } = await supabase
                .from('theme_versions')
                .select('id, label, created_at, is_draft')
                .eq('store_id', store.id)
                .order('created_at', { ascending: false })
                .limit(10)
            if (vers) setVersions(vers)

            setLoading(false)
        }
        load()
    }, [supabase, router])

    // ──── Send theme to iframe preview ──────────────────────────────────────
    useEffect(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'THEME_UPDATE', theme }, '*')
        }
    }, [theme])

    // ──── Drag & Drop sections ──────────────────────────────────────────────
    const moveSection = (fromIndex: number, toIndex: number) => {
        const sections = [...theme.sections]
        const [moved] = sections.splice(fromIndex, 1)
        sections.splice(toIndex, 0, moved)
        setTheme(prev => ({ ...prev, sections }))
    }

    const addSection = (type: string) => {
        const newSection: ThemeSection = {
            id: `${type}-${Date.now()}`,
            type,
            settings: defaultSettingsFor(type),
        }
        setTheme(prev => ({ ...prev, sections: [...prev.sections, newSection] }))
        setSelectedSectionId(newSection.id)
        setActivePanel('blocks')
    }

    const removeSection = (id: string) => {
        setTheme(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }))
        if (selectedSectionId === id) setSelectedSectionId(null)
    }

    const updateSectionSetting = (sectionId: string, key: string, value: any) => {
        setTheme(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.id === sectionId ? { ...s, settings: { ...s.settings, [key]: value } } : s
            )
        }))
    }

    const updateGlobal = (key: keyof ThemeGlobal, value: any) => {
        setTheme(prev => ({ ...prev, global: { ...prev.global, [key]: value } }))
    }

    // ──── Save draft ────────────────────────────────────────────────────────
    const saveDraft = async () => {
        if (!storeId) return
        setSaving(true)
        try {
            const { error } = await supabase.from('theme_versions').insert({
                store_id: storeId,
                label: `مسودة — ${new Date().toLocaleString('ar-JO')}`,
                theme_config: theme,
                is_draft: true,
            })
            if (error) throw error
            toast.success('تم حفظ المسودة')
            // Reload versions
            const { data: vers } = await supabase.from('theme_versions').select('id, label, created_at, is_draft').eq('store_id', storeId).order('created_at', { ascending: false }).limit(10)
            if (vers) setVersions(vers)
        } catch (err: any) {
            toast.error('خطأ في حفظ المسودة')
        } finally {
            setSaving(false)
        }
    }

    // ──── Publish theme ─────────────────────────────────────────────────────
    const publishTheme = async () => {
        if (!storeId) return
        setPublishing(true)
        try {
            const { error } = await supabase.from('stores').update({ theme }).eq('id', storeId)
            if (error) throw error
            // Also save published version snapshot
            await supabase.from('theme_versions').insert({
                store_id: storeId,
                label: `منشور — ${new Date().toLocaleString('ar-JO')}`,
                theme_config: theme,
                is_draft: false,
            })
            toast.success('🎉 تم نشر القالب بنجاح!')
        } catch (err: any) {
            toast.error('خطأ في نشر القالب')
        } finally {
            setPublishing(false)
        }
    }

    // ──── Restore version ───────────────────────────────────────────────────
    const restoreVersion = async (versionId: string) => {
        const { data } = await supabase.from('theme_versions').select('theme_config').eq('id', versionId).single()
        if (data?.theme_config) {
            setTheme(data.theme_config as ThemeConfig)
            toast.success('تم استعادة الإصدار')
        }
    }

    const selectedSection = theme.sections.find(s => s.id === selectedSectionId)

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--background)' }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0F0F17' }}>

            {/* ── Top Bar ─────────────────────────────────────────────────── */}
            <header style={{
                height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', background: '#1A1A2E', borderBottom: '1px solid #2D2D44', flexShrink: 0, gap: 12,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={() => router.push('/dashboard')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 10px', borderRadius: 8 }}
                    >
                        <ArrowRight size={16} />
                        العودة
                    </button>
                    <div style={{ width: 1, height: 20, background: '#2D2D44' }} />
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#F9FAFB' }}>محرر القوالب</span>
                </div>

                {/* Preview mode toggle */}
                <div style={{ display: 'flex', gap: 4, background: '#0F0F17', borderRadius: 10, padding: 4 }}>
                    {[{ mode: 'desktop' as const, Icon: Monitor, label: 'سطح المكتب' }, { mode: 'mobile' as const, Icon: Smartphone, label: 'الجوال' }].map(({ mode, Icon, label }) => (
                        <button key={mode} onClick={() => setPreviewMode(mode)} title={label} style={{
                            padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                            background: previewMode === mode ? '#6C3CE1' : 'transparent',
                            color: previewMode === mode ? 'white' : '#9CA3AF',
                            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'inherit',
                        }}>
                            <Icon size={15} />{label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {storeSlug && (
                        <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9CA3AF', fontSize: 12, textDecoration: 'none', padding: '6px 10px', borderRadius: 8, border: '1px solid #2D2D44' }}>
                            <ExternalLink size={13} /> عرض المتجر
                        </a>
                    )}
                    <button onClick={saveDraft} disabled={saving}
                        style={{ padding: '7px 16px', borderRadius: 9, border: '1px solid #2D2D44', background: 'transparent', color: '#D1D5DB', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Save size={14} />{saving ? '...' : 'حفظ مسودة'}
                    </button>
                    <button onClick={publishTheme} disabled={publishing}
                        style={{ padding: '7px 18px', borderRadius: 9, border: 'none', background: publishing ? '#4B2F99' : '#6C3CE1', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(108,60,225,0.4)' }}>
                        <Upload size={14} />{publishing ? 'جاري النشر...' : 'نشر القالب'}
                    </button>
                </div>
            </header>

            {/* ── Main 3-Panel Layout ─────────────────────────────────────── */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ── Left Panel: Block Library + Global + History ────────── */}
                <aside style={{
                    width: 280, background: '#1A1A2E', borderLeft: '1px solid #2D2D44',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
                    order: 1  /* RTL: sidebar on right visually but left in DOM for RTL flow */
                }}>
                    {/* Panel tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #2D2D44' }}>
                        {[
                            { key: 'blocks', label: 'القسمات', Icon: Layers },
                            { key: 'global', label: 'النمط', Icon: Palette },
                            { key: 'history', label: 'السجل', Icon: History },
                        ].map(({ key, label, Icon }) => (
                            <button key={key} onClick={() => setActivePanel(key as any)} style={{
                                flex: 1, padding: '12px 4px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                                fontSize: 12, fontWeight: 600, color: activePanel === key ? '#6C3CE1' : '#6B7280',
                                borderBottom: `2px solid ${activePanel === key ? '#6C3CE1' : 'transparent'}`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.2s',
                            }}>
                                <Icon size={15} />{label}
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>

                        {/* BLOCKS PANEL */}
                        {activePanel === 'blocks' && (
                            <div>
                                <p style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 12, fontWeight: 600, letterSpacing: '0.05em' }}>
                                    انقر لإضافة قسم إلى المتجر
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {BLOCK_TYPES.map((block) => {
                                        const Icon = block.icon
                                        return (
                                            <button key={block.type} onClick={() => addSection(block.type)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                                    borderRadius: 10, border: '1px solid #2D2D44', background: '#0F0F17',
                                                    cursor: 'pointer', width: '100%', textAlign: 'right', fontFamily: 'inherit',
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = block.color; (e.currentTarget as HTMLElement).style.background = '#16213E' }}
                                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2D2D44'; (e.currentTarget as HTMLElement).style.background = '#0F0F17' }}
                                            >
                                                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${block.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Icon size={17} color={block.color} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F9FAFB' }}>{block.label}</div>
                                                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{block.description}</div>
                                                </div>
                                                <Plus size={14} color="#6B7280" />
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Current sections list */}
                                {theme.sections.length > 0 && (
                                    <div style={{ marginTop: 20 }}>
                                        <p style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em' }}>
                                            أقسام الصفحة ({theme.sections.length})
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {theme.sections.map((section, index) => {
                                                const blockDef = BLOCK_TYPES.find(b => b.type === section.type)
                                                const Icon = blockDef?.icon || Layout
                                                const isSelected = selectedSectionId === section.id
                                                return (
                                                    <div key={section.id}
                                                        draggable
                                                        onDragStart={() => { dragSectionRef.current = index }}
                                                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
                                                        onDrop={() => {
                                                            if (dragSectionRef.current !== null) {
                                                                moveSection(dragSectionRef.current, index)
                                                                dragSectionRef.current = null
                                                                setDragOverIndex(null)
                                                            }
                                                        }}
                                                        onDragEnd={() => setDragOverIndex(null)}
                                                        onClick={() => { setSelectedSectionId(section.id) }}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                                                            borderRadius: 8, cursor: 'grab',
                                                            background: isSelected ? 'rgba(108,60,225,0.15)' : 'transparent',
                                                            border: `1px solid ${isSelected ? 'rgba(108,60,225,0.4)' : 'transparent'}`,
                                                            outline: dragOverIndex === index ? '1px dashed #6C3CE1' : 'none',
                                                            transition: 'all 0.15s',
                                                        }}
                                                    >
                                                        <GripVertical size={14} color="#4B5563" style={{ flexShrink: 0 }} />
                                                        <Icon size={14} color={blockDef?.color || '#9CA3AF'} />
                                                        <span style={{ fontSize: 12, color: '#D1D5DB', flex: 1, fontWeight: 500 }}>{blockDef?.label || section.type}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); removeSection(section.id) }}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: 2, display: 'flex' }}>
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* GLOBAL STYLES PANEL */}
                        {activePanel === 'global' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <p style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em' }}>إعدادات النمط العام</p>

                                <SettingInput label="اللون الرئيسي" type="color" value={theme.global.primary_color}
                                    onChange={(v) => updateGlobal('primary_color', v)} />
                                <SettingInput label="اللون الثانوي" type="color" value={theme.global.secondary_color}
                                    onChange={(v) => updateGlobal('secondary_color', v)} />

                                <div>
                                    <label style={labelStyle}>الخط</label>
                                    <select value={theme.global.font_family} onChange={(e) => updateGlobal('font_family', e.target.value)} style={selectStyle}>
                                        {['Tajawal', 'Noto Sans Arabic', 'IBM Plex Arabic', 'Cairo', 'Amiri'].map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={labelStyle}>نصف قطر الزوايا ({theme.global.border_radius}px)</label>
                                    <input type="range" min={0} max={24} value={theme.global.border_radius}
                                        onChange={(e) => updateGlobal('border_radius', parseInt(e.target.value))}
                                        style={{ width: '100%', accentColor: '#6C3CE1' }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#0F0F17', borderRadius: 8, border: '1px solid #2D2D44' }}>
                                    <span style={{ fontSize: 13, color: '#D1D5DB' }}>الهيدر مثبت</span>
                                    <Toggle value={theme.global.header_sticky} onChange={(v) => updateGlobal('header_sticky', v)} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#0F0F17', borderRadius: 8, border: '1px solid #2D2D44' }}>
                                    <span style={{ fontSize: 13, color: '#D1D5DB' }}>شريط الإعلان</span>
                                    <Toggle value={theme.global.show_announcement} onChange={(v) => updateGlobal('show_announcement', v)} />
                                </div>

                                {theme.global.show_announcement && (
                                    <SettingInput label="نص الإعلان" type="text" value={theme.global.announcement_text_ar}
                                        onChange={(v) => updateGlobal('announcement_text_ar', v)} />
                                )}

                                {/* ── Navigation Links ─────────────────────── */}
                                <div style={{ borderTop: '1px solid #2D2D44', paddingTop: 16 }}>
                                    <p style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 12 }}>روابط التنقل (الهيدر)</p>

                                    {/* Built-in links */}
                                    {[{ label: 'الرئيسية', url: '/' }, { label: 'المنتجات', url: '/products' }].map(link => {
                                        const navLinks: NavLink[] = theme.global.nav_links || []
                                        const active = navLinks.some(nl => nl.url === link.url)
                                        return (
                                            <div key={link.url} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#0F0F17', borderRadius: 8, border: '1px solid #2D2D44', marginBottom: 6 }}>
                                                <div>
                                                    <div style={{ fontSize: 12, color: '#D1D5DB', fontWeight: 600 }}>{link.label}</div>
                                                    <div style={{ fontSize: 10, color: '#4B5563', marginTop: 1 }}>رابط أساسي</div>
                                                </div>
                                                <Toggle value={active} onChange={v => {
                                                    const current = theme.global.nav_links || []
                                                    if (v) {
                                                        updateGlobal('nav_links', [...current, { label: link.label, url: link.url, type: 'builtin' as const }])
                                                    } else {
                                                        updateGlobal('nav_links', current.filter((nl: NavLink) => nl.url !== link.url))
                                                    }
                                                }} />
                                            </div>
                                        )
                                    })}

                                    {/* CMS Pages */}
                                    {storePages.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '16px 0', color: '#4B5563', fontSize: 12 }}>
                                            لا توجد صفحات منشورة بعد.<br />
                                            <a href="/dashboard/pages" style={{ color: '#6C3CE1', textDecoration: 'none', fontWeight: 600 }}>أنشئ صفحة الآن</a>
                                        </div>
                                    ) : storePages.map((page: any) => {
                                        const navLinks: NavLink[] = theme.global.nav_links || []
                                        const pageUrl = `/p/${page.slug}`
                                        const active = navLinks.some(nl => nl.url === pageUrl)
                                        return (
                                            <div key={page.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#0F0F17', borderRadius: 8, border: '1px solid #2D2D44', marginBottom: 6 }}>
                                                <div>
                                                    <div style={{ fontSize: 12, color: '#D1D5DB', fontWeight: 600 }}>{page.title_ar}</div>
                                                    <div style={{ fontSize: 10, color: '#4B5563', marginTop: 1 }}>/p/{page.slug}</div>
                                                </div>
                                                <Toggle value={active} onChange={v => {
                                                    const current = theme.global.nav_links || []
                                                    if (v) {
                                                        updateGlobal('nav_links', [...current, { label: page.title_ar, url: pageUrl, type: 'page' as const }])
                                                    } else {
                                                        updateGlobal('nav_links', current.filter((nl: NavLink) => nl.url !== pageUrl))
                                                    }
                                                }} />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* HISTORY PANEL */}
                        {activePanel === 'history' && (
                            <div>
                                <p style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 12 }}>سجل الإصدارات</p>
                                {versions.length === 0 && (
                                    <p style={{ color: '#4B5563', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>لا توجد إصدارات محفوظة</p>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {versions.map((v) => (
                                        <div key={v.id} style={{ padding: '10px 12px', borderRadius: 8, background: '#0F0F17', border: '1px solid #2D2D44' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <div style={{ fontSize: 12, color: '#D1D5DB', fontWeight: 600 }}>{v.label}</div>
                                                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                                                        {new Date(v.created_at).toLocaleString('ar-JO')}
                                                    </div>
                                                </div>
                                                <span style={{
                                                    fontSize: 10, padding: '2px 7px', borderRadius: 100, fontWeight: 700,
                                                    background: v.is_draft ? '#FEF3C720' : '#D1FAE520',
                                                    color: v.is_draft ? '#F59E0B' : '#10B981',
                                                }}>
                                                    {v.is_draft ? 'مسودة' : 'منشور'}
                                                </span>
                                            </div>
                                            <button onClick={() => restoreVersion(v.id)}
                                                style={{ marginTop: 8, fontSize: 11, color: '#6C3CE1', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                                                <RotateCcw size={11} /> استعادة هذا الإصدار
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── Center Panel: Preview ───────────────────────────────── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0D0D14', overflow: 'auto', padding: 20, order: 2 }}>
                    <div style={{
                        width: previewMode === 'mobile' ? 390 : '100%',
                        maxWidth: previewMode === 'mobile' ? 390 : 1200,
                        minHeight: previewMode === 'mobile' ? '844px' : 600,
                        background: 'white',
                        borderRadius: previewMode === 'mobile' ? 20 : 12,
                        overflow: 'visible',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        border: previewMode === 'mobile' ? '8px solid #1A1A2E' : '1px solid #2D2D44',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                    }}>
                        <ThemePreviewCanvas theme={theme} selectedSectionId={selectedSectionId} onSelectSection={setSelectedSectionId} />
                    </div>
                </div>

                {/* ── Right Panel: Section Settings ───────────────────────── */}
                <aside style={{
                    width: 300, background: '#1A1A2E', borderRight: '1px solid #2D2D44',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, order: 3
                }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #2D2D44' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Settings size={15} color="#6C3CE1" />
                            {selectedSection ? `إعدادات: ${BLOCK_TYPES.find(b => b.type === selectedSection.type)?.label || selectedSection.type}` : 'حدد قسماً لتعديله'}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
                        {!selectedSection && (
                            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#4B5563' }}>
                                <Layers size={32} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
                                <p style={{ fontSize: 13 }}>انقر على قسم في القائمة أو في المعاينة لتعديل إعداداته</p>
                            </div>
                        )}

                        {selectedSection && (
                            <SectionSettingsPanel
                                section={selectedSection}
                                onChange={(key, value) => updateSectionSetting(selectedSection.id, key, value)}
                                storeProducts={storeProducts}
                            />
                        )}
                    </div>
                </aside>
            </div>
        </div>
    )
}

// ─── Inline Preview Canvas ────────────────────────────────────────────────────
function ThemePreviewCanvas({ theme, selectedSectionId, onSelectSection }: {
    theme: ThemeConfig
    selectedSectionId: string | null
    onSelectSection: (id: string) => void
}) {
    const { global: g, sections } = theme
    const primaryColor = g.primary_color

    return (
        <div style={{ fontFamily: `${g.font_family}, Tajawal, sans-serif`, direction: 'rtl', minHeight: '100%' }}>
            {/* Announcement bar */}
            {g.show_announcement && (
                <div style={{ background: primaryColor, color: 'white', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>
                    {g.announcement_text_ar}
                </div>
            )}
            {/* Header */}
            <header style={{
                background: 'white', borderBottom: '1px solid #E5E7EB', padding: '12px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                position: g.header_sticky ? 'sticky' : 'static', top: 0, zIndex: 10,
            }}>
                <div style={{ fontWeight: 900, fontSize: 20, color: primaryColor }}>متجرك</div>
                <nav style={{ display: 'flex', gap: 20 }}>
                    {['الرئيسية', 'المنتجات', 'عن المتجر'].map(l => (
                        <a key={l} style={{ color: '#374151', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>{l}</a>
                    ))}
                </nav>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛒</div>
                </div>
            </header>

            {/* Sections */}
            {sections.length === 0 && (
                <div style={{ padding: 60, textAlign: 'center', background: '#F9FAFB', color: '#9CA3AF' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🎨</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>ابدأ بتصميم متجرك</div>
                    <div style={{ fontSize: 13 }}>اختر قسمات من اللوحة اليسرى لإضافتها هنا</div>
                </div>
            )}

            {sections.map((section) => (
                <div key={section.id}
                    onClick={() => onSelectSection(section.id)}
                    style={{
                        outline: selectedSectionId === section.id ? `2px solid ${primaryColor}` : '2px solid transparent',
                        outlineOffset: -2,
                        cursor: 'pointer',
                        transition: 'outline 0.15s',
                        position: 'relative',
                    }}
                >
                    {selectedSectionId === section.id && (
                        <div style={{ position: 'absolute', top: 6, right: 6, zIndex: 10, background: primaryColor, color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            {BLOCK_TYPES.find(b => b.type === section.type)?.label}
                        </div>
                    )}
                    <SectionPreview section={section} primaryColor={primaryColor} borderRadius={g.border_radius} />
                </div>
            ))}

            {/* Footer preview */}
            {sections.length > 0 && (
                <footer style={{ background: '#111827', color: '#9CA3AF', padding: '32px 24px', textAlign: 'center', marginTop: 'auto' }}>
                    <div style={{ fontWeight: 800, color: 'white', marginBottom: 8, fontSize: 16 }}>متجرك</div>
                    <p style={{ fontSize: 12 }}>جميع الحقوق محفوظة © 2025</p>
                </footer>
            )}
        </div>
    )
}

// ─── Section Preview Renderer ─────────────────────────────────────────────────
function SectionPreview({ section, primaryColor, borderRadius }: { section: ThemeSection; primaryColor: string; borderRadius: number }) {
    const s = section.settings

    switch (section.type) {
        case 'hero_banner':
            return (
                <div style={{
                    minHeight: s.height || '400px', background: s.image_url ? `linear-gradient(rgba(0,0,0,${s.overlay_opacity || 0.4}), rgba(0,0,0,${s.overlay_opacity || 0.4})), url(${s.image_url}) center/cover` : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: s.text_align || 'center',
                }}>
                    <h1 style={{ color: s.text_color || '#fff', fontSize: 32, fontWeight: 900, marginBottom: 12, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{s.title_ar || 'عنوان البنر'}</h1>
                    <p style={{ color: `${s.text_color || '#fff'}cc`, fontSize: 15, marginBottom: 24 }}>{s.subtitle_ar}</p>
                    {s.cta_text_ar && (
                        <button style={{ background: 'white', color: primaryColor, padding: '12px 32px', borderRadius: borderRadius, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'default', fontFamily: 'inherit' }}>
                            {s.cta_text_ar}
                        </button>
                    )}
                </div>
            )

        case 'featured_products':
            return (
                <div style={{ padding: '40px 24px' }}>
                    {s.title_ar && <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: 22, fontWeight: 800, color: '#111827' }}>{s.title_ar}</h2>}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(s.columns || 4, 4)}, 1fr)`, gap: 16 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} style={{ background: '#F9FAFB', borderRadius: borderRadius, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                                <div style={{ height: 140, background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🛍️</div>
                                <div style={{ padding: '12px 14px' }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#111827' }}>اسم المنتج {i + 1}</div>
                                    {s.show_price && <div style={{ color: primaryColor, fontWeight: 800, fontSize: 14 }}>12.500 د.أ</div>}
                                    {s.show_rating && <div style={{ color: '#F59E0B', fontSize: 11, marginTop: 4 }}>★★★★★</div>}
                                    <button style={{ marginTop: 8, width: '100%', background: primaryColor, color: 'white', border: 'none', borderRadius: borderRadius - 4, padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'default', fontFamily: 'inherit' }}>
                                        أضف للسلة
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'product_slider':
            return (
                <div style={{ padding: '32px 0' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: 20, fontSize: 20, fontWeight: 800, color: '#111827' }}>{s.title_ar || 'وصل حديثاً'}</h2>
                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '8px 24px', scrollbarWidth: 'none' }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} style={{ minWidth: 180, borderRadius: borderRadius, background: '#F9FAFB', border: '1px solid #E5E7EB', overflow: 'hidden', flexShrink: 0 }}>
                                <div style={{ height: 120, background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🛍️</div>
                                <div style={{ padding: '10px 12px' }}>
                                    <div style={{ fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 4 }}>منتج {i + 1}</div>
                                    <div style={{ color: primaryColor, fontWeight: 700, fontSize: 13 }}>9.990 د.أ</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'countdown_timer':
            return (
                <div style={{ background: s.background_color || primaryColor, padding: '32px 24px', textAlign: 'center' }}>
                    <h2 style={{ color: s.text_color || 'white', fontSize: 20, fontWeight: 800, marginBottom: 16 }}>{s.title_ar || 'عرض محدود!'}</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                        {[{ v: '02', l: 'يوم' }, { v: '14', l: 'ساعة' }, { v: '37', l: 'دقيقة' }, { v: '22', l: 'ثانية' }].map(({ v, l }) => (
                            <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '12px 16px', minWidth: 60 }}>
                                <div style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>{v}</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'testimonials':
            return (
                <div style={{ padding: '40px 24px', background: '#F9FAFB' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: 20, fontWeight: 800 }}>{s.title_ar || 'آراء العملاء'}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {[{ name: 'أحمد محمد', text: 'منتجات ممتازة وتوصيل سريع!', stars: 5 }, { name: 'فاطمة علي', text: 'تجربة تسوق رائعة', stars: 5 }, { name: 'خالد سامي', text: 'سعر مناسب وجودة عالية', stars: 4 }].map((t) => (
                            <div key={t.name} style={{ background: 'white', borderRadius: borderRadius, padding: 16, border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ color: '#F59E0B', fontSize: 14, marginBottom: 8 }}>{'★'.repeat(t.stars)}</div>
                                <p style={{ fontSize: 13, color: '#374151', marginBottom: 10, lineHeight: 1.6 }}>"{t.text}"</p>
                                <div style={{ fontWeight: 700, fontSize: 12, color: '#6B7280' }}>— {t.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'rich_text':
            return (
                <div style={{ padding: '40px 24px', textAlign: s.text_align || 'center', maxWidth: 600, margin: '0 auto' }}>
                    <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>{s.content_ar || 'محتوى نصي...'}</p>
                </div>
            )

        case 'collections_grid':
            return (
                <div style={{ padding: '40px 24px' }}>
                    {s.title_ar && <h2 style={{ textAlign: 'center', marginBottom: 20, fontSize: 20, fontWeight: 800 }}>{s.title_ar}</h2>}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${s.columns || 3}, 1fr)`, gap: 16 }}>
                        {['أزياء', 'إلكترونيات', 'أكسسوارات'].map((name) => (
                            <div key={name} style={{ borderRadius: borderRadius, overflow: 'hidden', position: 'relative', aspectRatio: '1', background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}40)`, display: 'flex', alignItems: 'flex-end' }}>
                                <div style={{ width: '100%', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: 12 }}>
                                    <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'announcement_bar':
            return (
                <div style={{ background: s.background_color || primaryColor, color: s.text_color || 'white', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>
                    📢 {s.text_ar || 'نص الإعلان هنا'}
                </div>
            )

        case 'custom_html':
            return (
                <div style={{ padding: '20px 24px', background: '#F9FAFB', border: '2px dashed #E5E7EB' }}>
                    <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>
                        <Code2 size={24} style={{ margin: '0 auto 8px', display: 'block' }} /> كود HTML مخصص
                    </div>
                </div>
            )

        default:
            return <div style={{ padding: 24, background: '#F9FAFB', fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>قسم: {section.type}</div>
    }
}

// ─── Section Settings Panel ───────────────────────────────────────────────────
function SectionSettingsPanel({ section, onChange, storeProducts }: { section: ThemeSection; onChange: (key: string, value: any) => void; storeProducts: any[] }) {
    const s = section.settings
    const dragProductRef = useRef<number | null>(null)

    // Product picker reorder
    const moveProduct = (ids: string[], from: number, to: number) => {
        const arr = [...ids]
        const [moved] = arr.splice(from, 1)
        arr.splice(to, 0, moved)
        return arr
    }

    const fields: Array<{ key: string; label: string; type: string; options?: string[] }> = []

    switch (section.type) {
        case 'hero_banner':
            fields.push(
                { key: 'title_ar', label: 'العنوان الرئيسي', type: 'text' },
                { key: 'subtitle_ar', label: 'العنوان الفرعي', type: 'text' },
                { key: 'cta_text_ar', label: 'نص الزر', type: 'text' },
                { key: 'cta_url', label: 'رابط الزر', type: 'text' },
                { key: 'image_url', label: 'رابط الصورة', type: 'text' },
                { key: 'height', label: 'الارتفاع', type: 'text' },
                { key: 'text_color', label: 'لون النص', type: 'color' },
                { key: 'overlay_opacity', label: 'شفافية التعتيم', type: 'range' },
                { key: 'text_align', label: 'محاذاة النص', type: 'select', options: ['right', 'center', 'left'] },
            )
            break
        case 'countdown_timer':
            fields.push(
                { key: 'title_ar', label: 'العنوان', type: 'text' },
                { key: 'end_date', label: 'تاريخ الانتهاء', type: 'datetime-local' },
                { key: 'background_color', label: 'لون الخلفية', type: 'color' },
                { key: 'text_color', label: 'لون النص', type: 'color' },
            )
            break
        case 'testimonials':
        case 'collections_grid':
        case 'rich_text':
            fields.push({ key: 'title_ar', label: 'العنوان', type: 'text' })
            if (section.type === 'rich_text') fields.push({ key: 'content_ar', label: 'النص', type: 'textarea' })
            if (section.type === 'collections_grid') fields.push({ key: 'columns', label: 'عدد الأعمدة', type: 'select', options: ['2', '3', '4'] })
            break
        case 'announcement_bar':
            fields.push(
                { key: 'text_ar', label: 'النص', type: 'text' },
                { key: 'background_color', label: 'لون الخلفية', type: 'color' },
                { key: 'text_color', label: 'لون النص', type: 'color' },
            )
            break
        case 'custom_html':
            fields.push(
                { key: 'html', label: 'كود HTML', type: 'textarea' },
                { key: 'css', label: 'كود CSS', type: 'textarea' },
            )
            break
    }

    const isProductSection = section.type === 'featured_products' || section.type === 'product_slider'
    const selectedIds: string[] = s.product_ids || []
    const orderedSelected = selectedIds
        .map(id => storeProducts.find(p => p.id === id))
        .filter(Boolean)
    const unselected = storeProducts.filter(p => !selectedIds.includes(p.id))

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Standard fields */}
            {isProductSection && (
                <>
                    <SettingInput label="العنوان" type="text" value={s.title_ar ?? ''} onChange={v => onChange('title_ar', v)} dark />
                    {section.type === 'featured_products' && (
                        <SettingInput label="عدد الأعمدة" type="select" value={String(s.columns ?? 4)} options={['2', '3', '4']} onChange={v => onChange('columns', parseInt(v))} dark />
                    )}

                    {/* ── Product Picker ────────────────────────────── */}
                    <div style={{ borderTop: '1px solid #2D2D44', paddingTop: 12, marginTop: 4 }}>
                        <p style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 10 }}>
                            المنتجات المختارة ({selectedIds.length}) — اسحب لإعادة الترتيب
                        </p>

                        {/* Selected products — draggable to reorder */}
                        {orderedSelected.length === 0 && (
                            <p style={{ color: '#4B5563', fontSize: 12, textAlign: 'center', padding: '8px 0', marginBottom: 8 }}>لم تختر أي منتج بعد</p>
                        )}
                        {orderedSelected.map((prod: any, i: number) => (
                            <div key={prod.id}
                                draggable
                                onDragStart={() => { dragProductRef.current = i }}
                                onDragOver={e => e.preventDefault()}
                                onDrop={() => {
                                    if (dragProductRef.current !== null && dragProductRef.current !== i) {
                                        onChange('product_ids', moveProduct(selectedIds, dragProductRef.current, i))
                                        dragProductRef.current = null
                                    }
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(108,60,225,0.1)', borderRadius: 8, border: '1px solid rgba(108,60,225,0.3)', marginBottom: 5, cursor: 'grab' }}
                            >
                                <GripVertical size={13} color="#6C3CE1" style={{ flexShrink: 0 }} />
                                <div style={{ width: 28, height: 28, borderRadius: 6, background: prod.images?.[0] ? `url(${prod.images[0]}) center/cover` : 'rgba(108,60,225,0.2)', flexShrink: 0 }} />
                                <span style={{ flex: 1, fontSize: 12, color: '#D1D5DB', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name_ar}</span>
                                <button onClick={() => onChange('product_ids', selectedIds.filter((id: string) => id !== prod.id))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 2, display: 'flex', flexShrink: 0 }}>
                                    <X size={13} />
                                </button>
                            </div>
                        ))}

                        {/* Unselected products */}
                        {unselected.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <p style={{ color: '#4B5563', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>أضف منتجات:</p>
                                <div style={{ maxHeight: 180, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {unselected.map((prod: any) => (
                                        <button key={prod.id} onClick={() => onChange('product_ids', [...selectedIds, prod.id])}
                                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#0F0F17', borderRadius: 8, border: '1px solid #2D2D44', cursor: 'pointer', width: '100%', textAlign: 'right', fontFamily: 'inherit' }}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#6C3CE1'}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#2D2D44'}
                                        >
                                            <div style={{ width: 28, height: 28, borderRadius: 6, background: prod.images?.[0] ? `url(${prod.images[0]}) center/cover` : '#1A1A2E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                                                {!prod.images?.[0] && '🛍️'}
                                            </div>
                                            <span style={{ flex: 1, fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name_ar}</span>
                                            <Plus size={13} color="#6C3CE1" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {storeProducts.length === 0 && (
                            <p style={{ color: '#4B5563', fontSize: 12, textAlign: 'center', padding: '8px 0' }}>لا توجد منتجات في متجرك بعد</p>
                        )}
                    </div>
                </>
            )}

            {!isProductSection && fields.map(({ key, label, type, options }) => (
                <SettingInput
                    key={key}
                    label={label}
                    type={type}
                    value={s[key] ?? ''}
                    options={options}
                    onChange={(v) => onChange(key, type === 'columns' ? parseInt(v) : v)}
                    dark
                />
            ))}
        </div>
    )
}

// ─── Shared sub-components ────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: '#9CA3AF', fontWeight: 600, marginBottom: 5 }
const selectStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', background: '#0F0F17', border: '1px solid #2D2D44', borderRadius: 8, color: '#D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', background: '#0F0F17', border: '1px solid #2D2D44', borderRadius: 8, color: '#D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none' }

function SettingInput({ label, type, value, onChange, options, dark }: { label: string; type: string; value: any; onChange: (v: any) => void; options?: string[]; dark?: boolean }) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            {type === 'select' ? (
                <select value={value} onChange={e => onChange(e.target.value)} style={selectStyle}>
                    {options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea value={value} onChange={e => onChange(e.target.value)} rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }} />
            ) : type === 'range' ? (
                <input type="range" min={0} max={1} step={0.05} value={value} onChange={e => onChange(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#6C3CE1' }} />
            ) : type === 'color' ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={value || '#6C3CE1'} onChange={e => onChange(e.target.value)}
                        style={{ width: 40, height: 34, padding: 2, border: '1px solid #2D2D44', borderRadius: 6, cursor: 'pointer', background: 'transparent' }} />
                    <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
                        style={{ ...inputStyle, flex: 1, direction: 'ltr' }} />
                </div>
            ) : (
                <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
            )}
        </div>
    )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!value)} style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: value ? '#6C3CE1' : '#374151', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
            <div style={{
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3, left: value ? 22 : 3, transition: 'left 0.2s',
            }} />
        </button>
    )
}
