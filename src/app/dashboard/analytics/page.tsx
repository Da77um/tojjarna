'use client'

import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, ShoppingCart, Package, Users, DollarSign } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

const STATUS_COLORS: Record<string, string> = {
  delivered: '#16A34A', pending: '#D97706', processing: '#2563EB',
  cancelled: '#DC2626', shipped: '#6C3CE1', refunded: '#6B7280',
}
const STATUS_LABELS: Record<string, string> = {
  delivered: 'تم التوصيل', pending: 'انتظار', processing: 'معالجة',
  cancelled: 'ملغي', shipped: 'شحن', refunded: 'مرتجع',
}

export default function AnalyticsPage() {
  const supabase = createClient()
  const { dir } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 })
  const [revenueTrend, setRevenueTrend] = useState<any[]>([])
  const [orderStatuses, setOrderStatuses] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id)
        if (!stores?.length) return
        const storeIds = stores.map(s => s.id)

        const [analyticsRes, productCountRes, ordersRes, topProductsRes] = await Promise.all([
          supabase.rpc('get_vendor_analytics', { target_store_id: storeIds[0] }),
          supabase.from('products').select('*', { count: 'exact', head: true }).in('store_id', storeIds),
          supabase.from('orders').select('status').in('store_id', storeIds),
          supabase.from('products').select('name_ar, sold_count').in('store_id', storeIds).order('sold_count', { ascending: false }).limit(5),
        ])

        const analytics = analyticsRes.data
        setStats({
          revenue: analytics?.total_revenue || 0,
          orders: analytics?.total_orders || 0,
          products: productCountRes.count || 0,
          customers: analytics?.total_customers || 0,
        })

        const trend = (analytics?.revenue_trend || []).map((t: any) => {
          const d = new Date(t.date)
          return { day: `${d.getDate()}/${d.getMonth() + 1}`, revenue: Number(t.revenue) || 0 }
        })
        setRevenueTrend(trend.length ? trend : [
          { day: 'أمس', revenue: 0 }, { day: 'اليوم', revenue: 0 },
        ])

        const statusCounts: Record<string, number> = {}
        ordersRes.data?.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1 })
        setOrderStatuses(Object.entries(statusCounts).map(([status, count]) => ({
          name: STATUS_LABELS[status] || status,
          value: count,
          color: STATUS_COLORS[status] || '#9CA3AF',
        })))

        setTopProducts((topProductsRes.data || []).map(p => ({
          name: p.name_ar || 'منتج',
          sales: p.sold_count || 0,
        })))
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchAnalytics()
  }, [])

  const kpis = [
    { label: 'إجمالي المبيعات', value: `${stats.revenue.toLocaleString()} د.أ`, icon: DollarSign, iconBg: '#EDE9FB', iconColor: '#6C3CE1' },
    { label: 'الطلبات', value: stats.orders, icon: ShoppingCart, iconBg: '#FEF0E6', iconColor: '#F97316' },
    { label: 'العملاء', value: stats.customers, icon: Users, iconBg: '#DCFCE7', iconColor: '#16A34A' },
    { label: 'المنتجات', value: stats.products, icon: Package, iconBg: '#DBEAFE', iconColor: '#2563EB' },
  ]

  if (loading) return (
    <div className="page-container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
      </div>
      <div className="skeleton" style={{ height: 280, borderRadius: 14, marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
        <div className="skeleton" style={{ height: 240, borderRadius: 14 }} />
      </div>
    </div>
  )

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 1280 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">التحليلات</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>نظرة شاملة على أداء متجرك</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
        {kpis.map(k => {
          const Icon = k.icon
          return (
            <div key={k.label} className="stat-card">
              <div className="stat-icon" style={{ background: k.iconBg }}><Icon size={19} color={k.iconColor} /></div>
              <div>
                <div className="stat-label">{k.label}</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{k.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue trend */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>منحنى الإيرادات</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueTrend} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6C3CE1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6C3CE1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F6" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13 }} formatter={(v) => [`${v ?? 0} د.أ`, 'الإيرادات']} />
            <Area type="monotone" dataKey="revenue" stroke="#6C3CE1" strokeWidth={2.5} fill="url(#aGrad)" dot={false} activeDot={{ r: 5, fill: '#6C3CE1', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two-col: pie + bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>

        {/* Order status pie */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>توزيع حالات الطلبات</h2>
          {orderStatuses.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>لا توجد بيانات بعد</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={orderStatuses} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {orderStatuses.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                <Legend iconSize={10} iconType="circle" formatter={(value) => <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products bar */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>أفضل المنتجات مبيعاً</h2>
          {topProducts.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>لا توجد مبيعات بعد</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} formatter={(v) => [v, 'مبيعات']} />
                <Bar dataKey="sales" fill="#6C3CE1" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
