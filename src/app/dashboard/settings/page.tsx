'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Store, Palette, Share2, Truck, CreditCard, Globe, Plus, Trash2, Check, Instagram, Facebook } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'

const JO_CITIES = ['عمّان', 'الزرقاء', 'إربد', 'العقبة', 'الكرك', 'مادبا', 'السلط', 'عجلون', 'جرش', 'المفرق', 'الطفيلة', 'معان']
const FONTS = ['Tajawal', 'Cairo', 'Noto Sans Arabic', 'Amiri', 'Rubik']
const COLORS = ['#6C3CE1','#F97316','#16A34A','#2563EB','#DC2626','#D97706','#EC4899','#0F172A']

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
      flexShrink: 0, position: 'relative', transition: 'background 0.2s',
      background: value ? '#6C3CE1' : '#E5E7EB',
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3,
        left: value ? 23 : 3,
        transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)', display: 'block',
      }} />
    </button>
  )
}

const TABS = [
  { key: 'general',  label: 'عام',      icon: Store },
  { key: 'social',   label: 'التواصل',  icon: Share2 },
  { key: 'shipping', label: 'الشحن',    icon: Truck },
  { key: 'payments', label: 'الدفع',    icon: CreditCard },
  { key: 'domain',   label: 'النطاق',   icon: Globe },
]

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const { dir } = useLanguage()
  const [tab, setTab] = useState('general')
  const [storeId, setStoreId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // General
  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [desc, setDesc] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  // Social
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [tiktok, setTiktok] = useState('')

  // Shipping
  const [shippingZones, setShippingZones] = useState<any[]>([])

  // Payments
  const [payConfig, setPayConfig] = useState<any>({ cod_enabled: true, hyperpay_enabled: false, hyperpay_entity_id: '', paytabs_enabled: false, paytabs_profile_id: '' })
  const [payConfigId, setPayConfigId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: stores } = await supabase.from('stores').select('*').eq('user_id', user.id).limit(1)
    if (stores?.length) {
      const s = stores[0]
      setStoreId(s.id)
      setStoreName(s.name_ar || ''); setSlug(s.slug || ''); setDesc(s.description_ar || '')
      setWhatsapp(s.whatsapp || ''); setInstagram(s.instagram || ''); setFacebook(s.facebook || '')
      setCustomDomain(s.custom_domain || ''); setLogoUrl(s.logo_url || '')
      const { data: zones } = await supabase.from('store_shipping_zones').select('*').eq('store_id', s.id).order('created_at')
      setShippingZones(zones || [])
      const { data: pc } = await supabase.from('store_payment_config').select('*').eq('store_id', s.id).single()
      if (pc) { setPayConfig(pc); setPayConfigId(pc.id) }
    }
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { load() }, [load])

  const saveGeneral = async () => {
    if (!storeId) return
    setSaving(true)
    try {
      const { error } = await supabase.from('stores').update({ name_ar: storeName, slug, description_ar: desc, whatsapp, instagram, facebook, custom_domain: customDomain, logo_url: logoUrl }).eq('id', storeId)
      if (error) throw error
      toast.success('تم حفظ الإعدادات بنجاح')
    } catch { toast.error('حدث خطأ أثناء الحفظ') } finally { setSaving(false) }
  }

  const saveShipping = async () => {
    if (!storeId) return; setSaving(true)
    try {
      for (const zone of shippingZones) {
        if (!zone.name_ar) continue
        if (zone._new) {
          await supabase.from('store_shipping_zones').insert({ store_id: storeId, name_ar: zone.name_ar, cities: zone.cities, rate: zone.rate, free_above: zone.free_above, estimated_days_min: zone.estimated_days_min, estimated_days_max: zone.estimated_days_max, is_active: zone.is_active })
        } else {
          await supabase.from('store_shipping_zones').update({ name_ar: zone.name_ar, cities: zone.cities, rate: zone.rate, free_above: zone.free_above, estimated_days_min: zone.estimated_days_min, estimated_days_max: zone.estimated_days_max, is_active: zone.is_active }).eq('id', zone.id)
        }
      }
      toast.success('تم حفظ إعدادات الشحن')
      load()
    } catch { toast.error('حدث خطأ') } finally { setSaving(false) }
  }

  const savePayments = async () => {
    if (!storeId) return; setSaving(true)
    try {
      if (payConfigId) {
        await supabase.from('store_payment_config').update(payConfig).eq('id', payConfigId)
      } else {
        const { data } = await supabase.from('store_payment_config').insert({ ...payConfig, store_id: storeId }).select().single()
        if (data) setPayConfigId(data.id)
      }
      toast.success('تم حفظ إعدادات الدفع')
    } catch { toast.error('حدث خطأ') } finally { setSaving(false) }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #E5E7EB', borderRadius: 9,
    fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#0F172A',
    transition: 'border-color 0.15s',
  }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }

  if (loading) return (
    <div className="page-container">
      <div className="skeleton" style={{ height: 48, borderRadius: 10, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
    </div>
  )

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <h1 className="page-title">إعدادات المتجر</h1>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar tabs */}
        <div style={{ width: 200, flexShrink: 0 }} className="hide-on-mobile">
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: tab === t.key ? 700 : 500, background: tab === t.key ? '#EDE9FB' : 'transparent', color: tab === t.key ? '#6C3CE1' : '#374151', borderBottom: '1px solid #F1F2F6', textAlign: 'start', transition: 'all 0.12s' }}>
                  <Icon size={16} style={{ opacity: tab === t.key ? 1 : 0.6 }} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="show-on-mobile chips-row" style={{ width: '100%', marginBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`chip ${tab === t.key ? 'active' : ''}`}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card" style={{ padding: 28 }}>

            {/* ── GENERAL ── */}
            {tab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>المعلومات الأساسية</h2>
                <div>
                  <label style={labelStyle}>اسم المتجر</label>
                  <input style={inputStyle} value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="اسم متجرك" onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>الرابط المختصر (Slug)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir === 'rtl' ? 'right' : 'left']: 12, fontSize: 13, color: '#9CA3AF', pointerEvents: 'none' }}>tojjarna.com/store/</span>
                    <input style={{ ...inputStyle, [dir === 'rtl' ? 'paddingRight' : 'paddingLeft']: 170 }} value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} dir="ltr" onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>وصف المتجر</label>
                  <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="اكتب وصفاً مختصراً عن متجرك..." onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>رقم واتساب</label>
                  <input style={inputStyle} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="07xxxxxxxx" dir="ltr" onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                </div>
                <div>
                  <label style={labelStyle}>رابط الشعار (Logo URL)</label>
                  <input style={inputStyle} value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." dir="ltr" onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #F1F2F6' }}>
                  <button onClick={saveGeneral} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 9, background: saving ? '#9CA3AF' : '#6C3CE1', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                    {saving ? <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : <Save size={15} />}
                    حفظ التغييرات
                  </button>
                </div>
              </div>
            )}

            {/* ── SOCIAL ── */}
            {tab === 'social' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>وسائل التواصل الاجتماعي</h2>
                {[
                  { label: 'رابط انستغرام', value: instagram, set: setInstagram, placeholder: 'https://instagram.com/yourstore' },
                  { label: 'رابط فيسبوك',  value: facebook,  set: setFacebook,  placeholder: 'https://facebook.com/yourstore' },
                  { label: 'رابط تيك توك',  value: tiktok,   set: setTiktok,    placeholder: 'https://tiktok.com/@yourstore' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={labelStyle}>{f.label}</label>
                    <input style={inputStyle} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} dir="ltr" onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #F1F2F6' }}>
                  <button onClick={saveGeneral} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 9, background: '#6C3CE1', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Save size={15} />حفظ
                  </button>
                </div>
              </div>
            )}

            {/* ── SHIPPING ── */}
            {tab === 'shipping' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>مناطق الشحن</h2>
                  <button onClick={() => setShippingZones(prev => [...prev, { _new: true, id: `new-${Date.now()}`, store_id: storeId, name_ar: '', cities: [], rate: 2.5, free_above: null, estimated_days_min: 1, estimated_days_max: 3, is_active: true }])}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#EDE9FB', color: '#6C3CE1', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Plus size={14} />إضافة منطقة
                  </button>
                </div>
                {shippingZones.length === 0 && <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>لم تُضف أي مناطق شحن بعد</p>}
                {shippingZones.map(zone => (
                  <div key={zone.id} style={{ background: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <label style={labelStyle}>اسم المنطقة</label>
                        <input style={inputStyle} value={zone.name_ar} onChange={e => setShippingZones(prev => prev.map(z => z.id === zone.id ? { ...z, name_ar: e.target.value } : z))} placeholder="عمّان وضواحيها" onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                      </div>
                      <div style={{ width: 120 }}>
                        <label style={labelStyle}>تكلفة الشحن</label>
                        <input type="number" style={inputStyle} value={zone.rate} onChange={e => setShippingZones(prev => prev.map(z => z.id === zone.id ? { ...z, rate: parseFloat(e.target.value) } : z))} min={0} step={0.5} onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                      </div>
                      <div style={{ width: 140 }}>
                        <label style={labelStyle}>مجاني فوق (د.أ)</label>
                        <input type="number" style={inputStyle} value={zone.free_above || ''} onChange={e => setShippingZones(prev => prev.map(z => z.id === zone.id ? { ...z, free_above: e.target.value ? parseFloat(e.target.value) : null } : z))} placeholder="اختياري" onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>المدن</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {JO_CITIES.map(city => (
                          <button key={city} onClick={() => setShippingZones(prev => prev.map(z => z.id === zone.id ? { ...z, cities: z.cities?.includes(city) ? z.cities.filter((c: string) => c !== city) : [...(z.cities || []), city] } : z))}
                            style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: '1.5px solid', borderColor: zone.cities?.includes(city) ? '#6C3CE1' : '#E5E7EB', background: zone.cities?.includes(city) ? '#EDE9FB' : '#fff', color: zone.cities?.includes(city) ? '#6C3CE1' : '#6B7280', transition: 'all 0.12s' }}>
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Toggle value={zone.is_active} onChange={v => setShippingZones(prev => prev.map(z => z.id === zone.id ? { ...z, is_active: v } : z))} />
                        <span style={{ fontSize: 13, color: '#374151' }}>نشطة</span>
                      </div>
                      <button onClick={async () => { if (zone._new) { setShippingZones(prev => prev.filter(z => z.id !== zone.id)); return } await supabase.from('store_shipping_zones').delete().eq('id', zone.id); setShippingZones(prev => prev.filter(z => z.id !== zone.id)); toast.success('تم حذف المنطقة') }}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEE2E2', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Trash2 size={13} />حذف
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #F1F2F6' }}>
                  <button onClick={saveShipping} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 9, background: '#6C3CE1', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Save size={15} />حفظ مناطق الشحن
                  </button>
                </div>
              </div>
            )}

            {/* ── PAYMENTS ── */}
            {tab === 'payments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>طرق الدفع</h2>
                {[
                  { key: 'cod_enabled', label: 'الدفع عند الاستلام', desc: 'يدفع العميل عند استلام الطلب', icon: '💵' },
                  { key: 'hyperpay_enabled', label: 'HyperPay (بطاقات ائتمانية)', desc: 'فيزا، ماستر، أمريكان إكسبريس', icon: '💳' },
                  { key: 'paytabs_enabled', label: 'PayTabs', desc: 'بوابة دفع محلية وآمنة', icon: '🏦' },
                ].map(method => (
                  <div key={method.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', border: '1px solid #E5E7EB', borderRadius: 12, background: payConfig[method.key] ? '#F0EDFB' : '#fff' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 24 }}>{method.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{method.label}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{method.desc}</div>
                      </div>
                    </div>
                    <Toggle value={!!payConfig[method.key]} onChange={v => setPayConfig((prev: any) => ({ ...prev, [method.key]: v }))} />
                  </div>
                ))}
                {payConfig.hyperpay_enabled && (
                  <div>
                    <label style={labelStyle}>HyperPay Entity ID</label>
                    <input style={inputStyle} value={payConfig.hyperpay_entity_id} onChange={e => setPayConfig((p: any) => ({ ...p, hyperpay_entity_id: e.target.value }))} dir="ltr" placeholder="your-entity-id" onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                  </div>
                )}
                {payConfig.paytabs_enabled && (
                  <div>
                    <label style={labelStyle}>PayTabs Profile ID</label>
                    <input style={inputStyle} value={payConfig.paytabs_profile_id} onChange={e => setPayConfig((p: any) => ({ ...p, paytabs_profile_id: e.target.value }))} dir="ltr" placeholder="your-profile-id" onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #F1F2F6' }}>
                  <button onClick={savePayments} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 9, background: '#6C3CE1', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Save size={15} />حفظ
                  </button>
                </div>
              </div>
            )}

            {/* ── DOMAIN ── */}
            {tab === 'domain' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>النطاق المخصص</h2>
                <div style={{ background: '#EDE9FB', border: '1px solid #DDD6FB', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Globe size={18} color="#6C3CE1" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                    يمكنك إضافة نطاق خاص بك مثل <strong>mystore.com</strong>. تأكد من إعداد DNS لدى مزود النطاق وتوجيهه لخوادمنا.
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>النطاق المخصص</label>
                  <input style={inputStyle} value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="mystore.com" dir="ltr" onFocus={e => (e.target.style.borderColor = '#6C3CE1')} onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
                </div>
                <div style={{ background: '#F7F8FA', borderRadius: 10, padding: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>إعدادات DNS المطلوبة:</p>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6B7280', lineHeight: 2 }}>
                    <div>CNAME → stores.tojjarna.com</div>
                    <div>A Record → 76.76.21.21</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #F1F2F6' }}>
                  <button onClick={saveGeneral} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 9, background: '#6C3CE1', color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Save size={15} />حفظ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
