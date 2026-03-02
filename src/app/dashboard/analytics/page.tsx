'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const monthlyRevenue = [
    { month: 'سبتمبر', revenue: 1200 },
    { month: 'أكتوبر', revenue: 1850 },
    { month: 'نوفمبر', revenue: 1400 },
    { month: 'ديسمبر', revenue: 2800 },
    { month: 'يناير', revenue: 2100 },
    { month: 'فبراير', revenue: 3200 },
]

const topProducts = [
    { name: 'عطر فرنسي', sold: 201, revenue: 11055 },
    { name: 'قميص قطني أبيض', sold: 120, revenue: 1500 },
    { name: 'عباءة فاخرة', sold: 89, revenue: 7565 },
    { name: 'حقيبة جلد بني', sold: 56, revenue: 2520 },
    { name: 'حذاء رياضي أسود', sold: 43, revenue: 2795 },
]

const orderStatuses = [
    { name: 'تم التسليم', value: 68, color: '#10B981' },
    { name: 'قيد الشحن', value: 15, color: '#8B5CF6' },
    { name: 'قيد المعالجة', value: 10, color: '#3B82F6' },
    { name: 'ملغي', value: 7, color: '#EF4444' },
]

const stats = [
    { label: 'إجمالي الإيرادات', value: '12,355', suffix: 'د.أ', change: '+18%', up: true },
    { label: 'إجمالي الطلبات', value: '341', change: '+23%', up: true },
    { label: 'متوسط قيمة الطلب', value: '36.2', suffix: 'د.أ', change: '-4%', up: false },
    { label: 'معدل التحويل', value: '3.8', suffix: '%', change: '+0.5%', up: true },
]

export default function AnalyticsPage() {
    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">التحليلات والتقارير</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        آخر 6 أشهر
                    </p>
                </div>
                <select className="form-control" style={{ width: 'auto' }}>
                    <option>آخر 6 أشهر</option>
                    <option>آخر 30 يوم</option>
                    <option>هذا العام</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {stats.map((s) => (
                    <div key={s.label} className="card card-body">
                        <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)' }}>
                            {s.value}
                            {s.suffix && <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginRight: 4 }}>{s.suffix}</span>}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 6, color: s.up ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                            {s.change} مقارنة بالفترة السابقة
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                {/* Revenue Chart */}
                <div className="card card-body">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>الإيرادات الشهرية (د.أ)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6C3CE1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6C3CE1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                                formatter={(v: number | undefined) => [`${v || 0} د.أ`, 'الإيرادات']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#6C3CE1" strokeWidth={2.5} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Status Pie */}
                <div className="card card-body">
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>توزيع الطلبات</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={orderStatuses} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                {orderStatuses.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v: number | undefined) => [`${v || 0}%`, '']} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                        {orderStatuses.map((s) => (
                            <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                                </div>
                                <span style={{ fontWeight: 700 }}>{s.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="card">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>أكثر المنتجات مبيعاً</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['#', 'المنتج', 'الكميات المباعة', 'الإيرادات'].map((h) => (
                                <th key={h} style={{ textAlign: 'right', padding: '12px 24px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.map((p, i) => (
                            <tr key={p.name} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontWeight: 700, width: 40 }}>{i + 1}</td>
                                <td style={{ padding: '14px 24px', fontWeight: 600 }}>{p.name}</td>
                                <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{p.sold} وحدة</td>
                                <td style={{ padding: '14px 24px', fontWeight: 700 }}>
                                    {p.revenue.toLocaleString()} د.أ
                                    <div style={{ marginTop: 4, height: 4, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', borderRadius: 4, background: 'var(--primary)', width: `${(p.revenue / topProducts[0].revenue) * 100}%` }} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
