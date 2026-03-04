'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Search, Filter, MoreVertical, Edit, Ban, ExternalLink, ShieldAlert,
    CheckCircle, XCircle, TrendingUp, Store, AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminStoresPage() {
    const supabase = createClient()
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

    // Real data for stores
    const [stores, setStores] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [totalStores, setTotalStores] = useState(0)

    // Pagination
    const PAGE_SIZE = 15
    const [page, setPage] = useState(1)

    // Filters
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [planFilter, setPlanFilter] = useState('')

    useEffect(() => {
        async function fetchStores() {
            try {
                setLoading(true)
                let query = supabase.from('stores').select('*', { count: 'exact' })

                if (search) {
                    query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%,slug.ilike.%${search}%`)
                }
                if (statusFilter) {
                    query = query.eq('status', statusFilter)
                }

                const from = (page - 1) * PAGE_SIZE
                const to = from + PAGE_SIZE - 1
                query = query.range(from, to).order('created_at', { ascending: false })

                const { data, count, error } = await query

                if (error) throw error

                // Map GMV and format dates (mocking health and gmv for now if no real orders table connected)
                const mappedStores = data?.map(store => ({
                    ...store,
                    health: store.status === 'suspended' ? 30 : 95, // mock health score
                    gmv: '٠ د.أ', // Need an aggregated query or RPC for GMV per store
                    created: new Date(store.created_at).toLocaleDateString('ar-JO')
                })) || []

                setStores(mappedStores)
                setTotalStores(count || 0)
            } catch (err) {
                console.error("Error loading stores:", err)
                toast.error("فشل في تحميل بيانات المتاجر")
            } finally {
                setLoading(false)
            }
        }

        fetchStores()
    }, [supabase, page, search, statusFilter, planFilter])

    const suspendStore = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'suspended' ? 'approved' : 'suspended'

        try {
            const { error } = await supabase.from('stores').update({ status: newStatus }).eq('id', id)
            if (error) throw error

            setStores(stores.map(s => s.id === id ? { ...s, status: newStatus, health: newStatus === 'suspended' ? 30 : 95 } : s))
            toast.success(`تم ${newStatus === 'suspended' ? 'إيقاف' : 'تفعيل'} المتجر بنجاح`)
        } catch (err) {
            console.error("Error updating store status", err)
            toast.error("حدث خطأ أثناء تغيير حالة المتجر")
        }
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
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        style={{ background: bgDark, border: `1px solid ${borderDark}`, color: textBright, padding: '10px 16px', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
                        <option value="">كل الحالات</option>
                        <option value="approved">نشط</option>
                        <option value="pending">قيد المراجعة</option>
                        <option value="suspended">موقوف</option>
                    </select>
                    <select
                        value={planFilter}
                        onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
                        style={{ background: bgDark, border: `1px solid ${borderDark}`, color: textBright, padding: '10px 16px', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer' }}>
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
                                                <div style={{ fontWeight: 700, color: textBright, fontSize: 14 }}>{store.name_ar || store.name}</div>
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
                                        <span style={{ fontWeight: 600, color: textBright, fontSize: 13 }}>{store.plan || 'Free'}</span>
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
                                                onClick={() => suspendStore(store.id, store.status)}
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
                        إظهار {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalStores)} من أصل {totalStores} متجر
                    </div>

                    {/* Simplified mapping for pages */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            style={{ padding: '6px 14px', background: bgDark, border: `1px solid ${borderDark}`, color: page === 1 ? '#4B5563' : textMuted, borderRadius: 8, fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>السابق</button>

                        <button style={{ padding: '6px 14px', background: primary, border: 'none', color: 'white', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>{page}</button>

                        <button
                            disabled={page * PAGE_SIZE >= totalStores}
                            onClick={() => setPage(page + 1)}
                            style={{ padding: '6px 14px', background: bgDark, border: `1px solid ${borderDark}`, color: page * PAGE_SIZE >= totalStores ? '#4B5563' : textBright, borderRadius: 8, fontSize: 12, cursor: page * PAGE_SIZE >= totalStores ? 'not-allowed' : 'pointer' }}>التالي</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
