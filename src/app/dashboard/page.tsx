'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'

export default function DashboardHomePage() {
    const supabase = createClient()
    const { t, dir } = useLanguage()

    const statusConfig = {
        pending: { label: t.orders.pending || 'Pending', color: 'text-warning', bg: 'bg-warning/10', icon: 'schedule' },
        processing: { label: t.orders.processing || 'Processing', color: 'text-info', bg: 'bg-info/10', icon: 'pending_actions' },
        shipped: { label: t.orders.shipped || 'Shipped', color: 'text-primary', bg: 'bg-primary/10', icon: 'local_shipping' },
        delivered: { label: t.orders.delivered || 'Delivered', color: 'text-success', bg: 'bg-success/10', icon: 'check_circle' },
        cancelled: { label: t.orders.cancelled || 'Cancelled', color: 'text-error', bg: 'bg-error/10', icon: 'cancel' },
        refunded: { label: t.orders.refunded || 'Refunded', color: 'text-on-surface-variant', bg: 'bg-surface-variant', icon: 'replay' },
    }

    const [stats, setStats] = useState<any>({ revenue: 0, orders: 0, products: 0, customers: 0 })
    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                setUserName(user.user_metadata?.name || 'Artisan')

                const { data: stores } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('user_id', user.id)

                if (!stores || stores.length === 0) {
                    setLoading(false)
                    return
                }

                const storeIds = stores.map(s => s.id)
                const { data: analytics } = await supabase.rpc('get_vendor_analytics', { target_store_id: storeIds[0] })
                const { count: productsCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .in('store_id', storeIds)

                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('id, total_jod, status, created_at, customers(id, name, phone)')
                    .in('store_id', storeIds)
                    .order('created_at', { ascending: false })
                    .limit(5)

                setStats({
                    revenue: analytics?.total_revenue || 0,
                    orders: analytics?.total_orders || 0,
                    products: productsCount || 0,
                    customers: analytics?.total_customers || 0,
                })

                if (ordersData) {
                    setRecentOrders(ordersData.map((o) => {
                        const customerInfo = Array.isArray(o.customers) ? o.customers[0] : o.customers
                        return {
                            id: o.id.slice(0, 8),
                            customer: (customerInfo as any)?.name || (customerInfo as any)?.phone || 'Unknown Guest',
                            total: Number(o.total_jod),
                            status: o.status,
                            time: o.created_at
                        }
                    }))
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
        <div className="flex-1 p-4 lg:p-8 space-y-6">
            <div className="h-48 rounded-2xl bg-surface-container-highest animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="h-40 rounded-2xl bg-surface-container animate-pulse"></div>
                <div className="h-40 rounded-2xl bg-surface-container animate-pulse"></div>
                <div className="h-40 rounded-2xl bg-surface-container animate-pulse"></div>
            </div>
        </div>
    )

    return (
        <div dir={dir} className="p-4 lg:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
            {/* Heritage Header Banner */}
            <div className="relative overflow-hidden rounded-[2rem] bg-surface-container-lowest p-8 md:p-12 shadow-sm border border-surface-variant flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Background Pattern Map */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23933436\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
                
                <div className="relative z-10 space-y-2 text-center md:text-left rtl:md:text-right">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-manrope font-bold text-xs uppercase tracking-widest rounded-full mb-2">Amman, Jordan</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-on-surface tracking-tight font-h1">
                        Marhaba, {userName}
                    </h1>
                    <p className="text-on-surface-variant text-lg max-w-xl font-manrope">
                        Your premium boutique is thriving. Here’s how your artisan marketplace is performing today.
                    </p>
                </div>
                
                <div className="relative z-10 flex gap-4">
                    <button className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full shadow-sm border border-outline-variant hover:bg-surface-container hover:-translate-y-0.5 transition-all font-semibold whitespace-nowrap active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">storefront</span>
                        View Storefront
                    </button>
                    <Link href="/dashboard/products/new" className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full shadow-md shadow-primary/20 hover:bg-surface-tint hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold whitespace-nowrap active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        New Listing
                    </Link>
                </div>
            </div>

            {/* Bento Grid KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                
                {/* Primary Metric: Revenue */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-primary text-on-primary p-6 md:p-8 flex flex-col justify-between shadow-xl shadow-primary/10 group">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-700"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10">
                            <span className="material-symbols-outlined text-white text-[28px]">payments</span>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[16px]">trending_up</span>
                            +12.5%
                        </span>
                    </div>
                    
                    <div className="mt-8 relative z-10">
                        <p className="text-primary-fixed-dim text-sm font-medium uppercase tracking-wider mb-1">Total Revenue</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl md:text-5xl font-extrabold tracking-tight font-h1">{stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="text-xl text-primary-fixed-dim font-bold">JOD</span>
                        </div>
                    </div>
                </div>

                {/* Secondary Metric: Orders */}
                <div className="rounded-[2rem] bg-surface-container-lowest p-6 border border-surface-variant flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-secondary-container text-on-secondary-container rounded-2xl">
                            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                        </div>
                        <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
                    </div>
                    
                    <div className="mt-6">
                        <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider mb-1">Active Orders</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold tracking-tight text-on-surface">{stats.orders}</span>
                            <span className="text-sm text-success font-semibold border border-success/20 bg-success/5 px-2 py-0.5 rounded-md">Orders</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-[2rem] bg-surface-container-lowest p-6 border border-surface-variant flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-tertiary-container text-on-tertiary-container rounded-2xl">
                            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider mb-1">Total Customers</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold tracking-tight text-on-surface">{stats.customers}</span>
                            <span className="text-sm text-on-surface-variant font-semibold">Profiles</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Content Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 rounded-[2rem] bg-surface-container-lowest border border-surface-variant shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 md:p-8 flex items-center justify-between border-b border-surface-variant">
                        <div>
                            <h2 className="text-xl font-bold text-on-surface font-h3">Recent Transactions</h2>
                            <p className="text-sm text-on-surface-variant mt-1 font-manrope">Your latest artisan sales.</p>
                        </div>
                        <Link href="/dashboard/orders" className="text-sm font-bold text-primary hover:text-surface-tint flex items-center gap-1 group">
                            View all <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1 rtl:rotate-180">arrow_forward</span>
                        </Link>
                    </div>
                    
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left rtl:text-right border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right rtl:text-left">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-variant">
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant">
                                            <span className="material-symbols-outlined text-[48px] opacity-20 mb-2">receipt_long</span>
                                            <p>No recent orders found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => {
                                        const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                                        return (
                                            <tr key={order.id} className="hover:bg-surface-container-low/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-bold text-on-surface font-manrope tracking-tight">#{order.id.slice(0,6).toUpperCase()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-surface-variant flex items-center justify-center font-bold text-xs text-on-surface border border-outline-variant">
                                                            {order.customer[0]}
                                                        </div>
                                                        <span className="font-medium text-on-surface font-manrope">{order.customer}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${status.bg} ${status.color}`}>
                                                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{status.icon}</span>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left">
                                                    <span className="font-extrabold text-on-surface">{order.total.toFixed(2)}</span>
                                                    <span className="text-xs text-on-surface-variant ml-1 font-semibold">JOD</span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Selling Categories */}
                <div className="rounded-[2rem] bg-surface-container-lowest border border-surface-variant shadow-sm overflow-hidden flex flex-col p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-secondary-container text-on-secondary-container rounded-xl">
                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>category</span>
                        </div>
                        <h2 className="text-xl font-bold text-on-surface font-h3">Assigned Products</h2>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center py-6 text-center">
                        <div className="w-32 h-32 rounded-full border-8 border-primary border-r-surface-container rotate-45 flex items-center justify-center mb-6 shadow-inner">
                            <div className="w-24 h-24 rounded-full bg-surface-container-lowest -rotate-45 flex items-center justify-center flex-col">
                                <span className="text-3xl font-black text-on-surface">{stats.products}</span>
                                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Items</span>
                            </div>
                        </div>
                        <Link href="/dashboard/products" className="w-full text-center font-bold text-primary hover:text-surface-tint border border-primary/20 rounded-xl py-3 hover:bg-primary/5 transition-colors">
                            Manage Inventory
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    )
}
