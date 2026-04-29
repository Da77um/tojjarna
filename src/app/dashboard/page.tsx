'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package,
  DollarSign, Plus, ExternalLink, ArrowLeft, ArrowRight,
  BarChart3,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

// Desert Luxe palette
const SAND        = '#C9A96E'
const SAND_LIGHT  = '#F5EDD8'
const SAND_DARK   = '#A07840'
const OBSIDIAN    = '#1A1A1A'
const ALABASTER   = '#F5F0E8'
const TERRACOTTA  = '#B85C38'
const TERRA_LIGHT = '#FAEADE'
const SAGE        = '#6B7C6B'
const SAGE_LIGHT  = '#E0E9E0'
const MUTED       = '#6B6355'
const BORDER      = '#DDD5C4'
const SURFACE     = '#FFFFFF'
const SURFACE_2   = '#EDE8DE'

const statusMap: Record<string, { label: string; badge: string }> = {
  pending:    { label: 'قيد الانتظار', badge: 'badge badge-warning' },
  processing: { label: 'قيد المعالجة', badge: 'badge badge-info' },
  shipped:    { label: 'تم الشحن',    badge: 'badge badge-purple' },
  delivered:  { label: 'تم التوصيل',  badge: 'badge badge-success' },
  cancelled:  { label: 'ملغي',        badge: 'badge badge-error' },
  refunded:   { label: 'مرتجع',       badge: 'badge badge-gray' },
}

const mockChartData = [
  { day: 'السبت',    revenue: 320 },
  { day: 'الأحد',    revenue: 480 },
  { day: 'الاثنين',  revenue: 290 },
  { day: 'الثلاثاء', revenue: 620 },
  { day: 'الأربعاء', revenue: 540 },
  { day: 'الخميس',  revenue: 780 },
  { day: 'الجمعة',  revenue: 950 },
]

export default function DashboardHomePage() {
  const supabase = createClient()
  const { dir } = useLanguage()

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
      iconBg: SAND_LIGHT,
      iconColor: SAND_DARK,
    },
    {
      label: 'الطلبات',
      value: stats.orders.toString(),
      trend: '+8',
      up: true,
      icon: ShoppingCart,
      iconBg: TERRA_LIGHT,
      iconColor: TERRACOTTA,
    },
    {
      label: 'العملاء',
      value: stats.customers.toString(),
      trend: '+5',
      up: true,
      icon: Users,
      iconBg: SAGE_LIGHT,
      iconColor: SAGE,
    },
    {
      label: 'المنتجات',
      value: stats.products.toString(),
      trend: null,
      up: true,
      icon: Package,
      iconBg: SURFACE_2,
      iconColor: MUTED,
    },
  ]

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 1280 }}>

      {/* ── Greeting banner — obsidian with sand glow ── */}
      <div style={{
        background: `linear-gradient(135deg, ${OBSIDIAN} 0%, #241C0F 55%, ${OBSIDIAN} 100%)`,
        borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(26,26,26,0.18)',
      }}>
        {/* Sand glow orb */}
        <div style={{ position: 'absolute', top: '-30%', insetInlineEnd: '5%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(201,169,110,0.18) 0%, transparent 68%)', borderRadius: '50%', pointerEvents: 'none' }} />
        {/* Geometric arabesque micro-pattern */}
        <div className="arabesque-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 12, color: 'rgba(201,169,110,0.7)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            مرحباً بعودتك
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#F5F0E8', letterSpacing: '-0.02em', marginBottom: 4, fontFamily: '"IBM Plex Arabic", "Cairo", sans-serif' }}>
            {userName}
          </h1>
          {storeName && (
            <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: SAND, opacity: 0.7 }} />
              {storeName}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', position: 'relative' }}>
          {storeSlug && (
            <a href={`/store/${storeSlug}`} target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'rgba(245,240,232,0.08)', border: '1px solid rgba(245,240,232,0.15)', color: 'rgba(245,240,232,0.8)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}>
              <ExternalLink size={13} />
              عرض المتجر
            </a>
          )}
          <Link href="/dashboard/products/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: SAND, color: OBSIDIAN, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(201,169,110,0.4)', transition: 'all 0.15s' }}>
            <Plus size={15} />
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

        {/* Revenue Chart — sand fill */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: OBSIDIAN, marginBottom: 2 }}>المبيعات — آخر 7 أيام</h2>
              <p style={{ fontSize: 13, color: MUTED }}>إجمالي إيرادات الأسبوع الماضي</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: SURFACE_2, fontSize: 12, fontWeight: 600, color: MUTED }}>
              <BarChart3 size={14} />
              أسبوعي
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={SAND} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={SAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, boxShadow: '0 4px 12px rgba(26,26,26,0.08)', fontSize: 13 }}
                formatter={(val) => [`${val ?? 0} د.أ`, 'المبيعات']}
              />
              <Area type="monotone" dataKey="revenue" stroke={SAND} strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: SAND, stroke: SURFACE, strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions — warm palette */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: OBSIDIAN, marginBottom: 16 }}>إجراءات سريعة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'إضافة منتج جديد',    href: '/dashboard/products/new',   color: SAND_DARK,   bg: SAND_LIGHT   },
              { label: 'عرض الطلبات الجديدة', href: '/dashboard/orders',         color: TERRACOTTA,  bg: TERRA_LIGHT  },
              { label: 'تصميم المتجر',        href: '/dashboard/theme-editor',   color: SAGE,        bg: SAGE_LIGHT   },
              { label: 'كوبون جديد',          href: '/dashboard/coupons',        color: '#7A5A1A',   bg: '#FBF3E0'    },
              { label: 'تقارير المبيعات',     href: '/dashboard/analytics',      color: MUTED,       bg: SURFACE_2    },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 10, background: a.bg, textDecoration: 'none',
                color: a.color, fontWeight: 600, fontSize: 13,
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.75' }}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${SURFACE_2}` }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: OBSIDIAN }}>أحدث الطلبات</h2>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>آخر {recentOrders.length} طلبات</p>
          </div>
          <Link href="/dashboard/orders" style={{ fontSize: 13, fontWeight: 600, color: SAND_DARK, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            عرض الكل
            <Arrow size={14} />
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hide-on-mobile">
          {recentOrders.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <ShoppingCart size={40} color={BORDER} style={{ margin: '0 auto 12px' }} />
              <p style={{ color: MUTED, fontSize: 14 }}>لا توجد طلبات حتى الآن</p>
              <p style={{ color: BORDER, fontSize: 12, marginTop: 4 }}>ابدأ بمشاركة رابط متجرك</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['رقم الطلب', 'العميل', 'الحالة', 'المبلغ', 'التاريخ'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: dir === 'rtl' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', background: SURFACE_2, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const s = statusMap[order.status] || statusMap.pending
                  const date = new Date(order.created_at).toLocaleDateString('ar-JO', { month: 'short', day: 'numeric' })
                  return (
                    <tr key={order.id} style={{ borderBottom: `1px solid ${ALABASTER}` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = SURFACE_2 }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <Link href={`/dashboard/orders/${order.id}`} style={{ fontWeight: 700, color: SAND_DARK, textDecoration: 'none', fontSize: 14 }}>
                          #{order.order_number || order.id.slice(0,6).toUpperCase()}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: SAND_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', color: SAND_DARK, fontWeight: 800, fontSize: 12 }}>
                            {(order.customer_name || order.customer_phone || '؟')[0]}
                          </div>
                          <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{order.customer_name || order.customer_phone || 'زائر'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={s.badge}>{s.label}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: 14, color: OBSIDIAN }}>
                        {Number(order.total).toFixed(2)} <span style={{ fontSize: 11, fontWeight: 500, color: MUTED }}>د.أ</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: MUTED }}>{date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile order cards */}
        <div className="show-on-mobile" style={{ padding: 16, flexDirection: 'column', gap: 10 }}>
          {recentOrders.length === 0 ? (
            <p style={{ textAlign: 'center', color: MUTED, padding: '32px 0', fontSize: 14 }}>لا توجد طلبات حتى الآن</p>
          ) : recentOrders.map(order => {
            const s = statusMap[order.status] || statusMap.pending
            return (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="mobile-card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, textDecoration: 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: OBSIDIAN }}>#{order.order_number || order.id.slice(0,6).toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{order.customer_name || order.customer_phone || 'زائر'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className={s.badge}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: OBSIDIAN }}>{Number(order.total).toFixed(2)} د.أ</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
