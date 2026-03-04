'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    TrendingUp, Store, Users, DollarSign, Activity, AlertTriangle, Zap, ArrowUpRight, ArrowDownRight, CreditCard
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export default function AdminOverviewPage() {
    const supabase = createClient()

    const [stats, setStats] = useState({
        mrr: 0, gmv: 0, totalStores: 0, activeStores: 0
    })
    const [chartData, setChartData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    // Admin theme colors
    const primary = '#6C3CE1'
    const success = '#10B981'
    const warning = '#F59E0B'
    const danger = '#EF4444'
    const surface = '#161A28'
    const bgDark = '#0F111A'
    const borderDark = '#2D3348'
    const textBright = '#F3F4F6'
    const textMuted = '#9CA3AF'

    useEffect(() => {
        async function fetchStats() {
            try {
                const { data: analytics } = await supabase.rpc('get_admin_analytics')

                // Total Stores (including pending/suspended)
                const { count: totalStores } = await supabase.from('stores').select('*', { count: 'exact', head: true })

                setStats({
                    mrr: analytics?.total_commission || 0,
                    gmv: analytics?.global_gmv || 0,
                    totalStores: totalStores || 0,
                    activeStores: analytics?.active_stores || 0
                })

                if (analytics?.revenue_trend) {
                    const formattedTrend = analytics.revenue_trend.map((t: any) => {
                        const d = new Date(t.date)
                        return {
                            name: `${d.getDate()}/${d.getMonth() + 1}`,
                            gmv: t.gmv
                        }
                    })
                    setChartData(formattedTrend)
                }

            } catch (err) {
                console.error("Failed to load platform stats", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [supabase])

    const kpiData = [
        { title: 'عمولات المنصة (JOD)', value: `${stats.mrr.toLocaleString('ar-JO')} د.أ`, trend: 'العمولات', isUp: true, icon: DollarSign, color: success },
        { title: 'حجم المعاملات (GMV)', value: `${stats.gmv.toLocaleString('ar-JO')} د.أ`, trend: 'إجمالي المبيعات', isUp: true, icon: CreditCard, color: primary },
        { title: 'إجمالي المتاجر', value: stats.totalStores, trend: 'كل الحالات', isUp: true, icon: Store, color: warning },
        { title: 'المتاجر النشطة', value: stats.activeStores, trend: 'مفعلة', isUp: true, icon: Activity, color: success },
    ]

    const aiInsights = [
        { type: 'danger', message: '٣ متاجر VIP (إيراد > ١٠٠٠ د.أ) لم تسجل دخول منذ أسبوعين.', icon: AlertTriangle },
        { type: 'warning', message: 'استخدام بوابات الدفع (الدفع عند الاستلام) يمثل ٨٠٪ من طلبات هذا الشهر.', icon: Zap },
        { type: 'success', message: 'منحنى النمو لمشتراكات Pro ارتفع بنسبة ١٢٪ بعد إطلاق الكوبونات.', icon: TrendingUp },
    ]

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner" /></div>

    return (
        <div style={{ paddingBottom: 40 }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: 'white' }}>نظرة عامة على المنصة</h1>
                <p style={{ margin: '8px 0 0 0', color: textMuted, fontSize: 15 }}>تتبع أداء المنصة، الإيرادات، والمتاجر النشطة في الوقت الفعلي.</p>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                {kpiData.map((kpi, i) => {
                    const Icon = kpi.icon
                    return (
                        <div key={i} style={{
                            background: surface, borderRadius: 16, padding: 24, border: `1px solid ${borderDark}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12, background: `${kpi.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${kpi.color}30`
                                }}>
                                    <Icon size={22} color={kpi.color} />
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 100,
                                    background: kpi.isUp ? `${success}15` : `${danger}15`, color: kpi.isUp ? success : danger, fontSize: 13, fontWeight: 700
                                }}>
                                    {kpi.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {kpi.trend}
                                </div>
                            </div>
                            <div style={{ fontSize: 14, color: textMuted, fontWeight: 600, marginBottom: 8 }}>{kpi.title}</div>
                            <div style={{ fontSize: 26, fontWeight: 900, color: textBright, letterSpacing: '-0.02em' }}>{kpi.value}</div>

                            {/* Decorative background glow */}
                            <div style={{
                                position: 'absolute', bottom: -20, left: -20, width: 100, height: 100,
                                borderRadius: '50%', background: kpi.color, filter: 'blur(60px)', opacity: 0.1, zIndex: 0
                            }} />
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media (max-width: 1100px) {
                        .admin-grid { grid-template-columns: 1fr !important; }
                    }
                ` }} />

                {/* Main Chart */}
                <div style={{
                    background: surface, borderRadius: 16, border: `1px solid ${borderDark}`, padding: 24,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }} className="admin-grid">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'white' }}>نمو الإيرادات المنصة</h2>
                        <select style={{
                            background: bgDark, border: `1px solid ${borderDark}`, color: textBright, padding: '6px 12px',
                            borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer'
                        }}>
                            <option>آخر ٧ أشهر</option>
                            <option>آخر ٣٠ يوم</option>
                            <option>هذا العام</option>
                        </select>
                    </div>

                    <div style={{ height: 340, width: '100%', direction: 'ltr' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={primary} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={primary} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={success} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={success} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke={textMuted} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={textMuted} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={borderDark} />
                                <Tooltip
                                    contentStyle={{ background: bgDark, border: `1px solid ${borderDark}`, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ fontSize: 13 }}
                                    labelStyle={{ color: textMuted, marginBottom: 8, fontSize: 14, fontWeight: 700 }}
                                />
                                <Area type="monotone" name="إجمالي التداولات (GMV)" dataKey="gmv" stroke={primary} strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insights & Alerts Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{
                        background: `linear-gradient(180deg, ${surface} 0%, rgba(22,26,40,0.4) 100%)`,
                        borderRadius: 16, border: `1px solid ${borderDark}`, position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${borderDark}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: primary, boxShadow: `0 0 10px ${primary}` }} />
                            <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'white' }}>رؤى الذكاء الاصطناعي</h3>
                        </div>
                        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {aiInsights.map((insight, i) => {
                                const color = insight.type === 'danger' ? danger : insight.type === 'warning' ? warning : success
                                const Icon = insight.icon
                                return (
                                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                            <Icon size={16} color={color} />
                                        </div>
                                        <div style={{ fontSize: 13, lineHeight: 1.6, color: textBright }}>
                                            {insight.message}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Glow effect */}
                        <div style={{
                            position: 'absolute', top: 0, right: 0, width: 200, height: 100,
                            background: primary, filter: 'blur(80px)', opacity: 0.1, zIndex: 0, pointerEvents: 'none'
                        }} />
                    </div>

                    <div style={{
                        background: surface, borderRadius: 16, border: `1px solid ${borderDark}`, padding: 24
                    }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px 0', color: 'white' }}>إجراءات سريعة</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button style={{ width: '100%', padding: '12px 16px', background: `${primary}15`, border: `1px solid ${primary}30`, color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'right', transition: 'background 0.2s' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${primary}25`}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${primary}15`}
                            >
                                + إنشاء ترويج (Promo Code)
                            </button>
                            <button style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: `1px solid ${borderDark}`, color: textBright, borderRadius: 10, fontSize: 13, cursor: 'pointer', textAlign: 'right', transition: 'background 0.2s' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                            >
                                مراجعة الحوالات المعلقة (3)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
