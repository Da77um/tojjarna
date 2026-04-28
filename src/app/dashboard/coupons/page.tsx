'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Tag, Percent, DollarSign, Trash2, AlertTriangle, Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'

export default function CouponsPage() {
  const supabase = createClient()
  const { dir } = useLanguage()
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [coupons, setCoupons] = useState<any[]>([])

  const [code, setCode] = useState('')
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage')
  const [value, setValue] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [limit, setLimit] = useState('')

  async function fetchCoupons() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id)
      if (!stores?.length) return
      const { data } = await supabase.from('coupons').select('*').in('store_id', stores.map(s => s.id)).order('created_at', { ascending: false })
      setCoupons(data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCoupons() }, [])

  const filtered = coupons.filter(c => c.code?.toLowerCase().includes(search.toLowerCase()))
  const activeCount = coupons.filter(c => c.is_active).length

  async function handleSave() {
    if (!code || !value) { toast.error('أدخل الكود وقيمة الخصم'); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: store } = await supabase.from('stores').select('id').eq('user_id', user?.id).single()
      const { error } = await supabase.from('coupons').insert({
        store_id: store?.id, code: code.toUpperCase(),
        type: type === 'percentage' ? 'percent' : 'fixed',
        value: Number(value), min_order: minOrder ? Number(minOrder) : null,
        usage_limit: limit ? Number(limit) : null, is_active: true,
      })
      if (error) throw error
      setShowNew(false); setCode(''); setValue(''); setMinOrder(''); setLimit('')
      toast.success('تم إضافة الكوبون')
      fetchCoupons()
    } catch { toast.error('فشل الحفظ') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (!error) { toast.success('تم حذف الكوبون'); fetchCoupons() }
    else toast.error('فشل الحذف')
    setDeleteId(null)
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success('تم نسخ الكود')
  }

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' }

  if (loading) return (
    <div dir={dir} className="page-container">
      <div style={{ height: 32, width: 140, borderRadius: 8, marginBottom: 20 }} className="skeleton" />
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12, marginBottom: 10 }} />)}
    </div>
  )

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">الكوبونات</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>{activeCount} كوبون نشط</p>
        </div>
        <button onClick={() => setShowNew(!showNew)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: '#6C3CE1', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(108,60,225,0.22)' }}>
          <Plus size={16} /> إضافة كوبون
        </button>
      </div>

      {/* New coupon form */}
      {showNew && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 20, borderTop: '3px solid #6C3CE1' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 18 }}>كوبون جديد</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>كود الخصم <span style={{ color: '#DC2626' }}>*</span></label>
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="WELCOME20" dir="ltr"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>نوع الخصم</label>
              <select value={type} onChange={e => setType(e.target.value as any)}
                style={{ ...inputStyle, background: '#fff' }}
                onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}>
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (د.أ)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>قيمة الخصم <span style={{ color: '#DC2626' }}>*</span></label>
              <input value={value} onChange={e => setValue(e.target.value)} type="number" placeholder={type === 'percentage' ? '20' : '5.000'}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>الحد الأدنى للطلب (د.أ)</label>
              <input value={minOrder} onChange={e => setMinOrder(e.target.value)} type="number" placeholder="اختياري"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>حد الاستخدام</label>
              <input value={limit} onChange={e => setLimit(e.target.value)} type="number" placeholder="غير محدود"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowNew(false)} disabled={saving}
              style={{ padding: '9px 18px', borderRadius: 9, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              إلغاء
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: '9px 20px', borderRadius: 9, background: '#6C3CE1', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'جاري الحفظ...' : 'حفظ الكوبون'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mobile-search" style={{ marginBottom: 20, maxWidth: 360 }}>
        <Search size={15} className="search-icon" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن كوبون..." />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <Tag size={48} color="#E5E7EB" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 6 }}>لا توجد كوبونات</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>أنشئ كوبون خصم لجذب المزيد من العملاء</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card table-container hide-on-mobile">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['الكود', 'الخصم', 'الشرط', 'الاستخدام', 'الحالة', 'تاريخ الانتهاء', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: dir === 'rtl' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#F7F8FA', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(coupon => (
                  <tr key={coupon.id} style={{ borderBottom: '1px solid #F7F8FA' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#F7F8FA' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag size={14} color="#6C3CE1" />
                        <span style={{ fontWeight: 800, fontSize: 14, color: '#6C3CE1', fontFamily: 'monospace', letterSpacing: 1 }}>{coupon.code}</span>
                        <button onClick={() => copyCode(coupon.code)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                          <Copy size={11} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                        {coupon.type === 'percent' ? <Percent size={14} color="#16A34A" /> : <DollarSign size={14} color="#D97706" />}
                        {coupon.type === 'percent' ? `${coupon.value}%` : `${Number(coupon.value).toFixed(3)} د.أ`}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
                      {coupon.min_order ? `فوق ${coupon.min_order} د.أ` : 'بدون حد أدنى'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                        {coupon.usage_count || 0} / {coupon.usage_limit ?? '∞'}
                      </div>
                      {coupon.usage_limit && (
                        <div style={{ height: 4, borderRadius: 4, background: '#E5E7EB', overflow: 'hidden', width: 70 }}>
                          <div style={{ height: '100%', background: (coupon.usage_count || 0) >= coupon.usage_limit ? '#DC2626' : '#6C3CE1', width: `${Math.min(((coupon.usage_count || 0) / coupon.usage_limit) * 100, 100)}%`, borderRadius: 4, transition: 'width 0.3s' }} />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={coupon.is_active ? 'badge badge-success' : 'badge badge-gray'}>
                        {coupon.is_active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#9CA3AF' }}>
                      {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('ar-JO') : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => setDeleteId(coupon.id)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
            {filtered.map(coupon => (
              <div key={coupon.id} className="mobile-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag size={16} color="#6C3CE1" />
                    <span style={{ fontWeight: 900, fontSize: 16, color: '#6C3CE1', fontFamily: 'monospace' }}>{coupon.code}</span>
                  </div>
                  <span className={coupon.is_active ? 'badge badge-success' : 'badge badge-gray'}>
                    {coupon.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EDE9FB', color: '#6C3CE1', padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
                    {coupon.type === 'percent' ? <Percent size={12} /> : <DollarSign size={12} />}
                    {coupon.type === 'percent' ? `${coupon.value}%` : `${Number(coupon.value).toFixed(2)} د.أ`}
                  </span>
                  <span style={{ background: '#F7F8FA', color: '#6B7280', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                    {coupon.usage_count || 0} / {coupon.usage_limit ?? '∞'} استخدام
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid #F1F2F6' }}>
                  <button onClick={() => copyCode(coupon.code)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px', borderRadius: 8, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    <Copy size={13} /> نسخ الكود
                  </button>
                  <button onClick={() => setDeleteId(coupon.id)} style={{ width: 40, height: 40, borderRadius: 8, border: 'none', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24, borderRadius: 18 }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={20} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>حذف الكوبون؟</h3>
                <p style={{ fontSize: 14, color: '#6B7280' }}>هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الكوبون نهائياً.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>إلغاء</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#DC2626', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
