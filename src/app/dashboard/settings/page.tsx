'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Store, Palette, Share2, Truck, CreditCard, Globe, Plus, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'

const TABS = [
    { key: 'general', label: 'معلومات المتجر', icon: Store },
    { key: 'appearance', label: 'المظهر', icon: Palette },
    { key: 'social', label: 'التواصل الاجتماعي', icon: Share2 },
    { key: 'shipping', label: 'الشحن', icon: Truck },
    { key: 'payments', label: 'المدفوعات', icon: CreditCard },
    { key: 'domain', label: 'النطاق', icon: Globe },
]

const COLORS = ['#6C3CE1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#0EA5E9', '#8B5CF6']

const JO_CITIES = ['عمّان', 'الزرقاء', 'إربد', 'العقبة', 'الكرك', 'مادبا', 'السلط', 'عجلون', 'جرش', 'المفرق', 'الطفيلة', 'معان']

export default function SettingsPage() {
    const supabase = createClient()
    const router = useRouter()
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
    const [twitter, setTwitter] = useState('')
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

            // Load shipping zones from DB
            const { data: zones } = await supabase.from('store_shipping_zones').select('*').eq('store_id', s.id).order('created_at')
            setShippingZones(zones || [])

            // Load payment config
            const { data: pc } = await supabase.from('store_payment_config').select('*').eq('store_id', s.id).single()
            if (pc) {
                setPayConfig(pc)
                setPayConfigId(pc.id)
            }
        }
        setLoading(false)
    }, [supabase, router])

    useEffect(() => { loadSettings() }, [loadSettings])

    // ── Save general/appearance/social/domain ──────────────────────────────
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
        } catch (err: any) {
            toast.error('حدث خطأ أثناء الحفظ')
        } finally { setSaving(false) }
    }

    // ── Shipping zones ──────────────────────────────────────────────────────
    const addZone = () => {
        setShippingZones(prev => [...prev, { _new: true, id: `new-${Date.now()}`, store_id: storeId, name_ar: '', cities: [], rate: 2.5, free_above: null, estimated_days_min: 1, estimated_days_max: 3, is_active: true }])
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
                        estimated_days_min: zone.estimated_days_min, estimated_days_max: zone.estimated_days_max,
                        is_active: zone.is_active,
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

    // ── Payment config ──────────────────────────────────────────────────────
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
            toast.success('تم حفظ إعدادات المدفوعات')
        } catch { toast.error('خطأ في الحفظ') } finally { setSaving(false) }
    }

    const handleSave = () => {
        if (tab === 'shipping') saveShipping()
        else if (tab === 'payments') savePayments()
        else saveGeneral()
    }

    if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">إعدادات المتجر</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>إدارة إعدادات وتفاصيل متجرك</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={16} />
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                {/* Sidebar Tabs */}
                <div style={{ width: 220, flexShrink: 0 }}>
                    <div className="card" style={{ padding: 8 }}>
                        {TABS.map((t) => {
                            const Icon = t.icon
                            return (
                                <button key={t.key} onClick={() => setTab(t.key)} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px',
                                    borderRadius: 10, border: 'none', textAlign: 'right', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                    background: tab === t.key ? 'rgba(108,60,225,0.1)' : 'transparent',
                                    color: tab === t.key ? 'var(--primary)' : 'var(--text-secondary)', fontFamily: 'inherit',
                                }}>
                                    <Icon size={16} />{t.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>

                    {/* ── General ──────────────────────────────────────── */}
                    {tab === 'general' && (
                        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>معلومات المتجر الأساسية</h3>
                            <div className="form-group">
                                <label className="form-label">اسم المتجر *</label>
                                <input className="form-control" value={storeName} onChange={e => setStoreName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">رابط المتجر (Slug)</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                                    <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: 13, background: 'var(--surface-2)', height: 44, display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                                        tojjarna.com/store/
                                    </span>
                                    <input style={{ flex: 1, border: 'none', outline: 'none', padding: '0 12px', fontSize: 14, background: 'transparent', fontFamily: 'inherit', direction: 'ltr' }} value={slug} onChange={e => setSlug(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">وصف المتجر</label>
                                <textarea className="form-control" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="اكتب وصفاً مختصراً لمتجرك..." />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">رقم واتساب للطلبات</label>
                                <input className="form-control" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="962791234567+" dir="ltr" />
                            </div>
                        </div>
                    )}

                    {/* ── Appearance ───────────────────────────────────── */}
                    {tab === 'appearance' && (
                        <div className="card card-body">
                            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>تخصيص مظهر المتجر</h3>
                            <div className="form-group">
                                <label className="form-label">اللون الرئيسي</label>
                                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                    {COLORS.map(c => (
                                        <button key={c} onClick={() => setPrimaryColor(c)} style={{
                                            width: 40, height: 40, borderRadius: 10, background: c, border: 'none', cursor: 'pointer',
                                            outline: primaryColor === c ? `3px solid ${c}` : 'none', outlineOffset: 2,
                                            transform: primaryColor === c ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.2s',
                                        }} />
                                    ))}
                                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                                        style={{ width: 40, height: 40, padding: 2, border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer' }} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">الخط</label>
                                <select className="form-control" value={font} onChange={e => setFont(e.target.value)}>
                                    {['Tajawal', 'Noto Sans Arabic', 'Cairo', 'IBM Plex Arabic', 'Amiri'].map(f => <option key={f}>{f}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">طريقة عرض المنتجات</label>
                                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    {[{ v: 'grid', label: 'شبكة', icon: '⊞' }, { v: 'list', label: 'قائمة', icon: '☰' }].map(({ v, label, icon }) => (
                                        <div key={v} onClick={() => setLayout(v)} style={{
                                            flex: 1, border: `2px solid ${layout === v ? primaryColor : 'var(--border)'}`,
                                            borderRadius: 12, padding: 20, cursor: 'pointer', textAlign: 'center',
                                            background: layout === v ? `${primaryColor}10` : 'transparent',
                                        }}>
                                            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: layout === v ? primaryColor : 'var(--text-secondary)' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginTop: 12, background: 'var(--surface-2)', borderRadius: 12, padding: 20 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>معاينة</div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button style={{ background: primaryColor, color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'default', fontFamily: 'inherit' }}>أضف إلى السلة</button>
                                    <div style={{ background: primaryColor, opacity: 0.15, borderRadius: 8, width: 80, height: 36 }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Social ───────────────────────────────────────── */}
                    {tab === 'social' && (
                        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>روابط التواصل الاجتماعي</h3>
                            {[
                                { label: 'واتساب', placeholder: '962791234567+', val: whatsapp, set: setWhatsapp },
                                { label: 'إنستغرام', placeholder: '@username', val: instagram, set: setInstagram },
                                { label: 'فيسبوك', placeholder: 'https://facebook.com/...', val: facebook, set: setFacebook },
                                { label: 'تيك توك', placeholder: '@username', val: tiktok, set: setTiktok },
                            ].map(f => (
                                <div className="form-group" key={f.label} style={{ marginBottom: 0 }}>
                                    <label className="form-label">{f.label}</label>
                                    <input className="form-control" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} dir="ltr" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Shipping ─────────────────────────────────────── */}
                    {tab === 'shipping' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: 16 }}>مناطق الشحن</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>حدد أسعار التوصيل لكل منطقة</p>
                                </div>
                                <button onClick={addZone} className="btn btn-primary btn-sm"><Plus size={14} />إضافة منطقة</button>
                            </div>
                            {shippingZones.length === 0 && (
                                <div className="card card-body" style={{ textAlign: 'center', padding: 40 }}>
                                    <Truck size={40} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>لم تضف أي مناطق شحن بعد</p>
                                    <button onClick={addZone} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', marginTop: 12 }}><Plus size={14} />إضافة أولى منطقة</button>
                                </div>
                            )}
                            {shippingZones.map((zone) => (
                                <div key={zone.id} className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="form-group" style={{ marginBottom: 0, flex: 1, marginLeft: 16 }}>
                                            <label className="form-label">اسم المنطقة</label>
                                            <input className="form-control" value={zone.name_ar} onChange={e => updateZone(zone.id, 'name_ar', e.target.value)} placeholder="مثال: عمّان والزرقاء" />
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'var(--surface-2)', borderRadius: 10, gap: 10 }}>
                                                <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>مفعّلة</span>
                                                <button onClick={() => updateZone(zone.id, 'is_active', !zone.is_active)} style={{
                                                    width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                                                    background: zone.is_active ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'background 0.2s',
                                                }}>
                                                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: zone.is_active ? 20 : 3, transition: 'left 0.2s' }} />
                                                </button>
                                            </div>
                                            <button onClick={() => removeZone(zone)} style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">سعر الشحن (د.أ)</label>
                                            <input className="form-control" type="number" value={zone.rate} step="0.5" onChange={e => updateZone(zone.id, 'rate', parseFloat(e.target.value))} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">شحن مجاني فوق (د.أ)</label>
                                            <input className="form-control" type="number" value={zone.free_above || ''} placeholder="اتركه فارغاً لإيقافه" onChange={e => updateZone(zone.id, 'free_above', e.target.value ? parseFloat(e.target.value) : null)} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">أقل أيام التسليم</label>
                                            <input className="form-control" type="number" value={zone.estimated_days_min} min="1" onChange={e => updateZone(zone.id, 'estimated_days_min', parseInt(e.target.value))} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">أعلى أيام التسليم</label>
                                            <input className="form-control" type="number" value={zone.estimated_days_max} min="1" onChange={e => updateZone(zone.id, 'estimated_days_max', parseInt(e.target.value))} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-label">المدن المشمولة</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                                            {JO_CITIES.map(city => {
                                                const included = zone.cities?.includes(city)
                                                return (
                                                    <button key={city} onClick={() => {
                                                        const cities = zone.cities || []
                                                        updateZone(zone.id, 'cities', included ? cities.filter((c: string) => c !== city) : [...cities, city])
                                                    }} style={{
                                                        padding: '5px 12px', borderRadius: 100, border: `1.5px solid ${included ? 'var(--primary)' : 'var(--border)'}`,
                                                        background: included ? 'rgba(108,60,225,0.1)' : 'transparent',
                                                        color: included ? 'var(--primary)' : 'var(--text-secondary)',
                                                        fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
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

                    {/* ── Payments ──────────────────────────────────────── */}
                    {tab === 'payments' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16 }}>إعدادات المدفوعات</h3>

                            {/* COD */}
                            <div className="card card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💵</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>الدفع عند الاستلام (COD)</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>يدفع العميل نقداً عند وصول الطلب</div>
                                        </div>
                                    </div>
                                    <ToggleSwitch value={payConfig.cod_enabled} onChange={v => setPayConfig((prev: any) => ({ ...prev, cod_enabled: v }))} />
                                </div>
                            </div>

                            {/* HyperPay */}
                            <div className="card card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: payConfig.hyperpay_enabled ? 16 : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💳</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>HyperPay</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>فيزا، ماستركارد، مدى، Apple Pay</div>
                                        </div>
                                    </div>
                                    <ToggleSwitch value={payConfig.hyperpay_enabled} onChange={v => setPayConfig((prev: any) => ({ ...prev, hyperpay_enabled: v }))} />
                                </div>
                                {payConfig.hyperpay_enabled && (
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">HyperPay Entity ID</label>
                                        <input className="form-control" value={payConfig.hyperpay_entity_id || ''} onChange={e => setPayConfig((prev: any) => ({ ...prev, hyperpay_entity_id: e.target.value }))} placeholder="أدخل Entity ID من حسابك في HyperPay" dir="ltr" />
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>احصل على هذا المفتاح من لوحة تحكم HyperPay</p>
                                    </div>
                                )}
                            </div>

                            {/* PayTabs */}
                            <div className="card card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: payConfig.paytabs_enabled ? 16 : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔵</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>PayTabs</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>بوابة دفع مخصصة للمنطقة العربية</div>
                                        </div>
                                    </div>
                                    <ToggleSwitch value={payConfig.paytabs_enabled} onChange={v => setPayConfig((prev: any) => ({ ...prev, paytabs_enabled: v }))} />
                                </div>
                                {payConfig.paytabs_enabled && (
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">PayTabs Profile ID</label>
                                        <input className="form-control" value={payConfig.paytabs_profile_id || ''} onChange={e => setPayConfig((prev: any) => ({ ...prev, paytabs_profile_id: e.target.value }))} placeholder="أدخل Profile ID من حسابك في PayTabs" dir="ltr" />
                                    </div>
                                )}
                            </div>

                            {/* Currencies */}
                            <div className="card card-body">
                                <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>العملات المدعومة</h4>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {['JOD', 'SAR', 'AED', 'USD', 'EUR'].map(cur => {
                                        const selected = payConfig.currencies?.includes(cur)
                                        return (
                                            <button key={cur} onClick={() => {
                                                const curr = payConfig.currencies || []
                                                setPayConfig((prev: any) => ({ ...prev, currencies: selected ? curr.filter((c: string) => c !== cur) : [...curr, cur] }))
                                            }} style={{
                                                padding: '7px 18px', borderRadius: 100, border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                                                background: selected ? 'rgba(108,60,225,0.1)' : 'transparent',
                                                color: selected ? 'var(--primary)' : 'var(--text-secondary)',
                                                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                            }}>{cur}</button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Domain ───────────────────────────────────────── */}
                    {tab === 'domain' && (
                        <div className="card card-body">
                            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>النطاق المخصص</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>اربط نطاقك الخاص بمتجرك لمظهر احترافي</p>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">النطاق الخاص</label>
                                <input className="form-control" value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="shop.mybrand.com" dir="ltr" />
                            </div>
                            {customDomain && (
                                <div style={{ marginTop: 20, background: 'var(--surface-2)', borderRadius: 12, padding: 20 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>خطوات إعداد النطاق</div>
                                    {[
                                        { step: '1', text: `أضف سجل CNAME من ${customDomain} → cname.vercel-dns.com` },
                                        { step: '2', text: 'احفظ إعدادات النطاق هنا واضغط حفظ' },
                                        { step: '3', text: 'انتظر من 10 دقائق حتى 24 ساعة للتفعيل' },
                                    ].map(({ step, text }) => (
                                        <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{step}</div>
                                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, direction: 'ltr', textAlign: 'left' }}>{text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!value)} style={{
            width: 50, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: value ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'background 0.2s',
        }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: value ? 24 : 3, transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
        </button>
    )
}
