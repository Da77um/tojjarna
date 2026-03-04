'use client'

import { useState } from 'react'
import {
    Search, Filter, MoreVertical, Edit, Ban, ExternalLink, ShieldAlert,
    CheckCircle, XCircle, TrendingUp, Store, AlertTriangle
} from 'lucide-react'

export default function AdminStoresPage() {
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

    // Mock data for stores
    const [stores, setStores] = useState([
        { id: '1', name: 'أناقة فاشون', slug: 'anaqa-fashion', plan: 'Pro', status: 'approved', health: 98, gmv: '١٢,٤٠٠ د.أ', created: '2025-11-20' },
        { id: '2', name: 'إلكترونيات سمارت', slug: 'smart-elec', plan: 'Basic', status: 'approved', health: 85, gmv: '٤,٢٥٠ د.أ', created: '2026-01-15' },
        { id: '3', name: 'عطور الشرق', slug: 'orient-perfumes', plan: 'Pro', status: 'pending', health: null, gmv: '٠ د.أ', created: '2026-03-01' },
        { id: '4', name: 'مكتبة اقرأ', slug: 'iqra-books', plan: 'Free', status: 'approved', health: 92, gmv: '٨٥٠ د.أ', created: '2026-02-10' },
        { id: '5', name: 'متجر الجمال سيكريت', slug: 'beauty-secret', plan: 'Pro', status: 'suspended', health: 45, gmv: '١,١٠٠ د.أ', created: '2025-08-05' },
    ])

    const suspendStore = (id: string) => {
        setStores(stores.map(s => s.id === id ? { ...s, status: s.status === 'suspended' ? 'approved' : 'suspended', health: s.status === 'suspended' ? 80 : 30 } : s))
        alert(`تم تغيير حالة المتجر. في النسخة النهائية سيتم تحديث قاعدة البيانات.`)
    }

    return (
        <div style={{ paddingBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: 'white' }}>إدارة المتاجر</h1>
                    <p style={{ margin: '8px 0 0 0', color: textMuted, fontSize: 15 }}>مراقبة أداء المتاجر، الحالات، والصلاحيات.</p>
                </div>
                <button style={{
                    background: primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8,
                    fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14,
                    boxShadow: `0 4px 12px ${primary}40`, transition: 'all 0.2s',
                }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                >
                    + إضافة متجر تجريبي
                </button>
            </div>

            {/* Filters Bar */}
            <div style={{
                display: 'flex', gap: 16, marginBottom: 24, padding: 16, background: surface,
                borderRadius: 16, border: `1px solid ${borderDark}`, alignItems: 'center', flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                    <Search size={18} color={textMuted} style={{ position: 'absolute', right: 14, top: 11 }} />
                    <input type="text" placeholder="ابحث باسم المتجر أو الرابط (slug)..." style={{
                        width: '100%', background: bgDark, border: `1px solid ${borderDark}`, padding: '10px 14px 10px 40px',
                        borderRadius: 8, color: textBright, outline: 'none', fontSize: 13, fontFamily: 'inherit'
                    }}
                        onFocus={e => e.target.style.borderColor = primary}
                        onBlur={e => e.target.style.borderColor = borderDark}
                    />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <select style={{ background: bgDark, border: `1px solid ${borderDark}`, color: textBright, padding: '10px 16px', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                        <option value="">كل الحالات</option>
                        <option value="approved">نشط</option>
                        <option value="pending">قيد المراجعة</option>
                        <option value="suspended">موقوف</option>
                    </select>
                    <select style={{ background: bgDark, border: `1px solid ${borderDark}`, color: textBright, padding: '10px 16px', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                        <option value="">كل الباقات</option>
                        <option value="Free">المجاني</option>
                        <option value="Basic">الأساسي</option>
                        <option value="Pro">الاحترافي</option>
                    </select>
                    <button style={{ background: bgDark, border: `1px solid ${borderDark}`, color: textBright, padding: '10px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                        <Filter size={16} /> تصفية متقدمة
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div style={{
                background: surface, borderRadius: 16, border: `1px solid ${borderDark}`, overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${borderDark}`, background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>المتجر</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>الحالة</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>الباقة (الخطة)</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>صحة المتجر</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13 }}>إيرادات الشهر (GMV)</th>
                                <th style={{ padding: '16px 20px', color: textMuted, fontWeight: 600, fontSize: 13, textAlign: 'center' }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map((store, i) => (
                                <tr key={store.id} style={{ borderBottom: i === stores.length - 1 ? 'none' : `1px solid ${borderDark}`, transition: 'background 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                                >
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${primary}, #8B5CF6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Store size={18} color="white" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: textBright, fontSize: 14 }}>{store.name}</div>
                                                <div style={{ color: textMuted, fontSize: 12, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    {store.slug}.tojjarna.com <ExternalLink size={10} />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        {store.status === 'approved' && <span style={{ padding: '4px 10px', background: `${success}15`, color: success, borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle size={14} /> نشط</span>}
                                        {store.status === 'pending' && <span style={{ padding: '4px 10px', background: `${warning}15`, color: warning, borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> قيد المراجعة</span>}
                                        {store.status === 'suspended' && <span style={{ padding: '4px 10px', background: `${danger}15`, color: danger, borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ban size={14} /> موقوف</span>}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ fontWeight: 600, color: textBright, fontSize: 13 }}>{store.plan}</span>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        {store.health !== null ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, minWidth: 60, height: 6, background: borderDark, borderRadius: 10, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', background: store.health > 80 ? success : store.health > 50 ? warning : danger, width: `${store.health}%`, borderRadius: 10 }} />
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: store.health > 80 ? success : store.health > 50 ? warning : danger, width: 24 }}>{store.health}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: textMuted, fontSize: 12 }}>—</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 20px', fontWeight: 700, color: textBright, fontSize: 14 }}>
                                        {store.gmv}
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: textMuted }} title="تعديل المتجر"
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = textBright}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = textMuted}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => suspendStore(store.id)}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: store.status === 'suspended' ? success : textMuted }} title={store.status === 'suspended' ? 'تفعيل' : 'إيقاف مؤقت'}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = store.status === 'suspended' ? success : danger}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = store.status === 'suspended' ? success : textMuted}
                                            >
                                                {store.status === 'suspended' ? <CheckCircle size={16} /> : <Ban size={16} />}
                                            </button>
                                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: textMuted }} title="مزيد من الخيارات"
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = textBright}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = textMuted}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${borderDark}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: textMuted, fontSize: 13 }}>
                        إظهار ١-٥ من أصل ٨٤٢ متجر
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ padding: '6px 14px', background: bgDark, border: `1px solid ${borderDark}`, color: textMuted, borderRadius: 8, fontSize: 12, cursor: 'not-allowed' }}>السابق</button>
                        <button style={{ padding: '6px 14px', background: primary, border: 'none', color: 'white', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>١</button>
                        <button style={{ padding: '6px 14px', background: bgDark, border: `1px solid ${borderDark}`, color: textBright, borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>٢</button>
                        <button style={{ padding: '6px 14px', background: bgDark, border: `1px solid ${borderDark}`, color: textBright, borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>٣</button>
                        <button style={{ padding: '6px 14px', background: bgDark, border: `1px solid ${borderDark}`, color: textBright, borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>التالي</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
