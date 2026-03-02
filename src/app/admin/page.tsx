'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Store, Users, ShoppingCart, DollarSign, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminDashboard() {
    const supabase = createClient()
    const [stats, setStats] = useState<any[]>([])
    const [pendingVendors, setPendingVendors] = useState<any[]>([])
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAdminData() {
            try {
                // 1. Fetch Stats
                const { count: storesCount } = await supabase.from('stores').select('*', { count: 'exact', head: true })
                const { count: vendorsCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'vendor')
                const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
                const { data: revenueData } = await supabase.from('orders').select('total')

                const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0

                setStats([
                    { label: 'إجمالي المتاجر', value: storesCount?.toString() || '0', icon: Store, color: '#6C3CE1', bg: 'rgba(108,60,225,0.15)', change: 'جميع المتاجر' },
                    { label: 'إجمالي التجار', value: vendorsCount?.toString() || '0', icon: Users, color: '#10B981', bg: 'rgba(16,185,129,0.15)', change: 'نشط وغير نشط' },
                    { label: 'إجمالي الطلبات', value: ordersCount?.toString() || '0', icon: ShoppingCart, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', change: 'منذ انطلاق المنصة' },
                    { label: 'إيرادات المنصة', value: totalRevenue.toFixed(2), icon: DollarSign, color: '#EF4444', bg: 'rgba(239,68,68,0.15)', change: 'د.أ تراكمي', suffix: 'د.أ' },
                ])

                // 2. Fetch Pending Vendors
                const { data: pending } = await supabase
                    .from('stores')
                    .select('*, users(name)')
                    .eq('is_approved', false)
                    .order('created_at', { ascending: false })

                if (pending) {
                    setPendingVendors(pending.map(s => ({
                        id: s.id,
                        name: s.name_ar,
                        owner: s.users?.name || 'غير معروف',
                        date: new Date(s.created_at).toLocaleDateString('en-CA'),
                        type: 'تجارة' // Can be refined if we have category on store
                    })))
                }

                // 3. Fetch Recent Activity (approximate with recent stores/orders)
                const { data: recentStores } = await supabase.from('stores').select('name_ar, created_at').order('created_at', { ascending: false }).limit(3)
                const { data: recentOrders } = await supabase.from('orders').select('total, created_at').order('created_at', { ascending: false }).limit(3)

                const activityItems: any[] = []

                recentStores?.forEach(s => {
                    activityItems.push({
                        icon: Store,
                        color: '#6C3CE1',
                        text: `تم إنشاء متجر جديد: ${s.name_ar}`,
                        time: new Date(s.created_at).toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' }),
                        ts: new Date(s.created_at).getTime()
                    })
                })

                recentOrders?.forEach(o => {
                    activityItems.push({
                        icon: ShoppingCart,
                        color: '#F59E0B',
                        text: `طلب جديد بقيمة ${o.total} د.أ`,
                        time: new Date(o.created_at).toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' }),
                        ts: new Date(o.created_at).getTime()
                    })
                })

                setRecentActivity(activityItems.sort((a, b) => b.ts - a.ts).slice(0, 5))

            } catch (err) {

                console.error('Error fetching admin data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAdminData()
    }, [supabase])

    const handleApproval = async (id: string, approve: boolean) => {
        const { error } = await supabase
            .from('stores')
            .update({ is_approved: approve })
            .eq('id', id)

        if (error) {
            toast.error('حدث خطأ أثناء المعالجة')
            return
        }

        setPendingVendors(prev => prev.filter(v => v.id !== id))
        toast.success(approve ? 'تمت الموافقة على المتجر!' : 'تم رفض الطلب')
    }

    if (loading) return (
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )

    return (
        <div
            style={{
                padding: 32,
                background: 'var(--background)',
                minHeight: 'calc(100vh - 60px)',
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>
                    لوحة الإدارة العليا
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    نظرة شاملة على أداء منصة باسكت
                </p>
            </div>

            {/* Stats */}
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
                        <div
                            key={stat.label}
                            style={{
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 16,
                                padding: 24,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 16,
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 12,
                                    background: stat.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Icon size={22} color={stat.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                                    {stat.value}
                                    {stat.suffix && (
                                        <span style={{ fontSize: 14, fontWeight: 600, marginRight: 4, color: 'var(--text-secondary)' }}>
                                            {stat.suffix}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>
                                    {stat.label}
                                </div>
                                <div style={{ fontSize: 11, color: stat.color, marginTop: 4, fontWeight: 600 }}>
                                    {stat.change}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
                {/* Pending Vendors */}
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
                        <div>
                            <h2 style={{ fontSize: 16, fontWeight: 700 }}>طلبات الموافقة على المتاجر</h2>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                                {pendingVendors.length} متاجر بانتظار المراجعة
                            </p>
                        </div>
                        <span className="badge badge-warning">
                            <Clock size={12} />
                            معلّق
                        </span>
                    </div>

                    <div style={{ padding: '0 24px' }}>
                        {pendingVendors.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                                لا توجد طلبات معلقة حالياً
                            </div>
                        ) : (
                            pendingVendors.map((vendor, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '18px 0',
                                        borderBottom: i < pendingVendors.length - 1 ? '1px solid var(--border)' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div
                                            style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 12,
                                                background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 800,
                                                fontSize: 16,
                                            }}
                                        >
                                            {vendor.name[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{vendor.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                                {vendor.owner} • {vendor.type} • {vendor.date}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleApproval(vendor.id, true)}
                                            style={{
                                                background: '#D1FAE5',
                                                color: '#065F46',
                                                border: 'none',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            موافقة
                                        </button>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleApproval(vendor.id, false)}
                                            style={{
                                                background: '#FEE2E2',
                                                color: '#991B1B',
                                                border: 'none',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            رفض
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card card-body">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>آخر النشاطات</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {recentActivity.map((activity, i) => {
                            const Icon = activity.icon
                            return (
                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: `${activity.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon size={14} color={activity.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
                                            {activity.text}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                                            {activity.time}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
