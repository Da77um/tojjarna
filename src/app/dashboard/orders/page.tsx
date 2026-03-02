'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, Clock, CheckCircle, Truck, XCircle, AlertCircle, Eye } from 'lucide-react'

const orders = [
    { id: '#1523', customer: 'أحمد الكيلاني', phone: '0791234567', items: 3, total: 45.5, status: 'pending', payment: 'cod', date: '2025-03-02', city: 'عمّان' },
    { id: '#1522', customer: 'ريم النابلسي', phone: '0795678901', items: 1, total: 18.0, status: 'processing', payment: 'card', date: '2025-03-02', city: 'الزرقاء' },
    { id: '#1521', customer: 'خالد الزيادين', phone: '0798765432', items: 5, total: 112.0, status: 'shipped', payment: 'cod', date: '2025-03-01', city: 'إربد' },
    { id: '#1520', customer: 'سمر القطارنة', phone: '0792468135', items: 2, total: 32.5, status: 'delivered', payment: 'card', date: '2025-03-01', city: 'عمّان' },
    { id: '#1519', customer: 'فارس الدمور', phone: '0797531246', items: 1, total: 22.0, status: 'cancelled', payment: 'cod', date: '2025-02-28', city: 'العقبة' },
    { id: '#1518', customer: 'منى البشير', phone: '0793214569', items: 4, total: 78.5, status: 'delivered', payment: 'cod', date: '2025-02-28', city: 'عمّان' },
    { id: '#1517', customer: 'عمر الشوارب', phone: '0796543217', items: 2, total: 55.0, status: 'processing', payment: 'card', date: '2025-02-27', city: 'الزرقاء' },
]

const statusConfig = {
    pending: { label: 'قيد الانتظار', color: '#F59E0B', bg: '#FEF3C7', Icon: Clock },
    processing: { label: 'قيد المعالجة', color: '#3B82F6', bg: '#DBEAFE', Icon: AlertCircle },
    shipped: { label: 'تم الشحن', color: '#8B5CF6', bg: '#EDE9FE', Icon: Truck },
    delivered: { label: 'تم التسليم', color: '#10B981', bg: '#D1FAE5', Icon: CheckCircle },
    cancelled: { label: 'ملغي', color: '#EF4444', bg: '#FEE2E2', Icon: XCircle },
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
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('all')

    const filtered = orders.filter((o) => {
        const matchesTab = activeTab === 'all' || o.status === activeTab
        const matchesSearch =
            o.id.includes(search) ||
            o.customer.includes(search) ||
            o.phone.includes(search)
        return matchesTab && matchesSearch
    })

    const counts = Object.fromEntries(
        ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => [
            s,
            orders.filter((o) => o.status === s).length,
        ])
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
                    const count = tab.key !== 'all' ? counts[tab.key] : orders.length
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
                            {['رقم الطلب', 'العميل', 'المدينة', 'المنتجات', 'الإجمالي', 'الدفع', 'الحالة', 'التاريخ', ''].map((h) => (
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
                            const s = statusConfig[order.status as keyof typeof statusConfig]
                            const StatusIcon = s.Icon
                            return (
                                <tr key={order.id} style={{ borderTop: '1px solid var(--border)' }}>
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
                                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                                        {order.items} منتجات
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
                                            href={`/dashboard/orders/${order.id}`}
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
