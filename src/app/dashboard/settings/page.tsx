'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Store, Palette, Share2, Truck } from 'lucide-react'

const TABS = [
    { key: 'general', label: 'معلومات المتجر', icon: Store },
    { key: 'appearance', label: 'المظهر', icon: Palette },
    { key: 'social', label: 'التواصل الاجتماعي', icon: Share2 },
    { key: 'shipping', label: 'الشحن', icon: Truck },
]

const COLORS = ['#6C3CE1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#0EA5E9', '#8B5CF6']

const shippingZones = [
    { city: 'عمّان', fee: 2.5 },
    { city: 'الزرقاء', fee: 3.0 },
    { city: 'إربد', fee: 3.5 },
    { city: 'العقبة', fee: 5.0 },
    { city: 'الكرك', fee: 4.0 },
    { city: 'السلط', fee: 3.0 },
]

export default function SettingsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [tab, setTab] = useState('general')
    const [storeId, setStoreId] = useState<string | null>(null)
    const [storeName, setStoreName] = useState('')
    const [slug, setSlug] = useState('')
    const [desc, setDesc] = useState('')
    const [whatsapp, setWhatsapp] = useState('')
    const [instagram, setInstagram] = useState('')
    const [facebook, setFacebook] = useState('')
    const [primaryColor, setPrimaryColor] = useState('#6C3CE1')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadSettings() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: stores } = await supabase
                .from('stores')
                .select('*')
                .eq('user_id', user.id)
                .limit(1)

            if (stores && stores.length > 0) {
                const s = stores[0]
                setStoreId(s.id)
                setStoreName(s.name_ar || '')
                setSlug(s.slug || '')
                setDesc(s.description || '')
                setWhatsapp(s.whatsapp || '')
                setInstagram(s.social_links?.instagram || '')
                setFacebook(s.social_links?.facebook || '')
                setPrimaryColor(s.theme?.primaryColor || '#6C3CE1')
            }
            setLoading(false)
        }
        loadSettings()
    }, [supabase, router])

    const save = async () => {
        if (!storeId) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from('stores')
                .update({
                    name_ar: storeName,
                    slug: slug,
                    description: desc,
                    whatsapp: whatsapp,
                    social_links: { instagram, facebook },
                    theme: { primaryColor }
                })
                .eq('id', storeId)

            if (error) throw error
            alert('تم حفظ الإعدادات بنجاح!')
        } catch (err: any) {
            console.error('Error saving settings:', err)
            alert('حدث خطأ أثناء حفظ الإعدادات')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )


    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">إعدادات المتجر</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>إدارة إعدادات وتفاصيل متجرك</p>
                </div>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                    <Save size={16} />
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
                {/* Sidebar Tabs */}
                <div style={{ width: 220, flexShrink: 0 }}>
                    <div className="card" style={{ padding: 8 }}>
                        {TABS.map((t) => {
                            const Icon = t.icon
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px',
                                        borderRadius: 10, border: 'none', textAlign: 'right', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                        background: tab === t.key ? 'rgba(108,60,225,0.1)' : 'transparent',
                                        color: tab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    <Icon size={16} />
                                    {t.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                    {tab === 'general' && (
                        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>معلومات المتجر الأساسية</h3>
                            <div className="form-group">
                                <label className="form-label">اسم المتجر *</label>
                                <input className="form-control" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">رابط المتجر (Slug)</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                                    <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: 13, background: 'var(--surface-2)', height: 44, display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                                        mazidi.jo/store/
                                    </span>
                                    <input style={{ flex: 1, border: 'none', outline: 'none', padding: '0 12px', fontSize: 14, background: 'transparent', fontFamily: 'inherit', direction: 'ltr' }} value={slug} onChange={(e) => setSlug(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">وصف المتجر</label>
                                <textarea className="form-control" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="اكتب وصفاً مختصراً لمتجرك..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">رقم واتساب للطلبات</label>
                                <input className="form-control" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="07xxxxxxxxx" dir="ltr" />
                            </div>
                        </div>
                    )}

                    {tab === 'appearance' && (
                        <div className="card card-body">
                            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>تخصيص مظهر المتجر</h3>
                            <div className="form-group">
                                <label className="form-label">اللون الرئيسي</label>
                                <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                                    {COLORS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setPrimaryColor(c)}
                                            style={{
                                                width: 40, height: 40, borderRadius: 10, background: c, border: 'none', cursor: 'pointer',
                                                outline: primaryColor === c ? `3px solid ${c}` : 'none',
                                                outlineOffset: 2,
                                                transform: primaryColor === c ? 'scale(1.15)' : 'scale(1)',
                                                transition: 'all 0.2s ease',
                                            }}
                                        />
                                    ))}
                                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                                        style={{ width: 40, height: 40, padding: 2, border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer' }} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: 24 }}>
                                <label className="form-label">طريقة عرض المنتجات</label>
                                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                    {['grid', 'list'].map((layout) => (
                                        <div key={layout} style={{
                                            flex: 1, border: `2px solid ${layout === 'grid' ? primaryColor : 'var(--border)'}`,
                                            borderRadius: 12, padding: 20, cursor: 'pointer', textAlign: 'center',
                                            background: layout === 'grid' ? `${primaryColor}10` : 'transparent',
                                        }}>
                                            <div style={{ fontSize: 24, marginBottom: 8 }}>{layout === 'grid' ? '⊞' : '☰'}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: layout === 'grid' ? primaryColor : 'var(--text-secondary)' }}>
                                                {layout === 'grid' ? 'شبكة' : 'قائمة'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Preview Box */}
                            <div style={{ marginTop: 24, background: 'var(--surface-2)', borderRadius: 12, padding: 20 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>معاينة</div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button style={{ background: primaryColor, color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'default', fontFamily: 'inherit' }}>
                                        أضف إلى السلة
                                    </button>
                                    <div style={{ background: primaryColor, opacity: 0.15, borderRadius: 8, width: 80, height: 36 }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'social' && (
                        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>روابط التواصل الاجتماعي</h3>
                            {[
                                { label: 'واتساب', placeholder: '0791234567', val: whatsapp, set: setWhatsapp },
                                { label: 'إنستغرام', placeholder: '@username', val: instagram, set: setInstagram },
                                { label: 'فيسبوك', placeholder: 'https://facebook.com/...', val: facebook, set: setFacebook },
                            ].map((f) => (
                                <div className="form-group" key={f.label}>
                                    <label className="form-label">{f.label}</label>
                                    <input className="form-control" value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} dir="ltr" />
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'shipping' && (
                        <div className="card">
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ fontWeight: 700, fontSize: 16 }}>أسعار الشحن حسب المحافظة</h3>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['المحافظة', 'سعر التوصيل (د.أ)'].map((h) => (
                                            <th key={h} style={{ textAlign: 'right', padding: '12px 24px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {shippingZones.map((z) => (
                                        <tr key={z.city} style={{ borderTop: '1px solid var(--border)' }}>
                                            <td style={{ padding: '14px 24px', fontWeight: 600 }}>{z.city}</td>
                                            <td style={{ padding: '14px 24px' }}>
                                                <input
                                                    className="form-control"
                                                    type="number"
                                                    defaultValue={z.fee}
                                                    step="0.5"
                                                    style={{ width: 100 }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
