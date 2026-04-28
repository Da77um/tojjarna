'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'
import { Search, Users, Phone, Mail, ShoppingCart, DollarSign } from 'lucide-react'

export default function CustomersPage() {
  const supabase = createClient()
  const { dir } = useLanguage()
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'vip' | 'new'>('all')

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id)
        if (!stores?.length) return
        const { data } = await supabase
          .from('customers').select('*').in('store_id', stores.map(s => s.id))
          .order('created_at', { ascending: false })
        setCustomers(data || [])
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchCustomers()
  }, [])

  const filtered = customers.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filter === 'vip') return (c.total_spent || 0) > 100
    if (filter === 'new') {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(c.created_at) > weekAgo
    }
    return true
  })

  const totalRevenue = customers.reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0)
  const vipCount = customers.filter(c => (c.total_spent || 0) > 100).length

  const tabs = [
    { key: 'all', label: 'الكل', count: customers.length },
    { key: 'vip', label: 'VIP', count: vipCount },
    { key: 'new', label: 'جدد', count: customers.filter(c => { const w = new Date(); w.setDate(w.getDate()-7); return new Date(c.created_at) > w }).length },
  ]

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 1280 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">العملاء</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>{customers.length} عميل مسجّل</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'إجمالي العملاء', value: customers.length, icon: Users, iconBg: '#EDE9FB', iconColor: '#6C3CE1' },
          { label: 'عملاء VIP', value: vipCount, icon: Users, iconBg: '#FEF0E6', iconColor: '#F97316' },
          { label: 'إجمالي الإنفاق', value: `${totalRevenue.toFixed(0)} د.أ`, icon: DollarSign, iconBg: '#DCFCE7', iconColor: '#16A34A' },
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="mobile-search" style={{ maxWidth: 320, flex: 1, minWidth: 200 }}>
          <Search size={15} className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الجوال..." />
        </div>
        <div className="chips-row">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key as any)} className={`chip ${filter === tab.key ? 'active' : ''}`}>
              {tab.label}
              {tab.count > 0 && <span style={{ background: filter === tab.key ? 'rgba(255,255,255,0.3)' : '#E5E7EB', borderRadius: 100, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <Users size={48} color="#E5E7EB" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 6 }}>لا يوجد عملاء</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>سيظهر عملاؤك هنا بعد أول طلب</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card table-container hide-on-mobile">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['العميل', 'رقم الجوال', 'البريد الإلكتروني', 'المدينة', 'الطلبات', 'الإنفاق', 'الانضمام'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: dir === 'rtl' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#F7F8FA', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F7F8FA' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#F7F8FA' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C3CE1', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                          {(c.name || c.phone || '؟')[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{c.name || 'بدون اسم'}</div>
                          {(c.total_spent || 0) > 100 && <span className="badge badge-coral" style={{ fontSize: 10, marginTop: 2 }}>VIP</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151', direction: 'ltr' }}>{c.phone || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{c.email || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{c.city || '-'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ShoppingCart size={13} color="#9CA3AF" />
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{c.total_orders || 0}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                      {Number(c.total_spent || 0).toFixed(2)} <span style={{ fontSize: 11, color: '#9CA3AF' }}>د.أ</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#9CA3AF' }}>
                      {new Date(c.created_at).toLocaleDateString('ar-JO', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
            {filtered.map(c => (
              <div key={c.id} className="mobile-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C3CE1', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                  {(c.name || c.phone || '؟')[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{c.name || 'بدون اسم'}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{c.phone || c.email || '-'}</div>
                </div>
                <div style={{ textAlign: 'end' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{Number(c.total_spent || 0).toFixed(0)} د.أ</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{c.total_orders || 0} طلب</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
