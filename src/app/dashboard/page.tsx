'use client'

import { useState, useEffect } from 'react'
import {
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    DollarSign,
    Percent,
    Eye,
    MessageCircle,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'

// Simple bar chart component
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data, 1)
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
            {data.map((value, i) => (
                <div
                    key={i}
                    style={{
                        width: 8,
                        height: `${(value / max) * 100}%`,
                        minHeight: 4,
                        background: color,
                        borderRadius: 2,
                        opacity: 0.3 + (i / data.length) * 0.7,
                    }}
                />
            ))}
        </div>
    )
}

// Sales trend line chart
function SalesChart({ data, labels, dir }: { data: number[]; labels: string[]; dir: string }) {
    const max = Math.max(...data, 1)
    const height = 180
    const width = '100%'
    
    return (
        <div style={{ width, height, position: 'relative' }}>
            {/* Y-axis labels */}
            <div style={{ position: 'absolute', [dir === 'rtl' ? 'right' : 'left']: 0, top: 0, bottom: 30, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 45 }}>
                {[max, max * 0.75, max * 0.5, max * 0.25, 0].map((val, i) => (
                    <span key={i} style={{ fontSize: 10, color: '#A09080', textAlign: dir === 'rtl' ? 'left' : 'right' }}>
                        {val >= 1000 ? `${(val/1000).toFixed(1)}K` : val.toFixed(0)}
                    </span>
                ))}
            </div>
            
            {/* Chart area */}
            <div style={{ [dir === 'rtl' ? 'marginRight' : 'marginLeft']: 50, height: height - 30, position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                {/* Grid lines */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} style={{ height: 1, background: '#F0EBE3', width: '100%' }} />
                    ))}
                </div>
                
                {/* Bars */}
                {data.map((value, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
                        <div
                            style={{
                                width: '80%',
                                maxWidth: 32,
                                height: `${(value / max) * 100}%`,
                                minHeight: 4,
                                background: 'linear-gradient(180deg, #C6A75E 0%, #A8883C 100%)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'scaleY(1.05)'
                                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 -4px 12px rgba(198,167,94,0.3)'
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'scaleY(1)'
                                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                            }}
                        />
                    </div>
                ))}
            </div>
            
            {/* X-axis labels */}
            <div style={{ [dir === 'rtl' ? 'marginRight' : 'marginLeft']: 50, display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
                {labels.map((label, i) => (
                    <span key={i} style={{ fontSize: 10, color: '#A09080', flex: 1, textAlign: 'center' }}>{label}</span>
                ))}
            </div>
        </div>
    )
}

export default function DashboardHomePage() {
    const supabase = createClient()
    const { t, lang, dir } = useLanguage()

    const statusConfig = {
        pending: { label: t.orders.pending, color: '#F59E0B', bg: '#FEF3C7', Icon: Clock },
        processing: { label: t.orders.processing, color: '#3B82F6', bg: '#DBEAFE', Icon: AlertCircle },
        shipped: { label: t.orders.shipped, color: '#8B5CF6', bg: '#EDE9FE', Icon: Truck },
        delivered: { label: t.orders.delivered, color: '#10B981', bg: '#D1FAE5', Icon: CheckCircle },
        cancelled: { label: t.orders.cancelled, color: '#EF4444', bg: '#FEE2E2', Icon: XCircle },
        refunded: { label: t.orders.refunded, color: '#6B7280', bg: '#F3F4F6', Icon: XCircle },
    }

    const [stats, setStats] = useState<any[]>([])
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')
    const [salesData, setSalesData] = useState<number[]>([])
    const [salesLabels, setSalesLabels] = useState<string[]>([])
    const [orderStats, setOrderStats] = useState({ pending: 0, processing: 0, shipped: 0, delivered: 0 })

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                setUserName(user.user_metadata?.name || 'مرحباً')

                // Get stores
                const { data: stores } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('user_id', user.id)

                if (!stores || stores.length === 0) {
                    setLoading(false)
                    return
                }

                const storeIds = stores.map(s => s.id)

                // Fetch real stats via RPC
                const { data: analytics } = await supabase.rpc('get_vendor_analytics', { target_store_id: storeIds[0] })

                // Products count (not in RPC)
                const { count: productsCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .in('store_id', storeIds)

                // Recent Orders list
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('id, total_jod, status, created_at, customers(id, name, phone)')
                    .in('store_id', storeIds)
                    .order('created_at', { ascending: false })
                    .limit(5)

                setStats([
                    { label: t.dashboard.totalRevenue, value: analytics?.total_revenue || 0, suffix: t.common.currency, icon: TrendingUp, color: '#10B981', bg: '#D1FAE5' },
                    { label: t.dashboard.totalOrders, value: analytics?.total_orders || 0, icon: ShoppingCart, color: '#6C3CE1', bg: '#EDE9FE' },
                    { label: t.dashboard.totalProducts, value: productsCount || 0, icon: Package, color: '#F59E0B', bg: '#FEF3C7' },
                    { label: t.dashboard.totalCustomers, value: analytics?.total_customers || 0, icon: Users, color: '#3B82F6', bg: '#DBEAFE' },
                ])

                if (ordersData) {
                    setRecentOrders(ordersData.map((o) => {
                        const customerInfo = Array.isArray(o.customers) ? o.customers[0] : o.customers
                        return {
                            id: o.id.slice(0, 8),
                            customer: (customerInfo as any)?.name || (customerInfo as any)?.phone || t.dashboard.unknownCustomer,
                            total: Number(o.total_jod),
                            status: o.status,
                            time: o.created_at
                        }
                    }))
                }

                // Fetch orders for the last 7 days for the chart
                const sevenDaysAgo = new Date()
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                
                const { data: chartOrders } = await supabase
                    .from('orders')
                    .select('total_jod, created_at, status')
                    .in('store_id', storeIds)
                    .gte('created_at', sevenDaysAgo.toISOString())
                    .order('created_at', { ascending: true })

                if (chartOrders) {
                    // Group by day
                    const dailySales: { [key: string]: number } = {}
                    const orderCounts = { pending: 0, processing: 0, shipped: 0, delivered: 0 }
                    
                    chartOrders.forEach(order => {
                        const date = new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { weekday: 'short' })
                        dailySales[date] = (dailySales[date] || 0) + Number(order.total_jod || 0)
                        
                        if (order.status in orderCounts) {
                            orderCounts[order.status as keyof typeof orderCounts]++
                        }
                    })
                    
                    // Generate last 7 days labels
                    const labels: string[] = []
                    const data: number[] = []
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date()
                        d.setDate(d.getDate() - i)
                        const label = d.toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { weekday: 'short' })
                        labels.push(label)
                        data.push(dailySales[label] || 0)
                    }
                    
                    setSalesLabels(labels)
                    setSalesData(data)
                    setOrderStats(orderCounts)
                }

                // Low stock
                const { data: lowStock } = await supabase
                    .from('products')
                    .select('name_ar, stock')
                    .in('store_id', storeIds)
                    .lt('stock', 5)
                    .limit(5)

                if (lowStock) {
                    setLowStockProducts(lowStock.map(p => ({
                        name: p.name_ar,
                        stock: p.stock
                    })))
                }

            } catch (err) {
                console.error('Error fetching dashboard stats:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [supabase])

    if (loading) return (
        <div className="page-container" dir={dir}>
            <div style={{ marginBottom: 20 }}>
                <div className="skeleton skeleton-text" style={{ width: 200, height: 24, marginBottom: 8 }} />
                <div className="skeleton skeleton-text" style={{ width: 140, height: 14 }} />
            </div>
            <div className="mobile-grid-2" style={{ marginBottom: 24 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 96, borderRadius: 16 }} />)}
            </div>
            {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" />)}
        </div>
    )

    return (
        <div className="page-container" dir={dir}>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">{t.dashboard.welcomeUser.replace('{name}', userName || t.dashboard.welcomeUserFallback)}</h1>
                    <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>{t.dashboard.subtitle}</p>
                </div>
                <div className="hide-on-mobile">
                    <Link href="/dashboard/products/new" className="btn btn-primary btn-sm">
                        + {t.dashboard.addProduct}
                    </Link>
                </div>
            </div>

            {/* Stats Grid — 2 per row on mobile, 4 on desktop */}
            <div className="mobile-grid-2" style={{ marginBottom: 28 }}>
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="stat-card">
                            <div className="stat-icon" style={{ background: stat.bg }}>
                                <Icon size={22} color={stat.color} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                                    <span className="stat-value">{stat.value}</span>
                                    <span style={{ fontSize: 12, color: '#6B6058' }}>{stat.suffix}</span>
                                </div>
                                <div className="stat-label" style={{ fontSize: 12 }}>{stat.label}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Sales Chart Section */}
            <div className="card card-body" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{t.analytics.salesChart || 'Sales Overview'}</h2>
                        <p style={{ fontSize: 13, color: '#6B6058' }}>{t.dashboard.last30Days || 'Last 7 days'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        {Object.entries(orderStats).map(([status, count]) => {
                            const config = statusConfig[status as keyof typeof statusConfig]
                            if (!config || count === 0) return null
                            return (
                                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.color }} />
                                    <span style={{ fontSize: 12, color: '#6B6058' }}>{config.label}: <strong>{count}</strong></span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                {salesData.length > 0 ? (
                    <SalesChart data={salesData} labels={salesLabels} dir={dir} />
                ) : (
                    <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A09080', fontSize: 14 }}>
                        {t.analytics.noData || 'No sales data yet'}
                    </div>
                )}
            </div>

            {/* Content grid: stacked on mobile, side-by-side on desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

                {/* Recent Orders — mobile cards + desktop table */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 800 }}>{t.dashboard.recentOrders}</h2>
                        <Link href="/dashboard/orders" style={{ fontSize: 13, color: '#222', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {t.dashboard.viewAll}
                        </Link>
                    </div>

                    {/* Desktop table */}
                    <div className="card hide-on-mobile">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {[t.dashboard.orderId, t.orders.customer, t.common.total, t.common.status, t.common.date].map((h, i) => (
                                        <th key={i} style={{ textAlign: dir === 'rtl' ? 'right' : 'left', padding: '14px 16px', background: '#F5F0E8', fontSize: 12, color: '#6B6058', fontWeight: 700 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#A09080' }}>{t.dashboard.noOrdersDesc}</td></tr>
                                ) : recentOrders.map((order) => {
                                    const s = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                                    const StatusIcon = s.Icon
                                    return (
                                        <tr key={order.id} style={{ borderTop: '1px solid #E0D6C8' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13, color: '#222' }}>{order.id.slice(0, 8)}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>{order.customer}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 14 }}>{order.total.toFixed(2)} {t.common.currency}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                                                    <StatusIcon size={12} />{s.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#A09080', fontSize: 12 }}>{new Date(order.time).toLocaleDateString(dir === 'rtl' ? 'ar-JO' : 'en-US')}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile order cards */}
                    <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
                        {recentOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: '#A09080' }}>{t.dashboard.noOrdersCard}</div>
                        ) : recentOrders.map((order) => {
                            const s = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                            const StatusIcon = s.Icon
                            return (
                                <div key={order.id} className="mobile-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 800, fontSize: 14, color: '#222' }}>#{order.id.slice(0, 6).toUpperCase()}</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                                            <StatusIcon size={11} />{s.label}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 13, color: '#4A4036', fontWeight: 600 }}>{order.customer}</span>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <span style={{ fontWeight: 800, fontSize: 15, color: '#222' }}>{order.total.toFixed(2)} <span style={{ fontSize: 11, fontWeight: 600, color: '#6B6058' }}>{t.common.currency}</span></span>
                                            <span style={{ fontSize: 11, color: '#A09080' }}>{new Date(order.time).toLocaleDateString(dir === 'rtl' ? 'ar-JO' : 'en-US')}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Bottom two-column: low stock + quick actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Low Stock */}
                    <div className="card card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 800 }}>{t.dashboard.lowStock}</h3>
                            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>{lowStockProducts.length}</span>
                        </div>
                        {lowStockProducts.length === 0 ? (
                            <p style={{ fontSize: 13, color: '#A09080' }}>{t.dashboard.stockGood}</p>
                        ) : lowStockProducts.map(p => (
                            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0EBE3' }}>
                                <span style={{ fontSize: 13, color: '#222', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: dir === 'rtl' ? 0 : 8, marginLeft: dir === 'ltr' ? 0 : 8 }}>{p.name}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C', background: '#FEE2E2', padding: '2px 8px', borderRadius: 100, flexShrink: 0, marginRight: dir === 'rtl' ? 8 : 0, marginLeft: dir === 'ltr' ? 8 : 0 }}>{t.dashboard.onlyLeft.replace('{stock}', p.stock)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="card card-body">
                        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>{t.dashboard.quickActions}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: t.dashboard.addProduct, href: '/dashboard/products/new', color: '#C6A75E' },
                                { label: t.dashboard.discountCoupon, href: '/dashboard/coupons', color: '#10B981' },
                                { label: t.dashboard.reports, href: '/dashboard/analytics', color: '#3B82F6' },
                                { label: t.dashboard.settingsTitle, href: '/dashboard/settings', color: '#6B6058' },
                            ].map(action => (
                                <Link key={action.href} href={action.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#F5F0E8', textDecoration: 'none', color: '#222', fontSize: 13, fontWeight: 600, border: '1px solid #E0D6C8' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: action.color, flexShrink: 0 }} />
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
