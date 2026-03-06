'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, ShoppingBag, Package, Users } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

const STAT_ICONS = [TrendingUp, ShoppingBag, Package, Users]
const STAT_COLORS = ['#C6A75E', '#10B981', '#3B82F6', '#8B5CF6']

export default function AnalyticsPage() {
    const supabase = createClient()
    const { t, dir } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState([
        { label: 'إجمالي الإيرادات', value: '0', symbol: 'د.أ' },
        { label: 'إجمالي الطلبات', value: '0', symbol: '' },
        { label: 'إجمالي المنتجات', value: '0', symbol: '' },
        { label: 'إجمالي العملاء', value: '0', symbol: '' },
    ])
    const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
    const [orderStatuses, setOrderStatuses] = useState<any[]>([])
    const [topProducts, setTopProducts] = useState<any[]>([])

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id)
                if (!stores || stores.length === 0) return
                const storeIds = stores.map(s => s.id)

                const { data: analytics } = await supabase.rpc('get_vendor_analytics', { target_store_id: storeIds[0] })
                const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).in('store_id', storeIds)

                setStats([
                    { label: 'إجمالي الإيرادات', value: (analytics?.total_revenue || 0).toLocaleString(), symbol: 'د.أ' },
                    { label: 'إجمالي الطلبات', value: (analytics?.total_orders || 0).toString(), symbol: '' },
                    { label: 'إجمالي المنتجات', value: (productCount || 0).toString(), symbol: '' },
                    { label: 'إجمالي العملاء', value: (analytics?.total_customers || 0).toString(), symbol: '' },
                ])

                const formattedTrend = (analytics?.revenue_trend || []).map((t: any) => {
                    const d = new Date(t.date)
                    return { month: `${d.getDate()}/${d.getMonth() + 1}`, revenue: t.revenue }
                })
                setMonthlyRevenue(formattedTrend)

                const { data: orders } = await supabase.from('orders').select('status').in('store_id', storeIds)
                const statusCounts: any = {}
                orders?.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1 })
                const statusColors: any = { delivered: '#10B981', pending: '#F59E0B', processing: '#3B82F6', cancelled: '#EF4444', shipped: '#8B5CF6', refunded: '#6B7280' }

                setOrderStatuses(Object.entries(statusCounts).map(([status, count]) => ({
                    statusKey: status,
                    value: Math.round(((count as number) / (orders?.length || 1)) * 100),
                    color: statusColors[status] || '#6B7280'
                })))

                setTopProducts([
                    { name: 'منتج تجريبي 1', sold: 45, revenue: 450 },
                    { name: 'منتج تجريبي 2', sold: 32, revenue: 320 }
                ])

            } catch (err) {
                console.error('Error fetching analytics:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [supabase])

    if (loading) return (
        <div className="page-container" dir={dir}>
            <div style={{ marginBottom: 20 }}>
                <div className="skeleton skeleton-text" style={{ width: 180, height: 24, marginBottom: 8 }} />
            </div>
            <div className="mobile-grid-2" style={{ marginBottom: 20 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 14 }} />)}
            </div>
            <div className="skeleton" style={{ height: 260, borderRadius: 16, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        </div>
    )

    return (
        <div className="page-container" dir={dir}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t.analytics.title}</h1>
                    <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>{t.analytics.subtitle}</p>
                </div>
            </div>

            {/* KPI Cards — 2-per-row mobile, 4 desktop */}
            <div className="mobile-grid-2" style={{ marginBottom: 24 }}>
                {stats.map((s, i) => {
                    const Icon = STAT_ICONS[i] || TrendingUp
                    const labels = [t.analytics.totalRevenue, t.analytics.totalOrders, t.analytics.totalProducts, t.analytics.totalCustomers]
                    const symbols = [t.common.currency, '', '', '']
                    return (
                        <div key={i} className="card card-body" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${STAT_COLORS[i]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={18} color={STAT_COLORS[i]} />
                                </div>
                                <span style={{ fontSize: 12, color: '#6B6058', fontWeight: 600, lineHeight: 1.3 }}>{labels[i]}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                <span style={{ fontSize: 24, fontWeight: 900, color: '#111', lineHeight: 1 }}>{s.value}</span>
                                {symbols[i] && <span style={{ fontSize: 13, color: '#6B6058', fontWeight: 600 }}>{symbols[i]}</span>}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Revenue Chart — full width */}
            <div className="card card-body" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: '#111' }}>{t.analytics.revenue30Days}</h3>
                {monthlyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={monthlyRevenue} margin={{ top: 4, right: 0, left: -22, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A09080' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#A09080' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#FFF', border: '1px solid #E0D6C8', borderRadius: 10, fontSize: 13, textAlign: dir === 'rtl' ? 'right' : 'left' }}
                                formatter={(v: any) => [`${v || 0} ${t.common.currency}`, t.analytics.revenue]}
                            />
                            <Bar dataKey="revenue" fill="#C6A75E" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#A09080', gap: 8 }}>
                        <TrendingUp size={36} color="#D4C8BB" />
                        <span style={{ fontSize: 14 }}>{t.analytics.noRevenueData}</span>
                    </div>
                )}
            </div>

            {/* Order status + Top products — stacked on mobile, side-by-side on desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
                {/* Order Status Donut */}
                <div className="card card-body">
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, color: '#111' }}>{t.analytics.ordersDistribution}</h3>
                    {orderStatuses.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={orderStatuses} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value">
                                        {orderStatuses.map((entry: any, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => [`${v || 0}%`, '']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                {orderStatuses.map((s: any) => (
                                    <div key={s.statusKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                            <span style={{ color: '#4A4036' }}>{t.orders[s.statusKey as keyof typeof t.orders] || s.statusKey}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, color: '#111' }}>{s.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A09080', flexDirection: 'column', gap: 8 }}>
                            <ShoppingBag size={32} color="#D4C8BB" />
                            <span style={{ fontSize: 13 }}>{t.analytics.noOrdersData}</span>
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div className="card card-body">
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, color: '#111' }}>{t.analytics.topProducts}</h3>
                    {topProducts.length === 0 ? (
                        <div style={{ padding: '32px 0', textAlign: 'center', color: '#A09080', fontSize: 13 }}>{t.analytics.noDataAvailable}</div>
                    ) : topProducts.map((p: any, i) => (
                        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < topProducts.length - 1 ? '1px solid #F0EBE3' : 'none' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#C6A75E', flexShrink: 0 }}>
                                {i + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: dir === 'rtl' ? 'right' : 'left' }}>{p.name}</div>
                                <div style={{ fontSize: 12, color: '#A09080', marginTop: 2, textAlign: dir === 'rtl' ? 'right' : 'left' }}>{p.sold} {t.analytics.unitsSold}</div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: '#C6A75E', flexShrink: 0 }}>{p.revenue} <span style={{ fontWeight: 500, fontSize: 11, color: '#6B6058' }}>{t.common.currency}</span></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
