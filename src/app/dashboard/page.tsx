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
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">مرحباً، {userName || 'بالتاجر'} 👋</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        إليك ملخص متجرك اليوم
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link href="/dashboard/products/new" className="btn btn-primary btn-sm">
                        + إضافة منتج
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 20,
                    marginBottom: 32,
                }}
            >
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="stat-card">
                            <div className="stat-icon" style={{ background: stat.bg }}>
                                <Icon size={22} color={stat.color} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                    <span className="stat-value">{stat.value}</span>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{stat.suffix}</span>
                                </div>
                                <div className="stat-label">{stat.label}</div>
                                {stat.change && (
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: stat.positive ? '#10B981' : '#EF4444',
                                            marginTop: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                        }}
                                    >
                                        <ArrowUpRight size={12} />
                                        {stat.change} هذا الأسبوع
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                {/* Recent Orders */}
                <div className="card">
                    <div
                        style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <h2 style={{ fontSize: 16, fontWeight: 700 }}>أحدث الطلبات</h2>
                        <Link
                            href="/dashboard/orders"
                            style={{
                                fontSize: 13,
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            عرض الكل
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'right' }}>رقم الطلب</th>
                                    <th style={{ textAlign: 'right' }}>العميل</th>
                                    <th style={{ textAlign: 'right' }}>المنتجات</th>
                                    <th style={{ textAlign: 'right' }}>الإجمالي</th>
                                    <th style={{ textAlign: 'right' }}>الحالة</th>
                                    <th style={{ textAlign: 'right' }}>الوقت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => {
                                    const s = statusConfig[order.status as keyof typeof statusConfig]
                                    const StatusIcon = s.Icon
                                    return (
                                        <tr key={order.id}>
                                            <td>
                                                <Link
                                                    href={`/dashboard/orders/${order.id}`}
                                                    style={{
                                                        color: 'var(--primary)',
                                                        textDecoration: 'none',
                                                        fontWeight: 700,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    {order.id}
                                                </Link>
                                            </td>
                                            <td style={{ fontWeight: 600, fontSize: 13 }}>{order.customer}</td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                                {order.items} منتجات
                                            </td>
                                            <td style={{ fontWeight: 700, fontSize: 14 }}>
                                                {order.total.toFixed(2)} د.أ
                                            </td>
                                            <td>
                                                <span
                                                    className="badge"
                                                    style={{ background: s.bg, color: s.color, gap: 5 }}
                                                >
                                                    <StatusIcon size={12} />
                                                    {s.label}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{order.time}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Low Stock Alert */}
                    <div className="card card-body">
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>⚠️ مخزون منخفض</h3>
                            <span className="badge badge-warning">{lowStockProducts.length}</span>
                        </div>
                        {lowStockProducts.map((p) => (
                            <div
                                key={p.name}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px 0',
                                    borderBottom: '1px solid var(--border)',
                                }}
                            >
                                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                                    {p.name}
                                </span>
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: '#EF4444',
                                        background: '#FEE2E2',
                                        padding: '2px 8px',
                                        borderRadius: 100,
                                    }}
                                >
                                    {p.stock} فقط
                                </span>
                            </div>
                        ))}
                        <Link
                            href="/dashboard/products?filter=low-stock"
                            className="btn btn-secondary btn-sm"
                            style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
                        >
                            إدارة المخزون
                        </Link>
                    </div>

                    {/* Quick Actions */}
                    <div className="card card-body">
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>إجراءات سريعة</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { label: 'إضافة منتج جديد', href: '/dashboard/products/new', color: '#6C3CE1' },
                                { label: 'إنشاء كوبون خصم', href: '/dashboard/discounts/new', color: '#F59E0B' },
                                { label: 'عرض التقارير', href: '/dashboard/analytics', color: '#10B981' },
                                { label: 'تعديل إعدادات المتجر', href: '/dashboard/settings', color: '#3B82F6' },
                            ].map((action) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 14px',
                                        borderRadius: 10,
                                        background: 'var(--surface-2)',
                                        textDecoration: 'none',
                                        color: 'var(--text-primary)',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        transition: 'all 0.2s ease',
                                        border: `1px solid var(--border)`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: action.color,
                                            flexShrink: 0,
                                        }}
                                    />
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
