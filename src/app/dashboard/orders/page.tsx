'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'
import { Search, ShoppingCart, ArrowLeft, ArrowRight, Filter } from 'lucide-react'

const statusMap: Record<string, { label: string; badge: string }> = {
  pending:    { label: 'قيد الانتظار', badge: 'badge badge-warning' },
  processing: { label: 'قيد المعالجة', badge: 'badge badge-info' },
  shipped:    { label: 'تم الشحن',    badge: 'badge badge-purple' },
  delivered:  { label: 'تم التوصيل',  badge: 'badge badge-success' },
  cancelled:  { label: 'ملغي',        badge: 'badge badge-error' },
  refunded:   { label: 'مرتجع',       badge: 'badge badge-gray' },
}

const tabs = [
  { key: 'all',        label: 'الكل' },
  { key: 'pending',    label: 'انتظار' },
  { key: 'processing', label: 'معالجة' },
  { key: 'shipped',    label: 'شحن' },
  { key: 'delivered',  label: 'تم التوصيل' },
  { key: 'cancelled',  label: 'ملغي' },
]

export default function OrdersPage() {
  const supabase = createClient()
  const { dir } = useLanguage()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id)
        if (!stores?.length) return
        const { data } = await supabase
          .from('orders').select('*').in('store_id', stores.map(s => s.id))
          .order('created_at', { ascending: false })
        setOrders(data || [])
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchOrders()
  }, [])

  const filtered = orders.filter(o => {
    const matchSearch = o.customer_name?.toLowerCase().includes(search.toLowerCase())
      || o.customer_phone?.includes(search)
      || String(o.order_number).includes(search)
    const matchTab = activeTab === 'all' || o.status === activeTab
    return matchSearch && matchTab
  })

  const counts: Record<string, number> = { all: orders.length }
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 1280 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">الطلبات</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>{orders.length} طلب إجمالاً</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="chips-row" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 6 }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`chip ${activeTab === tab.key ? 'active' : ''}`}
            style={{ gap: 6 }}>
            {tab.label}
            {counts[tab.key] > 0 && (
              <span style={{ background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : '#E5E7EB', borderRadius: 100, padding: '1px 7px', fontSize: 11, fontWeight: 700, color: activeTab === tab.key ? 'inherit' : '#6B7280' }}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mobile-search" style={{ maxWidth: 360, marginBottom: 20 }}>
        <Search size={15} className="search-icon" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم العميل أو رقم الطلب..." />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <ShoppingCart size={48} color="#E5E7EB" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 6 }}>لا توجد طلبات</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>ستظهر الطلبات هنا عند بدء العملاء بالشراء</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card table-container hide-on-mobile">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['رقم الطلب', 'العميل', 'الحالة', 'طريقة الدفع', 'المبلغ', 'التاريخ', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: dir === 'rtl' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#F7F8FA', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const s = statusMap[o.status] || statusMap.pending
                  const date = new Date(o.created_at).toLocaleDateString('ar-JO', { year: 'numeric', month: 'short', day: 'numeric' })
                  const payLabel = o.payment_method === 'cod' ? 'عند الاستلام' : o.payment_method === 'card' ? 'بطاقة' : o.payment_method || '-'
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #F7F8FA' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#F7F8FA' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#6C3CE1', fontSize: 14 }}>#{o.order_number || o.id.slice(0,6).toUpperCase()}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C3CE1', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                            {(o.customer_name || o.customer_phone || '؟')[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{o.customer_name || 'زائر'}</div>
                            {o.customer_phone && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{o.customer_phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}><span className={s.badge}>{s.label}</span></td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{payLabel}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                        {Number(o.total).toFixed(2)} <span style={{ fontSize: 11, color: '#9CA3AF' }}>د.أ</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: '#9CA3AF' }}>{date}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <Link href={`/dashboard/orders/${o.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 7, border: '1px solid #E5E7EB', color: '#374151', fontSize: 12, fontWeight: 600, textDecoration: 'none', background: '#fff' }}>
                          عرض <Arrow size={12} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
            {filtered.map(o => {
              const s = statusMap[o.status] || statusMap.pending
              const date = new Date(o.created_at).toLocaleDateString('ar-JO', { month: 'short', day: 'numeric' })
              return (
                <Link key={o.id} href={`/dashboard/orders/${o.id}`} className="mobile-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#6C3CE1' }}>#{o.order_number || o.id.slice(0,6).toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: '#374151', marginTop: 2, fontWeight: 500 }}>{o.customer_name || 'زائر'}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{date}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                    <span className={s.badge}>{s.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{Number(o.total).toFixed(2)} د.أ</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
