'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Store, Palette, Share2, Truck, CreditCard, Globe, Plus, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'

const COLORS = ['#6C3CE1', '#C6A75E', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#0EA5E9']

const JO_CITIES = ['عمّان', 'الزرقاء', 'إربد', 'العقبة', 'الكرك', 'مادبا', 'السلط', 'عجلون', 'جرش', 'المفرق', 'الطفيلة', 'معان']

function ToggleSwitch({ value, onChange, dir }: { value: boolean; onChange: (v: boolean) => void; dir: 'rtl' | 'ltr' }) {
    return (
        <button
            onClick={() => onChange(!value)}
            style={{
                width: 50, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                flexShrink: 0, position: 'relative', transition: 'background 0.2s',
                background: value ? '#C6A75E' : '#D4C8BB',
            }}
        >
            <span style={{
                width: 22, height: 22, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3,
                [dir === 'rtl' ? 'right' : 'left']: value ? 3 : 24,
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                display: 'block',
            }} />
        </button>
    )
}

export default function SettingsPage() {
    const supabase = createClient()
    const router = useRouter()
    const { t, lang, dir } = useLanguage()

    const TABS = [
        { key: 'general', label: t.settings.general, icon: Store },
        { key: 'appearance', label: t.settings.appearance, icon: Palette },
        { key: 'social', label: t.settings.social, icon: Share2 },
        { key: 'shipping', label: t.settings.shipping, icon: Truck },
        { key: 'payments', label: t.settings.payments, icon: CreditCard },
        { key: 'domain', label: t.settings.domain, icon: Globe },
    ]

    const [tab, setTab] = useState('general')
    const [storeId, setStoreId] = useState<string | null>(null)

    // General
    const [storeName, setStoreName] = useState('')
    const [slug, setSlug] = useState('')
    const [desc, setDesc] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [customDomain, setCustomDomain] = useState('')

    // Appearance
    const [primaryColor, setPrimaryColor] = useState('#6C3CE1')
    const [font, setFont] = useState('Tajawal')
    const [layout, setLayout] = useState('grid')

    // Social
    const [instagram, setInstagram] = useState('')
    const [facebook, setFacebook] = useState('')
    const [tiktok, setTiktok] = useState('')

    // Shipping
    const [shippingZones, setShippingZones] = useState<any[]>([])

    // Payments
    const [payConfig, setPayConfig] = useState<any>({
        cod_enabled: true,
        hyperpay_enabled: false,
        hyperpay_entity_id: '',
        paytabs_enabled: false,
        paytabs_profile_id: '',
        currencies: ['JOD'],
    })
    const [payConfigId, setPayConfigId] = useState<string | null>(null)

    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    const loadSettings = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data: stores } = await supabase.from('stores').select('*').eq('user_id', user.id).limit(1)
        if (stores && stores.length > 0) {
            const s = stores[0]
            setStoreId(s.id)
            setStoreName(s.name_ar || '')
            setSlug(s.slug || '')
            setDesc(s.description_ar || '')
            setWhatsapp(s.whatsapp || '')
            setInstagram(s.instagram || '')
            setFacebook(s.facebook || '')
            setCustomDomain(s.custom_domain || '')
            setPrimaryColor(s.theme?.primary_color || '#6C3CE1')
            setFont(s.theme?.font_family || 'Tajawal')
            setLayout(s.theme?.layout || 'grid')

            const { data: zones } = await supabase.from('store_shipping_zones').select('*').eq('store_id', s.id).order('created_at')
            setShippingZones(zones || [])

            const { data: pc } = await supabase.from('store_payment_config').select('*').eq('store_id', s.id).single()
            if (pc) { setPayConfig(pc); setPayConfigId(pc.id) }
        }
        setLoading(false)
    }, [supabase, router])

    useEffect(() => { loadSettings() }, [loadSettings])

    const saveGeneral = async () => {
        if (!storeId) return
        setSaving(true)
        try {
            const { error } = await supabase.from('stores').update({
                name_ar: storeName, slug, description_ar: desc, whatsapp,
                instagram, facebook, custom_domain: customDomain,
                theme: { primary_color: primaryColor, font_family: font, layout },
            }).eq('id', storeId)
            if (error) throw error
            toast.success('تم حفظ الإعدادات بنجاح!')
        } catch { toast.error('حدث خطأ أثناء الحفظ') } finally { setSaving(false) }
    }

    const addZone = () => {
        setShippingZones(prev => [...prev, {
            _new: true, id: `new-${Date.now()}`, store_id: storeId,
            name_ar: '', cities: [], rate: 2.5, free_above: null,
            estimated_days_min: 1, estimated_days_max: 3, is_active: true,
        }])
    }

    const updateZone = (id: string, key: string, value: any) => {
        setShippingZones(prev => prev.map(z => z.id === id ? { ...z, [key]: value } : z))
    }

    const removeZone = async (zone: any) => {
        if (zone._new) { setShippingZones(prev => prev.filter(z => z.id !== zone.id)); return }
        await supabase.from('store_shipping_zones').delete().eq('id', zone.id)
        setShippingZones(prev => prev.filter(z => z.id !== zone.id))
        toast.success('تم حذف منطقة الشحن')
    }

    const saveShipping = async () => {
        if (!storeId) return
        setSaving(true)
        try {
            for (const zone of shippingZones) {
                if (!zone.name_ar) continue
                if (zone._new) {
                    const { data } = await supabase.from('store_shipping_zones').insert({
                        store_id: storeId, name_ar: zone.name_ar, cities: zone.cities,
                        rate: zone.rate, free_above: zone.free_above,
                        estimated_days_min: zone.estimated_days_min,
                        estimated_days_max: zone.estimated_days_max, is_active: zone.is_active,
                    }).select().single()
                    if (data) setShippingZones(prev => prev.map(z => z.id === zone.id ? { ...data } : z))
                } else {
                    await supabase.from('store_shipping_zones').update({
                        name_ar: zone.name_ar, cities: zone.cities, rate: zone.rate,
                        free_above: zone.free_above, estimated_days_min: zone.estimated_days_min,
                        estimated_days_max: zone.estimated_days_max, is_active: zone.is_active,
                    }).eq('id', zone.id)
                }
            }
            toast.success('تم حفظ إعدادات الشحن')
        } catch { toast.error('خطأ في حفظ الشحن') } finally { setSaving(false) }
    }

    const savePayments = async () => {
        if (!storeId) return
        setSaving(true)
        try {
            if (payConfigId) {
                await supabase.from('store_payment_config').update({ ...payConfig }).eq('id', payConfigId)
            } else {
                const { data } = await supabase.from('store_payment_config').insert({ store_id: storeId, ...payConfig }).select().single()
                if (data) setPayConfigId(data.id)
            }
            toast.success(t.success.settingsSaved)
        } catch { toast.error(t.errors.saveFailed) } finally { setSaving(false) }
    }

    const handleSave = () => {
        if (tab === 'shipping') saveShipping()
        else if (tab === 'payments') savePayments()
        else saveGeneral()
    }

    if (loading) return (
        <div className="page-container">
            <div className="skeleton skeleton-text" style={{ width: 180, height: 26, marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 52, borderRadius: 14, marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
        </div>
    )

    return (
        <div className="page-container" style={{ paddingBottom: 100 }}>

            {/* ── Page header ── */}
            <div className="page-header" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="page-title">{t.settings.title}</h1>
                    <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>{t.settings.subtitle}</p>
                </div>
                {/* Desktop save button */}
                <button className="btn btn-primary hide-on-mobile" onClick={handleSave} disabled={saving}>
                    <Save size={16} />
                    {saving ? t.settings.saving : t.settings.save}
                </button>
            </div>

            {/* Layout: chip-tabs on mobile, sidebar + content on desktop */}
            <div className="settings-page-layout">

                {/* ▷ MOBILE: horizontal chip row */}
                <div className="chips-row settings-chip-tabs show-on-mobile">
                    {TABS.map(t => {
                        const Icon = t.icon
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`chip ${tab === t.key ? 'active' : ''}`}
                            >
                                <Icon size={14} />
                                {t.label}
                            </button>
                        )
                    })}
                </div>

                {/* ▷ DESKTOP: left sidebar nav */}
                <nav className="settings-sidebar-nav hide-on-mobile">
                    <div className="card" style={{ padding: 8 }}>
                        {TABS.map(navTab => {
                            const Icon = navTab.icon
                            const active = tab === navTab.key
                            return (
                                <button
                                    key={navTab.key}
                                    onClick={() => setTab(navTab.key)}
                                    className={`btn btn-ghost w-full ${active ? 'active' : ''}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '12px 14px', borderRadius: 10,
                                        border: 'none', textAlign: 'inherit', fontSize: 14,
                                        fontWeight: active ? 700 : 500, cursor: 'pointer',
                                        marginBottom: 2,
                                        background: active ? 'var(--surface-2)' : 'transparent',
                                        color: active ? 'var(--primary)' : 'var(--text-secondary)',
                                    }}
                                >
                                    <Icon size={16} style={{ flexShrink: 0 }} />
                                    {navTab.label}
                                </button>
                            )
                        })}
                    </div>
                </nav>

                {/* Content */}
                <div className="settings-page-content">

                    {/* General */}
                    {tab === 'general' && (
                        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16 }}>{t.settings.general}</h3>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t.settings.storeName} *</label>
                                <input className="form-control" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder={t.settings.storeName} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t.settings.storeSlug}</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E0D6C8', borderRadius: 10, overflow: 'hidden' }}>
                                    <span style={{ padding: '0 10px', color: '#A09080', fontSize: 12, background: '#F5F0E8', height: 46, display: 'flex', alignItems: 'center', borderInlineEnd: '1px solid #E0D6C8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        /store/
                                    </span>
                                    <input style={{ flex: 1, border: 'none', outline: 'none', padding: '0 12px', fontSize: 14, background: 'transparent', fontFamily: 'inherit', direction: 'ltr', minWidth: 0, textAlign: dir === 'rtl' ? 'right' : 'left' }}
                                        value={slug} onChange={e => setSlug(e.target.value)} placeholder="my-store" />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t.settings.storeDescription}</label>
                                <textarea className="form-control" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder={t.settings.storeDescriptionPlaceholder} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t.settings.whatsappNumber}</label>
                                <input className="form-control" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+962791234567" dir="ltr" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }} />
                            </div>
                        </div>
                    )}

                    {/* Appearance */}
                    {tab === 'appearance' && (
                        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16 }}>{t.settings.appearance}</h3>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t.settings.primaryColor}</label>
                                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                    {COLORS.map(c => (
                                        <button key={c} onClick={() => setPrimaryColor(c)} style={{
                                            width: 40, height: 40, borderRadius: 10, background: c, border: 'none', cursor: 'pointer', flexShrink: 0,
                                            outline: primaryColor === c ? `3px solid ${c}` : 'none', outlineOffset: 2,
                                            transform: primaryColor === c ? 'scale(1.18)' : 'scale(1)', transition: 'all 0.2s',
                                        }} />
                                    ))}
                                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                                        style={{ width: 40, height: 40, padding: 2, border: '1px solid #E0D6C8', borderRadius: 10, cursor: 'pointer' }} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t.settings.font}</label>
                                <select className="form-control" value={font} onChange={e => setFont(e.target.value)}>
                                    {['Tajawal', 'Noto Sans Arabic', 'Cairo', 'Amiri'].map(f => <option key={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t.settings.productLayout}</label>
                                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    {[{ v: 'grid', label: t.settings.grid, icon: '⊞' }, { v: 'list', label: t.settings.list, icon: '☰' }].map(({ v, label, icon }) => (
                                        <div key={v} onClick={() => setLayout(v)} style={{
                                            flex: 1, border: `2px solid ${layout === v ? primaryColor : '#E0D6C8'}`,
                                            borderRadius: 12, padding: '16px 12px', cursor: 'pointer', textAlign: 'center',
                                            background: layout === v ? `${primaryColor}18` : 'transparent', transition: 'all 0.2s',
                                        }}>
                                            <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: layout === v ? primaryColor : '#6B6058' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ background: '#F5F0E8', borderRadius: 12, padding: 16 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#6B6058', marginBottom: 12 }}>{t.common.preview}</div>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    <button style={{ background: primaryColor, color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'default', fontFamily: 'inherit' }}>{t.store.addToCart}</button>
                                    <div style={{ background: primaryColor, opacity: 0.15, borderRadius: 8, width: 70, height: 36 }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social */}
                    {tab === 'social' && (
                        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16 }}>{t.settings.social}</h3>
                            {[
                                { label: `${t.settings.whatsappNumber} 💬`, placeholder: '+962791234567', val: whatsapp, set: setWhatsapp },
                                { label: 'Instagram 📸', placeholder: '@username', val: instagram, set: setInstagram },
                                { label: 'Facebook 👥', placeholder: 'https://facebook.com/...', val: facebook, set: setFacebook },
                                { label: 'TikTok 🎵', placeholder: '@username', val: tiktok, set: setTiktok },
                            ].map(f => (
                                <div className="form-group" key={f.label} style={{ marginBottom: 0 }}>
                                    <label className="form-label">{f.label}</label>
                                    <input className="form-control" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} dir="ltr" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Shipping */}
                    {tab === 'shipping' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: 16 }}>{t.settings.shippingZones}</h3>
                                    <p style={{ color: '#6B6058', fontSize: 13, marginTop: 4 }}>{t.settings.shippingZonesDesc}</p>
                                </div>
                                <button onClick={addZone} className="btn btn-primary btn-sm"><Plus size={14} />{t.settings.addZone}</button>
                            </div>

                            {shippingZones.length === 0 && (
                                <div className="card card-body" style={{ textAlign: 'center', padding: 40 }}>
                                    <Truck size={40} color="#D4C8BB" style={{ margin: '0 auto 12px', display: 'block' }} />
                                    <p style={{ color: '#6B6058', fontSize: 14, marginBottom: 12 }}>{t.settings.noShippingZones}</p>
                                    <button onClick={addZone} className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}><Plus size={14} />{t.settings.addZone}</button>
                                </div>
                            )}

                            {shippingZones.map(zone => (
                                <div key={zone.id} className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Zone name row */}
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 150 }}>
                                            <label className="form-label">{t.settings.zoneName}</label>
                                            <input className="form-control" value={zone.name_ar} onChange={e => updateZone(zone.id, 'name_ar', e.target.value)} placeholder={t.settings.zonePlaceholder} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, paddingBottom: 2 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B6058', cursor: 'pointer' }}>
                                                {t.common.active}
                                                <ToggleSwitch value={zone.is_active} onChange={v => updateZone(zone.id, 'is_active', v)} dir={dir} />
                                            </label>
                                            <button onClick={() => removeZone(zone)} style={{ width: 38, height: 38, background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rate fields grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">{t.settings.shippingRate}</label>
                                            <input className="form-control" type="number" step="0.5" value={zone.rate} onChange={e => updateZone(zone.id, 'rate', parseFloat(e.target.value))} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">{t.settings.freeAbove}</label>
                                            <input className="form-control" type="number" value={zone.free_above || ''} placeholder={t.common.notSet} onChange={e => updateZone(zone.id, 'free_above', e.target.value ? parseFloat(e.target.value) : null)} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">{t.settings.minDays}</label>
                                            <input className="form-control" type="number" min="1" value={zone.estimated_days_min} onChange={e => updateZone(zone.id, 'estimated_days_min', parseInt(e.target.value))} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">{t.settings.maxDays}</label>
                                            <input className="form-control" type="number" min="1" value={zone.estimated_days_max} onChange={e => updateZone(zone.id, 'estimated_days_max', parseInt(e.target.value))} />
                                        </div>
                                    </div>

                                    {/* Cities */}
                                    <div>
                                        <label className="form-label">{t.settings.cities}</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                            {JO_CITIES.map(city => {
                                                const included = zone.cities?.includes(city)
                                                return (
                                                    <button key={city} onClick={() => {
                                                        const cities = zone.cities || []
                                                        updateZone(zone.id, 'cities', included ? cities.filter((c: string) => c !== city) : [...cities, city])
                                                    }} style={{
                                                        padding: '6px 14px', borderRadius: 100, fontFamily: 'inherit', minHeight: 36,
                                                        border: `1.5px solid ${included ? '#C6A75E' : '#E0D6C8'}`,
                                                        background: included ? 'rgba(198,167,94,0.12)' : 'transparent',
                                                        color: included ? '#C6A75E' : '#6B6058',
                                                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                    }}>
                                                        {included && <Check size={11} />}{city}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Payments */}
                    {tab === 'payments' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16 }}>{t.settings.paymentsTitle}</h3>

                            {[
                                { configKey: 'cod_enabled', emoji: '💵', bg: '#D1FAE5', title: t.settings.cod, sub: t.settings.codDesc, expandKey: null },
                                { configKey: 'hyperpay_enabled', emoji: '💳', bg: '#EDE9FE', title: 'HyperPay', sub: t.settings.hyperpayDesc, expandKey: 'hyperpay_entity_id', expandLabel: 'HyperPay Entity ID' },
                                { configKey: 'paytabs_enabled', emoji: '🔵', bg: '#DBEAFE', title: 'PayTabs', sub: t.settings.paytabsDesc, expandKey: 'paytabs_profile_id', expandLabel: 'PayTabs Profile ID' },
                            ].map(p => (
                                <div key={p.configKey} className="card card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.emoji}</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>{p.title}</div>
                                                <div style={{ fontSize: 13, color: '#6B6058', marginTop: 2 }}>{p.sub}</div>
                                            </div>
                                        </div>
                                        <ToggleSwitch value={payConfig[p.configKey]} onChange={v => setPayConfig((prev: any) => ({ ...prev, [p.configKey]: v }))} dir={dir} />
                                    </div>
                                    {p.expandKey && payConfig[p.configKey] && (
                                        <div className="form-group" style={{ marginBottom: 0, marginTop: 16 }}>
                                            <label className="form-label">{p.expandLabel}</label>
                                            <input className="form-control" value={payConfig[p.expandKey] || ''} onChange={e => setPayConfig((prev: any) => ({ ...prev, [p.expandKey!]: e.target.value }))} placeholder={`${t.common.enter} ${p.expandLabel}`} dir="ltr" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="card card-body">
                                <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{t.settings.supportedCurrencies}</h4>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {['JOD', 'SAR', 'AED', 'USD', 'EUR'].map(cur => {
                                        const selected = payConfig.currencies?.includes(cur)
                                        return (
                                            <button key={cur} onClick={() => {
                                                const curr = payConfig.currencies || []
                                                setPayConfig((prev: any) => ({ ...prev, currencies: selected ? curr.filter((c: string) => c !== cur) : [...curr, cur] }))
                                            }} style={{
                                                padding: '8px 18px', borderRadius: 100, fontFamily: 'inherit', minHeight: 40,
                                                border: `1.5px solid ${selected ? '#C6A75E' : '#E0D6C8'}`,
                                                background: selected ? 'rgba(198,167,94,0.12)' : 'transparent',
                                                color: selected ? '#C6A75E' : '#6B6058',
                                                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            }}>{cur}</button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Domain */}
                    {tab === 'domain' && (
                        <div className="card card-body">
                            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{t.settings.customDomain}</h3>
                            <p style={{ color: '#6B6058', fontSize: 14, marginBottom: 20 }}>{t.settings.customDomainDesc}</p>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t.settings.customDomain}</label>
                                <input className="form-control" value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="shop.mybrand.com" dir="ltr" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }} />
                            </div>
                            {customDomain && (
                                <div style={{ marginTop: 20, background: '#F5F0E8', borderRadius: 12, padding: 20 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{t.settings.domainSetupSteps}</div>
                                    {[
                                        { step: '1', text: `Add CNAME from ${customDomain} → cname.vercel-dns.com` },
                                        { step: '2', text: 'Save the domain settings here and click Save' },
                                        { step: '3', text: 'Wait 10 minutes – 24 hours for propagation' },
                                    ].map(({ step, text }) => (
                                        <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#C6A75E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{step}</div>
                                            <p style={{ fontSize: 13, color: '#6B6058', lineHeight: 1.6, direction: 'ltr', margin: 0, textAlign: 'left' }}>{text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* ── Mobile sticky save bar ── */}
            <div className="mobile-save-bar">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, minHeight: 50, fontSize: 15, fontWeight: 700 }}>
                    <Save size={16} />
                    {saving ? t.settings.saving : t.settings.save}
                </button>
            </div>
        </div>
    )
}
