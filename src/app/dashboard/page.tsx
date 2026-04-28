'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package,
  DollarSign, Plus, ExternalLink, ArrowLeft, ArrowRight,
  Clock, CheckCircle, Truck, XCircle, RotateCcw, AlertCircle,
  BarChart3,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const statusMap: Record<string, { label: string; badge: string }> = {
  pending:    { label: 'قيد الانتظار', badge: 'badge badge-warning' },
  processing: { label: 'قيد المعالجة', badge: 'badge badge-info' },
  shipped:    { label: 'تم الشحن',    badge: 'badge badge-purple' },
  delivered:  { label: 'تم التوصيل',  badge: 'badge badge-success' },
  cancelled:  { label: 'ملغي',        badge: 'badge badge-error' },
  refunded:   { label: 'مرتجع',       badge: 'badge badge-gray' },
}

const mockChartData = [
  { day: 'السبت',   revenue: 320 },
  { day: 'الأحد',   revenue: 480 },
  { day: 'الاثنين', revenue: 290 },
  { day: 'الثلاثاء',revenue: 620 },
  { day: 'الأربعاء',revenue: 540 },
  { day: 'الخميس', revenue: 780 },
  { day: 'الجمعة', revenue: 950 },
]

export default function DashboardHomePage() {
  const supabase = createClient()
  const { t, dir } = useLanguage()

  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('التاجر')
  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')

  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('users').select('name').eq('id', user.id).single()
        setUserName(profile?.name || user.user_metadata?.name || 'التاجر')

        const { data: stores } = await supabase.from('stores').select('id, name_ar, slug').eq('user_id', user.id)
        if (!stores?.length) { setLoading(false); return }

        setStoreName(stores[0].name_ar || '')
        setStoreSlug(stores[0].slug || '')
        const storeId = stores[0].id

        const [analyticsRes, productsRes, ordersRes] = await Promise.all([
          supabase.rpc('get_vendor_analytics', { target_store_id: storeId }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
          supabase.from('orders')
            .select('id, order_number, status, total, created_at, customer_name, customer_phone')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false })
            .limit(6),
        ])

        setStats({
          revenue: analyticsRes.data?.total_revenue || 0,
          orders: analyticsRes.data?.total_orders || 0,
          products: productsRes.count || 0,
          customers: analyticsRes.data?.total_customers || 0,
        })

        setRecentOrders(ordersRes.data || [])
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="page-container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div className="skeleton" style={{ height: 280, borderRadius: 14 }} />
        <div className="skeleton" style={{ height: 280, borderRadius: 14 }} />
      </div>
    </div>
  )

  const kpis = [
    {
      label: 'إجمالي المبيعات',
      value: `${stats.revenue.toLocaleString('ar-JO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.أ`,
      trend: '+12.5%',
      up: true,
      icon: DollarSign,
      iconBg: '#EDE9FB',
      iconColor: '#6C3CE1',
    },
    {
      label: 'الطلبات',
      value: stats.orders.toString(),
      trend: '+8',
      up: true,
      icon: ShoppingCart,
      iconBg: '#FEF0E6',
      iconColor: '#F97316',
    },
    {
      label: 'العملاء',
      value: stats.customers.toString(),
      trend: '+5',
      up: true,
      icon: Users,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
    },
    {
      label: 'المنتجات',
      value: stats.products.toString(),
      trend: null,
      up: true,
      icon: Package,
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
    },
  ]

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 1280 }}>

      {/* ── Greeting banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #4A22B8 0%, #6C3CE1 55%, #8B5CF6 100%)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-5%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 4, fontWeight: 600 }}>مرحباً بعودتك 👋</p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>
            {userName}
          </h1>
          {storeName && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{storeName}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {storeSlug && (
            <a href={`/store/${storeSlug}`} target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <ExternalLink size={14} />
              عرض المتجر
            </a>
          )}
          <Link href="/dashboard/products/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 9, background: '#F97316', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(249,115,22,0.35)' }}>
            <Plus size={16} />
            إضافة منتج
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="stat-card">
              <div className="stat-icon" style={{ background: kpi.iconBg }}>
                <Icon size={20} color={kpi.iconColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="stat-label">{kpi.label}</div>
                <div className="stat-value" style={{ fontSize: 22, marginTop: 2 }}>{kpi.value}</div>
                {kpi.trend && (
                  <div className={`stat-trend ${kpi.up ? 'up' : 'down'}`} style={{ display: 'inline-flex', fontSize: 11, marginTop: 6 }}>
                    {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {kpi.trend}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Main grid: chart + quick actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20, marginBottom: 28 }} className="product-form-grid">

        {/* Revenue Chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>المبيعات — آخر 7 أيام</h2>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>إجمالي إيرادات الأسبوع الماضي</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: '#F7F8FA', fontSize: 12, fontWeight: 600, color: '#6B7280' }}>
              <BarChart3 size={14} />
              أسبوعي
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C3CE1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6C3CE1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 4px 12px rgba(15,23,42,0.08)', fontSize: 13 }}
                formatter={(val) => [`${val ?? 0} د.أ`, 'المبيعات']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6C3CE1" strokeWidth={2} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#6C3CE1', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>إجراءات سريعة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'إضافة منتج جديد', href: '/dashboard/products/new', color: '#6C3CE1', bg: '#EDE9FB' },
              { label: 'عرض الطلبات الجديدة', href: '/dashboard/orders', color: '#F97316', bg: '#FEF0E6' },
              { label: 'تصميم المتجر', href: '/dashboard/theme-editor', color: '#16A34A', bg: '#DCFCE7' },
              { label: 'كوبون جديد', href: '/dashboard/coupons', color: '#2563EB', bg: '#DBEAFE' },
              { label: 'تقارير المبيعات', href: '/dashboard/analytics', color: '#7C3AED', bg: '#EDE9FE' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 10, background: a.bg, textDecoration: 'none',
                color: a.color, fontWeight: 600, fontSize: 13, transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.8' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' }}>
                <Arrow size={14} />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F1F2F6' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>أحدث الطلبات</h2>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>آخر {recentOrders.length} طلبات</p>
          </div>
          <Link href="/dashboard/orders" style={{ fontSize: 13, fontWeight: 600, color: '#6C3CE1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            عرض الكل
            <Arrow size={14} />
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hide-on-mobile">
          {recentOrders.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <ShoppingCart size={40} color="#E5E7EB" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>لا توجد طلبات حتى الآن</p>
              <p style={{ color: '#D1D5DB', fontSize: 12, marginTop: 4 }}>ابدأ بمشاركة رابط متجرك</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['رقم الطلب', 'العميل', 'الحالة', 'المبلغ', 'التاريخ'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: dir === 'rtl' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#F7F8FA', borderBottom: '1px solid #F1F2F6' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => {
                  const s = statusMap[order.status] || statusMap.pending
                  const date = new Date(order.created_at).toLocaleDateString('ar-JO', { month: 'short', day: 'numeric' })
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #F7F8FA' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#F7F8FA' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <Link href={`/dashboard/orders/${order.id}`} style={{ fontWeight: 700, color: '#6C3CE1', textDecoration: 'none', fontSize: 14 }}>
                          #{order.order_number || order.id.slice(0,6).toUpperCase()}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C3CE1', fontWeight: 800, fontSize: 12 }}>
                            {(order.customer_name || order.customer_phone || '؟')[0]}
                          </div>
                          <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{order.customer_name || order.customer_phone || 'زائر'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={s.badge}>{s.label}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                        {Number(order.total).toFixed(2)} <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF' }}>د.أ</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#9CA3AF' }}>{date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile cards */}
        <div className="show-on-mobile" style={{ padding: 16, flexDirection: 'column', gap: 10 }}>
          {recentOrders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '32px 0', fontSize: 14 }}>لا توجد طلبات حتى الآن</p>
          ) : recentOrders.map(order => {
            const s = statusMap[order.status] || statusMap.pending
            return (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="mobile-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textDecoration: 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>#{order.order_number || order.id.slice(0,6).toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{order.customer_name || order.customer_phone || 'زائر'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className={s.badge}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{Number(order.total).toFixed(2)} د.أ</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
