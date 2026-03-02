import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Clock, CheckCircle, Truck, XCircle, AlertCircle, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const statusConfig = {
    pending: { label: 'قيد الانتظار', color: '#F59E0B', bg: '#FEF3C7', Icon: Clock },
    processing: { label: 'قيد المعالجة', color: '#3B82F6', bg: '#DBEAFE', Icon: AlertCircle },
    shipped: { label: 'تم الشحن', color: '#8B5CF6', bg: '#EDE9FE', Icon: Truck },
    delivered: { label: 'تم التسليم', color: '#10B981', bg: '#D1FAE5', Icon: CheckCircle },
    cancelled: { label: 'ملغي', color: '#EF4444', bg: '#FEE2E2', Icon: XCircle },
    refunded: { label: 'مسترجع', color: '#6B7280', bg: '#F3F4F6', Icon: XCircle },
}

const statusTabs = [
    { key: 'all', label: 'الكل' },
    { key: 'pending', label: 'قيد الانتظار' },
    { key: 'processing', label: 'قيد المعالجة' },
    { key: 'shipped', label: 'تم الشحن' },
    { key: 'delivered', label: 'تم التسليم' },
    { key: 'cancelled', label: 'ملغي' },
]

export default function OrdersPage() {
    const supabase = createClient()
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOrders() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: stores } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('user_id', user.id)

                if (!stores || stores.length === 0) return

                const storeIds = stores.map(s => s.id)

                const { data: ordersData, error } = await supabase
                    .from('orders')
                    .select('*')
                    .in('store_id', storeIds)
                    .order('created_at', { ascending: false })

                if (error) throw error

                if (ordersData) {
                    setOrders(ordersData.map(o => ({
                        id: `#${o.order_number || o.id.slice(0, 4)}`,
                        realId: o.id,
                        customer: o.customer_name,
                        phone: o.customer_phone,
                        items: 0, // Should join with order_items count ideally
                        total: Number(o.total),
                        status: o.status,
                        payment: o.payment_method,
                        date: new Date(o.created_at).toLocaleDateString('ar-JO'),
                        city: o.shipping_address?.city || '-'
                    })))
                }
            } catch (err) {
                console.error('Error fetching orders:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [supabase])

    const filtered = orders.filter((o) => {
        const matchesTab = activeTab === 'all' || o.status === activeTab
        const matchesSearch =
            o.id.includes(search) ||
            o.customer.toLowerCase().includes(search.toLowerCase()) ||
            o.phone.includes(search)
        return matchesTab && matchesSearch
    })

    const counts = {
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    if (loading) return (
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">الطلبات</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        {orders.length} طلب إجمالي
                    </p>
                </div>
            </div>

            {/* Status Tabs */}
            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    marginBottom: 24,
                    background: 'var(--surface)',
                    padding: 6,
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    overflowX: 'auto',
                }}
            >
                {statusTabs.map((tab) => {
                    const count = tab.key !== 'all' ? (counts as any)[tab.key] : orders.length
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                whiteSpace: 'nowrap',
                                background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span
                                    style={{
                                        background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--surface-2)',
                                        color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                                        fontSize: 11,
                                        fontWeight: 800,
                                        padding: '1px 7px',
                                        borderRadius: 100,
                                    }}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search
                        size={16}
                        color="var(--text-muted)"
                        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                    />
                    <input
                        type="text"
                        className="form-control"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
                        style={{ paddingRight: 42 }}
                    />
                </div>
                <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>
                    <Filter size={15} />
                    تصفية
                </button>
            </div>

            {/* Orders Table */}
            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['رقم الطلب', 'العميل', 'المدينة', 'الإجمالي', 'الدفع', 'الحالة', 'التاريخ', ''].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        textAlign: 'right',
                                        padding: '14px 16px',
                                        background: 'var(--surface-2)',
                                        fontSize: 12,
                                        color: 'var(--text-secondary)',
                                        fontWeight: 700,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((order) => {
                            const s = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                            const StatusIcon = s.Icon
                            return (
                                <tr key={order.realId} style={{ borderTop: '1px solid var(--border)' }}>
                                    <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>
                                        {order.id}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{order.customer}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, direction: 'ltr', textAlign: 'right' }}>
                                            {order.phone}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                                        {order.city}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14 }}>
                                        {order.total.toFixed(2)} د.أ
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                background: order.payment === 'cod' ? '#FEF3C7' : '#DBEAFE',
                                                color: order.payment === 'cod' ? '#92400E' : '#1D4ED8',
                                                padding: '3px 8px',
                                                borderRadius: 100,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {order.payment === 'cod' ? 'عند الاستلام' : 'بطاقة'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span
                                            className="badge"
                                            style={{ background: s.bg, color: s.color }}
                                        >
                                            <StatusIcon size={12} />
                                            {s.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 12 }}>
                                        {order.date}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Link
                                            href={`/dashboard/orders/${order.realId}`}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                border: '1px solid var(--border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            <Eye size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>لا توجد طلبات مطابقة للبحث</p>
                    </div>
                )}
            </div>
        </div>
    )
}
