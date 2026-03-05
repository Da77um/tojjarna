'use client'

import { useState, useEffect } from 'react'
import {
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const statusConfig = {
    pending: { label: 'قيد الانتظار', color: '#F59E0B', bg: '#FEF3C7', Icon: Clock },
    processing: { label: 'قيد المعالجة', color: '#3B82F6', bg: '#DBEAFE', Icon: AlertCircle },
    shipped: { label: 'تم الشحن', color: '#8B5CF6', bg: '#EDE9FE', Icon: Truck },
    delivered: { label: 'تم التسليم', color: '#10B981', bg: '#D1FAE5', Icon: CheckCircle },
    cancelled: { label: 'ملغي', color: '#EF4444', bg: '#FEE2E2', Icon: XCircle },
    refunded: { label: 'مسترجع', color: '#6B7280', bg: '#F3F4F6', Icon: XCircle },
}

export default function DashboardHomePage() {
    const supabase = createClient()
    const [stats, setStats] = useState<any[]>([])
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')

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
                    { label: 'إجمالي الإيرادات', value: analytics?.total_revenue || 0, suffix: 'د.أ', icon: TrendingUp, color: '#10B981', bg: '#D1FAE5' },
                    { label: 'إجمالي الطلبات', value: analytics?.total_orders || 0, suffix: 'طلب', icon: ShoppingCart, color: '#6C3CE1', bg: '#EDE9FE' },
                    { label: 'إجمالي المنتجات', value: productsCount || 0, suffix: 'منتج', icon: Package, color: '#F59E0B', bg: '#FEF3C7' },
                    { label: 'إجمالي العملاء', value: analytics?.total_customers || 0, suffix: 'عميل', icon: Users, color: '#3B82F6', bg: '#DBEAFE' },
                ])

                if (ordersData) {
                    setRecentOrders(ordersData.map((o) => {
                        const customerInfo = Array.isArray(o.customers) ? o.customers[0] : o.customers
                        return {
                            id: o.id.slice(0, 8),
                            customer: (customerInfo as any)?.name || (customerInfo as any)?.phone || 'عميل',
                            total: Number(o.total_jod),
                            status: o.status,
                            time: new Date(o.created_at).toLocaleDateString('ar-JO')
                        }
                    }))
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
        <div className="page-container" dir="rtl">
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
        <div className="page-container" dir="rtl">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">مرحباً، {userName || 'بالتاجر'} 👋</h1>
                    <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>إليك ملخص متجرك اليوم</p>
                </div>
                <div className="hide-on-mobile">
                    <Link href="/dashboard/products/new" className="btn btn-primary btn-sm">
                        + إضافة منتج
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

            {/* Content grid: stacked on mobile, side-by-side on desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

                {/* Recent Orders — mobile cards + desktop table */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 800 }}>أحدث الطلبات</h2>
                        <Link href="/dashboard/orders" style={{ fontSize: 13, color: '#222', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            عرض الكل ←
                        </Link>
                    </div>

                    {/* Desktop table */}
                    <div className="card hide-on-mobile">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['رقم الطلب', 'العميل', 'الإجمالي', 'الحالة', 'التاريخ'].map(h => (
                                        <th key={h} style={{ textAlign: 'right', padding: '14px 16px', background: '#F5F0E8', fontSize: 12, color: '#6B6058', fontWeight: 700 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#A09080' }}>لا توجد طلبات حتى الآن</td></tr>
                                ) : recentOrders.map((order) => {
                                    const s = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                                    const StatusIcon = s.Icon
                                    return (
                                        <tr key={order.id} style={{ borderTop: '1px solid #E0D6C8' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13, color: '#222' }}>{order.id.slice(0, 8)}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>{order.customer}</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 14 }}>{order.total.toFixed(2)} د.أ</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                                                    <StatusIcon size={12} />{s.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: '#A09080', fontSize: 12 }}>{order.time}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile order cards */}
                    <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
                        {recentOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: '#A09080' }}>لا توجد طلبات</div>
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
                                            <span style={{ fontWeight: 800, fontSize: 15, color: '#222' }}>{order.total.toFixed(2)} <span style={{ fontSize: 11, fontWeight: 600, color: '#6B6058' }}>د.أ</span></span>
                                            <span style={{ fontSize: 11, color: '#A09080' }}>{order.time}</span>
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
                            <h3 style={{ fontSize: 14, fontWeight: 800 }}>⚠️ مخزون منخفض</h3>
                            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>{lowStockProducts.length}</span>
                        </div>
                        {lowStockProducts.length === 0 ? (
                            <p style={{ fontSize: 13, color: '#A09080' }}>المخزون جيد كله ممتاز ✅</p>
                        ) : lowStockProducts.map(p => (
                            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0EBE3' }}>
                                <span style={{ fontSize: 13, color: '#222', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C', background: '#FEE2E2', padding: '2px 8px', borderRadius: 100, flexShrink: 0, marginRight: 8 }}>{p.stock} فقط</span>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="card card-body">
                        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>إجراءات سريعة</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                { label: 'إضافة منتج', href: '/dashboard/products/new', color: '#C6A75E' },
                                { label: 'كوبون خصم', href: '/dashboard/coupons', color: '#10B981' },
                                { label: 'التقارير', href: '/dashboard/analytics', color: '#3B82F6' },
                                { label: 'الإعدادات', href: '/dashboard/settings', color: '#6B6058' },
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
