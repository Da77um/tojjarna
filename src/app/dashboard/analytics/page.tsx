'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { createClient } from '@/lib/supabase/client'

export default function AnalyticsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState([
        { label: 'إجمالي الإيرادات', value: '0', symbol: 'د.أ' },
        { label: 'إجمالي الطلبات', value: '0' },
        { label: 'إجمالي المنتجات', value: '0' },
        { label: 'إجمالي العملاء', value: '0' },
    ])
    const [monthlyRevenue, setMonthlyRevenue] = useState([])
    const [orderStatuses, setOrderStatuses] = useState([])
    const [topProducts, setTopProducts] = useState([])

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id)
                if (!stores || stores.length === 0) return
                const storeIds = stores.map(s => s.id)

                // 1. Basic Stats via RPC
                const { data: analytics } = await supabase.rpc('get_vendor_analytics', { target_store_id: storeIds[0] })
                const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).in('store_id', storeIds)

                setStats([
                    { label: 'إجمالي الإيرادات', value: (analytics?.total_revenue || 0).toLocaleString(), symbol: 'د.أ' },
                    { label: 'إجمالي الطلبات', value: (analytics?.total_orders || 0).toString() },
                    { label: 'إجمالي المنتجات', value: (productCount || 0).toString() },
                    { label: 'إجمالي العملاء', value: (analytics?.total_customers || 0).toString() },
                ])

                // 2. 30-Day Revenue Trend
                const formattedTrend = (analytics?.revenue_trend || []).map((t: any) => {
                    const d = new Date(t.date)
                    return { month: `${d.getDate()}/${d.getMonth() + 1}`, revenue: t.revenue }
                })
                setMonthlyRevenue(formattedTrend as any)

                // 3. Order Status Pie
                const { data: orders } = await supabase.from('orders').select('status').in('store_id', storeIds)
                const statusCounts: any = {}
                orders?.forEach(o => {
                    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
                })
                const statusLabels: any = { delivered: 'تم التسليم', pending: 'قيد الانتظار', processing: 'قيد المعالجة', cancelled: 'ملغي', shipped: 'قيد الشحن', refunded: 'مسترجع' }
                const statusColors: any = { delivered: '#10B981', pending: '#F59E0B', processing: '#3B82F6', cancelled: '#EF4444', shipped: '#8B5CF6', refunded: '#6B7280' }

                setOrderStatuses(Object.entries(statusCounts).map(([status, count]) => ({
                    name: statusLabels[status] || status,
                    value: Math.round(((count as number) / (orders?.length || 1)) * 100),
                    color: statusColors[status] || '#6B7280'
                })) as any)

                // 4. Top Products (Mock for now as it requires complex order_items join)
                setTopProducts([
                    { name: 'منتج تجريبي 1', sold: 45, revenue: 450 },
                    { name: 'منتج تجريبي 2', sold: 32, revenue: 320 }
                ] as any)

            } catch (err) {
                console.error('Error fetching analytics:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [supabase])

    if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">التحليلات والتقارير</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        إحصائيات متجرك المباشرة
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {stats.map((s) => (
                    <div key={s.label} className="card card-body">
                        <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)' }}>
                            {s.value}
                            {s.symbol && <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginRight: 4 }}> {s.symbol}</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                {/* Revenue Chart */}
                <div className="card card-body">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>الإيرادات (د.أ)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6C3CE1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6C3CE1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                                formatter={(v: number | undefined) => [`${v || 0} د.أ`, 'الإيرادات']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#6C3CE1" strokeWidth={2.5} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Status Pie */}
                <div className="card card-body">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>توزيع الطلبات</h3>
                    {orderStatuses.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={orderStatuses} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                        {orderStatuses.map((entry: any, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: number | undefined) => [`${v || 0}%`, '']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                {orderStatuses.map((s: any) => (
                                    <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700 }}>{s.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>لا توجد بيانات</div>
                    )}
                </div>
            </div>

            {/* Top Products */}
            <div className="card">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>أكثر المنتجات مبيعاً</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['#', 'المنتج', 'الكميات المباعة', 'الإيرادات'].map((h) => (
                                <th key={h} style={{ textAlign: 'right', padding: '12px 24px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.map((p: any, i) => (
                            <tr key={p.name} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontWeight: 700, width: 40 }}>{i + 1}</td>
                                <td style={{ padding: '14px 24px', fontWeight: 600 }}>{p.name}</td>
                                <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{p.sold} وحدة</td>
                                <td style={{ padding: '14px 24px', fontWeight: 700 }}>
                                    {p.revenue.toLocaleString()} د.أ
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
