'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Clock, CheckCircle, Truck, XCircle, AlertCircle, Eye, ChevronLeft, ChevronRight, Filter, MapPin, CreditCard, Banknote, Phone, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'

// Jordan cities list
const JO_CITIES = ['عمّان', 'الزرقاء', 'إربد', 'العقبة', 'الكرك', 'مادبا', 'السلط', 'عجلون', 'جرش', 'المفرق', 'الطفيلة', 'معان']

export default function OrdersPage() {
    const supabase = createClient()
    const { t, lang, dir } = useLanguage()

    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    
    // Advanced filters
    const [showFilters, setShowFilters] = useState(false)
    const [cityFilter, setCityFilter] = useState<string>('')
    const [paymentFilter, setPaymentFilter] = useState<string>('')
    const [dateFrom, setDateFrom] = useState<string>('')
    const [dateTo, setDateTo] = useState<string>('')

    const statusConfig = {
        pending: { label: t.orders.pending, color: '#92400E', bg: '#FEF3C7', Icon: Clock },
        processing: { label: t.orders.processing, color: '#1D4ED8', bg: '#DBEAFE', Icon: AlertCircle },
        shipped: { label: t.orders.shipped, color: '#5B21B6', bg: '#EDE9FE', Icon: Truck },
        delivered: { label: t.orders.delivered, color: '#065F46', bg: '#D1FAE5', Icon: CheckCircle },
        cancelled: { label: t.orders.cancelled, color: '#B91C1C', bg: '#FEE2E2', Icon: XCircle },
        refunded: { label: t.orders.refunded, color: '#374151', bg: '#F3F4F6', Icon: XCircle },
    }

    const statusTabs = [
        { key: 'all', label: t.orders.all },
        { key: 'pending', label: t.orders.pending },
        { key: 'processing', label: t.orders.processing },
        { key: 'shipped', label: t.orders.shipped },
        { key: 'delivered', label: t.orders.delivered },
        { key: 'cancelled', label: t.orders.cancelled },
    ]

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

                const storeIds = stores.map((s: any) => s.id)

                const { data: ordersData, error } = await supabase
                    .from('orders')
                    .select('*')
                    .in('store_id', storeIds)
                    .order('created_at', { ascending: false })

                if (error) throw error

                if (ordersData) {
                    setOrders(ordersData.map((o: any) => ({
                        id: `#${o.order_number || o.id.slice(0, 6).toUpperCase()}`,
                        realId: o.id,
                        customer: o.customer_name,
                        phone: o.customer_phone,
                        total: Number(o.total),
                        status: o.status,
                        payment: o.payment_method,
                        date: new Date(o.created_at).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB'),
                        rawDate: o.created_at,
                        city: o.shipping_address?.city || '-',
                        address: o.shipping_address?.address || '',
                        notes: o.shipping_address?.notes || '',
                        codStatus: o.payment_method === 'cod' ? (o.status === 'delivered' ? 'collected' : 'pending') : null
                    })))
                }
            } catch (err) {
                console.error('Error fetching orders:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [supabase, lang])

    const filtered = orders.filter((o) => {
        const matchesTab = activeTab === 'all' || o.status === activeTab
        const matchesSearch =
            o.id.includes(search) ||
            (o.customer || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.phone || '').includes(search)
        const matchesCity = !cityFilter || o.city === cityFilter
        const matchesPayment = !paymentFilter || o.payment === paymentFilter
        const matchesDateFrom = !dateFrom || new Date(o.rawDate) >= new Date(dateFrom)
        const matchesDateTo = !dateTo || new Date(o.rawDate) <= new Date(dateTo + 'T23:59:59')
        return matchesTab && matchesSearch && matchesCity && matchesPayment && matchesDateFrom && matchesDateTo
    })
    
    const hasActiveFilters = cityFilter || paymentFilter || dateFrom || dateTo
    
    const clearFilters = () => {
        setCityFilter('')
        setPaymentFilter('')
        setDateFrom('')
        setDateTo('')
    }

    const counts: any = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    if (loading) return (
        <div className="page-container">
            {/* Skeleton loading */}
            <div style={{ marginBottom: 20 }}>
                <div className="skeleton skeleton-text" style={{ width: 120, height: 22, marginBottom: 8 }} />
                <div className="skeleton skeleton-text" style={{ width: 80, height: 14 }} />
            </div>
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton skeleton-card" style={{ marginBottom: 12 }} />
            ))}
        </div>
    )

    return (
        <div className="page-container">
            {/* Page header */}
            <div style={{ marginBottom: 20 }}>
                <h1 className="page-title">{t.orders.title}</h1>
                <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>
                    {orders.length} {t.orders.subtitle}
                </p>
            </div>

            {/* Search */}
            <div className="mobile-search" style={{ marginBottom: 16 }}>
                <Search size={17} className="search-icon" style={{ left: dir === 'ltr' ? 14 : 'auto', right: dir === 'rtl' ? 14 : 'auto' }} />
                <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t.orders.searchPlaceholder}
                    style={{
                        paddingInlineEnd: 44,
                        paddingInlineStart: 14
                    }}
                />
            </div>

            {/* Status chips + Filter toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                <div className="chips-row" style={{ flex: 1 }}>
                    {statusTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`chip ${activeTab === tab.key ? 'active' : ''}`}
                        >
                            {tab.label}
                            {counts[tab.key] > 0 && (
                                <span style={{
                                    background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#F0EBE3',
                                    color: activeTab === tab.key ? 'white' : '#6B6058',
                                    fontSize: 11, fontWeight: 800,
                                    padding: '1px 6px', borderRadius: 100,
                                }}>
                                    {counts[tab.key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`chip ${showFilters || hasActiveFilters ? 'active' : ''}`}
                    style={{ flexShrink: 0 }}
                >
                    <Filter size={14} />
                    {lang === 'ar' ? 'تصفية' : 'Filter'}
                    {hasActiveFilters && (
                        <span style={{ 
                            background: 'rgba(255,255,255,0.25)', 
                            padding: '1px 6px', 
                            borderRadius: 100, 
                            fontSize: 11, 
                            fontWeight: 800 
                        }}>!</span>
                    )}
                </button>
            </div>
            
            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="card card-body" style={{ marginBottom: 20, padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                        {/* City Filter */}
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6058', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                                <MapPin size={12} />
                                {t.orders.city}
                            </label>
                            <select 
                                className="form-control" 
                                value={cityFilter} 
                                onChange={e => setCityFilter(e.target.value)}
                                style={{ padding: '8px 12px', minHeight: 40 }}
                            >
                                <option value="">{t.common.all}</option>
                                {JO_CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Payment Method Filter */}
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6058', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                                <CreditCard size={12} />
                                {t.orders.payment}
                            </label>
                            <select 
                                className="form-control" 
                                value={paymentFilter} 
                                onChange={e => setPaymentFilter(e.target.value)}
                                style={{ padding: '8px 12px', minHeight: 40 }}
                            >
                                <option value="">{t.common.all}</option>
                                <option value="cod">{t.orders.cod}</option>
                                <option value="online">{t.orders.online}</option>
                            </select>
                        </div>
                        
                        {/* Date From */}
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6058', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                                <Calendar size={12} />
                                {lang === 'ar' ? 'من تاريخ' : 'From Date'}
                            </label>
                            <input 
                                type="date" 
                                className="form-control" 
                                value={dateFrom} 
                                onChange={e => setDateFrom(e.target.value)}
                                style={{ padding: '8px 12px', minHeight: 40 }}
                            />
                        </div>
                        
                        {/* Date To */}
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6058', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                                <Calendar size={12} />
                                {lang === 'ar' ? 'إلى تاريخ' : 'To Date'}
                            </label>
                            <input 
                                type="date" 
                                className="form-control" 
                                value={dateTo} 
                                onChange={e => setDateTo(e.target.value)}
                                style={{ padding: '8px 12px', minHeight: 40 }}
                            />
                        </div>
                    </div>
                    
                    {hasActiveFilters && (
                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={clearFilters}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#B91C1C', 
                                    fontSize: 13, 
                                    fontWeight: 600, 
                                    cursor: 'pointer',
                                    fontFamily: 'inherit'
                                }}
                            >
                                {lang === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Orders — Mobile Cards on mobile, Table on desktop */}

            {/* Desktop table */}
            <div className="card hide-on-mobile" style={{ padding: 0, overflow: 'hidden' }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>{t.orders.noOrders}</p>
                    </div>
                ) : (
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    {[
                                        t.orders.orderNumber, 
                                        t.orders.customer, 
                                        t.orders.city, 
                                        t.orders.total, 
                                        t.orders.payment, 
                                        lang === 'ar' ? 'حالة COD' : 'COD Status',
                                        t.orders.orderStatus, 
                                        t.common.date, 
                                        ''
                                    ].map((h, i) => (
                                        <th key={i} style={{ textAlign: 'inherit', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(order => {
                                    const s = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                                    const StatusIcon = s.Icon

                                    // Map status to badge class
                                    const badgeClass =
                                        order.status === 'delivered' ? 'badge-success' :
                                            order.status === 'pending' ? 'badge-warning' :
                                                order.status === 'cancelled' || order.status === 'refunded' ? 'badge-error' :
                                                    order.status === 'processing' ? 'badge-info' :
                                                        order.status === 'shipped' ? 'badge-purple' : 'badge-gray'

                                    return (
                                        <tr key={order.realId}>
                                            <td style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{order.id}</td>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{order.customer}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, direction: 'ltr', textAlign: 'inherit' }}>{order.phone}</div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{order.city}</td>
                                            <td style={{ fontWeight: 700, fontSize: 14 }}>
                                                {order.total.toFixed(2)} <span style={{ fontSize: 12 }}>{t.common.currency}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${order.payment === 'cod' ? 'badge-warning' : 'badge-info'}`} style={{ gap: 4 }}>
                                                    {order.payment === 'cod' ? <Banknote size={12} /> : <CreditCard size={12} />}
                                                    {order.payment === 'cod' ? t.orders.cod : t.orders.online}
                                                </span>
                                            </td>
                                            <td>
                                                {order.codStatus ? (
                                                    <span className={`badge ${order.codStatus === 'collected' ? 'badge-success' : 'badge-warning'}`} style={{ gap: 4 }}>
                                                        {order.codStatus === 'collected' 
                                                            ? <><CheckCircle size={12} /> {lang === 'ar' ? 'تم التحصيل' : 'Collected'}</>
                                                            : <><Clock size={12} /> {lang === 'ar' ? 'بانتظار التحصيل' : 'Pending'}</>
                                                        }
                                                    </span>
                                                ) : (
                                                    <span style={{ color: '#A09080', fontSize: 12 }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${badgeClass}`} style={{ gap: 4 }}>
                                                    <StatusIcon size={12} />{s.label}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{order.date}</td>
                                            <td>
                                                <Link href={`/dashboard/orders/${order.realId}`} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)', width: 34, height: 34, padding: 0 }}>
                                                    <Eye size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Mobile cards */}
            <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#A09080' }}>
                        {t.orders.noOrders}
                    </div>
                ) : filtered.map(order => {
                    const s = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                    const StatusIcon = s.Icon
                    return (
                        <Link
                            href={`/dashboard/orders/${order.realId}`}
                            key={order.realId}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="mobile-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {/* Top row: order ID + status badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 800, fontSize: 15, color: '#222' }}>{order.id}</span>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        background: s.bg, color: s.color,
                                        padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                                    }}>
                                        <StatusIcon size={11} />
                                        {s.label}
                                    </span>
                                </div>

                                {/* Customer + city */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>{order.customer}</div>
                                        <div style={{ fontSize: 12, color: '#A09080', marginTop: 2 }}>{order.city} • {order.phone}</div>
                                    </div>
                                    {dir === 'rtl' ? <ChevronLeft size={16} color="#A09080" /> : <ChevronRight size={16} color="#A09080" />}
                                </div>

                                {/* Bottom: total + payment + date */}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    paddingTop: 10, borderTop: '1px solid #F0EBE3', marginTop: 2,
                                }}>
                                    <span style={{ fontWeight: 800, fontSize: 16, color: '#222' }}>
                                        {order.total.toFixed(2)} <span style={{ fontSize: 12, fontWeight: 600, color: '#6B6058' }}>{t.common.currency}</span>
                                    </span>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: 11, fontWeight: 600,
                                            background: order.payment === 'cod' ? '#FEF3C7' : '#DBEAFE',
                                            color: order.payment === 'cod' ? '#92400E' : '#1D4ED8',
                                            padding: '2px 8px', borderRadius: 100,
                                        }}>
                                            {order.payment === 'cod' ? t.orders.cod : t.orders.online}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#A09080' }}>{order.date}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
