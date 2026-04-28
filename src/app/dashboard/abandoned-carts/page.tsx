'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShoppingCart, MessageCircle, Check, Clock, RefreshCw, Phone, Search, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'

export default function AbandonedCartsPage() {
  const supabase = createClient()
  const router = useRouter()
  const { dir } = useLanguage()
  const [carts, setCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'recovered'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id).limit(1)
      if (!stores?.length) { setLoading(false); return }
      const { data } = await supabase.from('abandoned_carts').select('*').eq('store_id', stores[0].id).order('created_at', { ascending: false })
      setCarts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function markRecovered(id: string) {
    await supabase.from('abandoned_carts').update({ recovered: true }).eq('id', id)
    setCarts(prev => prev.map(c => c.id === id ? { ...c, recovered: true } : c))
    toast.success('تم تحديد السلة كمستردة')
  }

  async function sendWhatsApp(cart: any) {
    if (!cart.customer_phone) { toast.error('لا يوجد رقم جوال للعميل'); return }
    const msg = encodeURIComponent(`مرحباً ${cart.customer_name || ''}، لاحظنا أنك تركت سلة التسوق بقيمة ${Number(cart.total).toFixed(2)} د.أ. يمكنك إتمام طلبك الآن!`)
    window.open(`https://wa.me/${cart.customer_phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
    await supabase.from('abandoned_carts').update({ recovery_sent: true }).eq('id', cart.id)
    setCarts(prev => prev.map(c => c.id === cart.id ? { ...c, recovery_sent: true } : c))
  }

  const filteredCarts = carts.filter(c => {
    const matchFilter = filter === 'all' || (filter === 'recovered' ? c.recovered : !c.recovered)
    const matchSearch = !search || c.customer_name?.toLowerCase().includes(search.toLowerCase()) || c.customer_phone?.includes(search)
    return matchFilter && matchSearch
  })

  const stats = {
    total: carts.length,
    pending: carts.filter(c => !c.recovered).length,
    recovered: carts.filter(c => c.recovered).length,
    value: carts.filter(c => !c.recovered).reduce((sum, c) => sum + Number(c.total), 0),
  }

  function StatusBadge({ cart }: { cart: any }) {
    if (cart.recovered)
      return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#DCFCE7', color: '#16A34A', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}><Check size={11} />مستردة</span>
    if (cart.recovery_sent)
      return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#DBEAFE', color: '#2563EB', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}><MessageCircle size={11} />تم الإرسال</span>
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FEF3C7', color: '#D97706', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}><Clock size={11} />انتظار</span>
  }

  if (loading) return (
    <div dir={dir} className="page-container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
      </div>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 10 }} />)}
    </div>
  )

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">السلال المتروكة</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>تعافَ من الطلبات المهملة وحوّلها لمبيعات</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'إجمالي السلال', value: stats.total, iconBg: '#EDE9FB', iconColor: '#6C3CE1', icon: ShoppingCart },
          { label: 'في الانتظار', value: stats.pending, iconBg: '#FEF3C7', iconColor: '#D97706', icon: Clock },
          { label: 'تم الاسترداد', value: stats.recovered, iconBg: '#DCFCE7', iconColor: '#16A34A', icon: Check },
          { label: 'القيمة المتوقعة', value: `${stats.value.toFixed(0)} د.أ`, iconBg: '#DBEAFE', iconColor: '#2563EB', icon: DollarSign },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.iconBg }}><Icon size={18} color={s.iconColor} /></div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="mobile-search" style={{ maxWidth: 300, flex: 1, minWidth: 200 }}>
          <Search size={15} className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم العميل أو الجوال..." />
        </div>
        <div className="chips-row">
          {[
            { key: 'all', label: 'الكل', count: stats.total },
            { key: 'pending', label: 'انتظار', count: stats.pending },
            { key: 'recovered', label: 'مستردة', count: stats.recovered },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key as any)} className={`chip ${filter === tab.key ? 'active' : ''}`}>
              {tab.label}
              {tab.count > 0 && <span style={{ background: filter === tab.key ? 'rgba(255,255,255,0.3)' : '#E5E7EB', borderRadius: 100, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {filteredCarts.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <ShoppingCart size={48} color="#E5E7EB" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 6 }}>لا توجد سلال متروكة</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>ستظهر السلال المتروكة هنا تلقائياً</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card table-container hide-on-mobile">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['العميل', 'المنتجات', 'الإجمالي', 'الحالة', 'التاريخ', 'الإجراء'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: dir === 'rtl' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#F7F8FA', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCarts.map(cart => {
                  const items = Array.isArray(cart.cart_items) ? cart.cart_items : []
                  return (
                    <tr key={cart.id} style={{ borderBottom: '1px solid #F7F8FA' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#F7F8FA' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{cart.customer_name || 'زائر'}</div>
                        {cart.customer_phone && <div style={{ fontSize: 11, color: '#9CA3AF', direction: 'ltr', marginTop: 2 }}>{cart.customer_phone}</div>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{items.length} منتج</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                        {Number(cart.total).toFixed(2)} <span style={{ fontSize: 11, color: '#9CA3AF' }}>د.أ</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}><StatusBadge cart={cart} /></td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#9CA3AF' }}>{new Date(cart.created_at).toLocaleDateString('ar-JO')}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {!cart.recovered && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => sendWhatsApp(cart)}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: '#25D366', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                              <MessageCircle size={13} /> واتساب
                            </button>
                            <button onClick={() => markRecovered(cart.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRadius: 8, background: '#DCFCE7', color: '#16A34A', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                              <RefreshCw size={12} /> استرداد
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
            {filteredCarts.map(cart => {
              const items = Array.isArray(cart.cart_items) ? cart.cart_items : []
              return (
                <div key={cart.id} className="mobile-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{cart.customer_name || 'زائر'}</div>
                      {cart.customer_phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9CA3AF', marginTop: 3, direction: 'ltr' }}>
                          <Phone size={11} />{cart.customer_phone}
                        </div>
                      )}
                    </div>
                    <StatusBadge cart={cart} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ background: '#EDE9FB', color: '#6C3CE1', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      {items.length} منتج
                    </span>
                    <span style={{ background: '#F7F8FA', color: '#0F172A', padding: '5px 10px', borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
                      {Number(cart.total).toFixed(2)} د.أ
                    </span>
                    <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center', marginInlineStart: 'auto' }}>
                      {new Date(cart.created_at).toLocaleDateString('ar-JO')}
                    </span>
                  </div>
                  {!cart.recovered && (
                    <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #F1F2F6' }}>
                      <button onClick={() => sendWhatsApp(cart)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 9, background: '#25D366', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                        <MessageCircle size={16} /> واتساب
                      </button>
                      <button onClick={() => markRecovered(cart.id)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 9, background: '#DCFCE7', color: '#16A34A', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                        <RefreshCw size={15} /> تم الاسترداد
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
