'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TrendingUp, Users, Store, DollarSign, Activity, Calendar } from 'lucide-react'

export default function AdminAnalyticsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalCommissions: 0,
        completedOrders: 0,
        activeStores: 0,
        totalCustomers: 0,
        totalProducts: 0
    })

    useEffect(() => {
        fetchAnalytics()
    }, [])

    async function fetchAnalytics() {
        setLoading(true)
        try {
            // Fetch total revenue from completed orders
            const { data: revenueData } = await supabase
                .from('orders')
                .select('total')
                .in('status', ['delivered', 'shipped', 'processing'])
            const totalRevenue = revenueData?.reduce((acc, order) => acc + Number(order.total), 0) || 0

            // Estimate total commissions (or fetch from platform_transactions if used)
            const { data: commissionData } = await supabase
                .from('platform_transactions')
                .select('commission_amount')
            let totalCommissions = commissionData?.reduce((acc, txn) => acc + Number(txn.commission_amount), 0) || 0

            // Fallback estimation if no transactions exist but revenue does (assuming generic 2.5%)
            if (totalCommissions === 0 && totalRevenue > 0) {
                totalCommissions = totalRevenue * 0.025
            }

            const { count: completedOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['delivered', 'shipped', 'processing'])
            const { count: activeStores } = await supabase.from('stores').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('is_approved', true)
            const { count: totalCustomers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer')
            const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true)

            setStats({
                totalRevenue,
                totalCommissions,
                completedOrders: completedOrders || 0,
                activeStores: activeStores || 0,
                totalCustomers: totalCustomers || 0,
                totalProducts: totalProducts || 0
            })

        } catch (err) {
            console.error('Error fetching analytics:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )

    const cards = [
        { title: 'إجمالي المبيعات (المنصة)', value: stats.totalRevenue.toFixed(2), prefix: 'د.أ', icon: DollarSign, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
        { title: 'أرباح وعمولات المنصة', value: stats.totalCommissions.toFixed(2), prefix: 'د.أ', icon: TrendingUp, color: '#6C3CE1', bg: 'rgba(108,60,225,0.1)' },
        { title: 'الطلبات الناجحة', value: stats.completedOrders.toString(), prefix: '', icon: Activity, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        { title: 'المتاجر النشطة', value: stats.activeStores.toString(), prefix: '', icon: Store, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
        { title: 'إجمالي المشترين', value: stats.totalCustomers.toString(), prefix: '', icon: Users, color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
        { title: 'المنتجات المعروضة', value: stats.totalProducts.toString(), prefix: '', icon: BarChart3, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    ]

    return (
        <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 6 }}>
                        تحليلات وإيرادات المنصة
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                        إحصائيات شاملة لأداء جميع المتاجر وتدفق الإيرادات
                    </p>
                </div>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={16} />
                    كل الأوقات (تراكمي)
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
                {cards.map((c, i) => {
                    const Icon = c.icon
                    return (
                        <div key={i} className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ width: 56, height: 56, borderRadius: 16, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={26} color={c.color} />
                            </div>
                            <div>
                                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 4 }}>
                                    {c.title}
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                                    {c.value} {c.prefix && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginRight: 4, fontWeight: 700 }}>{c.prefix}</span>}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <BarChart3 size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8 }}>المخططات البيانية قيد التطوير</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 400, textAlign: 'center' }}>
                    نحن نعمل على بناء نظام مخططات بيانية احترافي يعرض نمو المبيعات، ومعدلات الاشتراك، والمناطق الجغرافية النشطة بالتفصيل الكامل.
                </p>
            </div>
        </div>
    )
}
