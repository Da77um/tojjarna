'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'

export default function OrdersPage() {
    const supabase = createClient()
    const { t, lang, dir } = useLanguage()

    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const statusConfig = {
        pending: { label: t.orders.pending || 'Pending', color: 'text-warning', bg: 'bg-warning-container text-on-warning-container', icon: 'schedule' },
        processing: { label: t.orders.processing || 'Processing', color: 'text-info', bg: 'bg-secondary-container text-on-secondary-container', icon: 'pending_actions' },
        shipped: { label: t.orders.shipped || 'Shipped', color: 'text-primary', bg: 'bg-tertiary-container text-on-tertiary-container', icon: 'local_shipping' },
        delivered: { label: t.orders.delivered || 'Delivered', color: 'text-success', bg: 'bg-primary-container text-on-primary-container', icon: 'check_circle' },
        cancelled: { label: t.orders.cancelled || 'Cancelled', color: 'text-error', bg: 'bg-error-container text-on-error-container', icon: 'cancel' },
        refunded: { label: t.orders.refunded || 'Refunded', color: 'text-on-surface-variant', bg: 'bg-surface-variant text-on-surface-variant', icon: 'replay' },
    }

    const statusTabs = [
        { key: 'all', label: t.orders.all || 'All Orders' },
        { key: 'pending', label: t.orders.pending || 'Pending' },
        { key: 'processing', label: t.orders.processing || 'Processing' },
        { key: 'shipped', label: t.orders.shipped || 'Shipped' },
        { key: 'delivered', label: t.orders.delivered || 'Delivered' },
        { key: 'cancelled', label: t.orders.cancelled || 'Cancelled' },
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
    }, [supabase, lang])

    const filtered = orders.filter((o) => {
        const matchesTab = activeTab === 'all' || o.status === activeTab
        const matchesSearch =
            o.id.includes(search) ||
            (o.customer || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.phone || '').includes(search)
        return matchesTab && matchesSearch
    })

    const counts: any = {
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    if (loading) return (
        <div className="flex-1 p-4 lg:p-8 space-y-6">
            <div className="flex gap-4 mb-6">
                <div className="w-64 h-32 rounded-2xl bg-surface-container-highest animate-pulse"></div>
                <div className="w-64 h-32 rounded-2xl bg-surface-container-highest animate-pulse"></div>
            </div>
            <div className="h-64 rounded-2xl bg-surface-container animate-pulse"></div>
        </div>
    )

    return (
        <div dir={dir} className="p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-h1">{t.orders.title || 'Orders Center'}</h1>
                    <p className="text-on-surface-variant mt-1 font-manrope">
                        {orders.length} {t.orders.subtitle || 'total orders processed'}
                    </p>
                </div>
            </div>

            {/* Quick Stats Bento */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-2">
                <div className="bg-warning-container text-on-warning-container rounded-[1.5rem] p-5 shadow-sm border border-warning/20">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-[28px]">schedule</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-semibold opacity-90 uppercase tracking-widest">{t.orders.pending || 'Pending'}</p>
                        <span className="text-3xl font-extrabold">{counts.pending}</span>
                    </div>
                </div>
                <div className="bg-primary text-on-primary rounded-[1.5rem] p-5 shadow-md shadow-primary/20">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-[28px] opacity-90">local_shipping</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-semibold opacity-80 uppercase tracking-widest">{t.orders.shipped || 'In Transit'}</p>
                        <span className="text-3xl font-extrabold">{counts.shipped}</span>
                    </div>
                </div>
                <div className="bg-success/10 text-success rounded-[1.5rem] p-5 shadow-sm border border-success/20">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-[28px]">task_alt</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-semibold opacity-90 uppercase tracking-widest text-on-surface-variant">{t.orders.delivered || 'Delivered'}</p>
                        <span className="text-3xl font-extrabold text-on-surface">{counts.delivered}</span>
                    </div>
                </div>
                <div className="bg-surface-container-lowest text-on-surface rounded-[1.5rem] p-5 shadow-sm border border-surface-variant">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-[28px] text-primary">payments</span>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Avg. Order</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold">
                                {orders.length ? (orders.reduce((acc, curr) => acc + curr.total, 0) / orders.length).toFixed(0) : 0}
                            </span>
                            <span className="text-xs font-bold text-on-surface-variant">JOD</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Orders Table container */}
            <div className="bg-surface-container-lowest rounded-[2rem] border border-surface-variant shadow-sm overflow-hidden flex flex-col">
                
                <div className="p-4 md:p-6 border-b border-surface-variant flex flex-col gap-4">
                    
                    {/* Tabs */}
                    <div className="flex overflow-x-auto scrollbar-hide pb-2 md:pb-0 gap-8 border-b border-surface-variant">
                        {statusTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 font-semibold text-sm relative transition-colors whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === tab.key ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                {tab.label}
                                {counts[tab.key] > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        activeTab === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface'
                                    }`}>
                                        {counts[tab.key]}
                                    </span>
                                )}
                                {activeTab === tab.key && (
                                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search row */}
                    <div className="flex justify-between items-center mt-2">
                        <div className="relative w-full md:max-w-md">
                            <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2 left-4 rtl:left-auto rtl:right-4 text-on-surface-variant">search</span>
                            <input 
                                type="search" 
                                placeholder={t.orders.searchPlaceholder || 'Search order ID, Customer...'}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-surface-container-low/50 border hover:border-outline focus:border-primary border-outline-variant rounded-xl py-2 pl-11 pr-4 rtl:pl-4 rtl:pr-11 text-sm text-on-surface outline-none transition-colors"
                            />
                        </div>
                        <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-semibold hover:bg-surface-variant transition-colors">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            Filter
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-surface-container-low/30">
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider w-32">Order #</th>
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right rtl:text-left">Amount</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-variant">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-on-surface-variant">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-16 w-16 bg-surface-variant rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
                                                <span className="material-symbols-outlined text-[32px]">receipt_long</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-on-surface">{t.orders.noOrders || 'No orders found'}</h3>
                                            <p className="text-sm mt-1">Try adjusting your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map(order => {
                                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                                return (
                                    <tr key={order.realId} className="hover:bg-surface-container-low/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-on-surface font-manrope">{order.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm text-on-surface">{order.customer}</div>
                                            <div className="text-xs text-on-surface-variant mt-0.5">{order.city} • <span dir="ltr">{order.phone}</span></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-on-surface-variant">{order.date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg}`}>
                                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{status.icon}</span>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${order.payment === 'cod' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
                                                {order.payment === 'cod' ? (t.orders.cod || 'COD') : (t.orders.online || 'Online')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right rtl:text-left">
                                            <div className="flex justify-end rtl:justify-start items-baseline gap-1" dir="ltr">
                                                <span className="text-base font-extrabold text-on-surface">{order.total.toFixed(2)}</span>
                                                <span className="text-xs font-bold text-on-surface-variant">JOD</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link 
                                                href={`/dashboard/orders/${order.realId}`}
                                                className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-primary-container hover:text-on-primary-container transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    )
}
