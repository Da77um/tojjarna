'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Store, CheckCircle, XCircle, Search, Trash2, Edit2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminVendorsPage() {
    const supabase = createClient()
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Modal state for deletion
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        fetchVendors()
    }, [])

    async function fetchVendors() {
        setLoading(true)
        const { data, error } = await supabase
            .from('stores')
            .select(`
                *,
                users (name, email),
                plans (name_ar, price_jod)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching vendors:', error)
            toast.error('حدث خطأ أثناء جلب قائمة التجار')
        } else {
            setVendors(data || [])
        }
        setLoading(false)
    }

    async function handleToggleStatus(id: string, currentStatus: boolean, isApprovalToggle = false) {
        const field = isApprovalToggle ? 'is_approved' : 'is_active'
        const { error } = await supabase
            .from('stores')
            .update({ [field]: !currentStatus })
            .eq('id', id)

        if (error) {
            toast.error('حدث خطأ أثناء تعديل حالة المتجر')
            return
        }

        setVendors(prev => prev.map(v => v.id === id ? { ...v, [field]: !currentStatus } : v))
        toast.success(isApprovalToggle ? (!currentStatus ? 'تمت الموافقة على المتجر' : 'تم إلغاء الموافقة') : (!currentStatus ? 'تم تفعيل المتجر' : 'تم إيقاف المتجر'))
    }

    async function handleDeleteConfirmed() {
        if (!itemToDelete) return
        setDeleting(true)
        try {
            const { error } = await supabase.from('stores').delete().eq('id', itemToDelete.id)
            if (error) throw error

            setVendors(prev => prev.filter(v => v.id !== itemToDelete.id))
            toast.success('تم حذف المتجر بنجاح')
        } catch (err: any) {
            toast.error('حدث خطأ أثناء حذف المتجر: ' + err.message)
        } finally {
            setDeleting(false)
            setItemToDelete(null)
        }
    }

    const filtered = vendors.filter(v =>
        v.name_ar?.toLowerCase().includes(search.toLowerCase()) ||
        v.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
        v.slug?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return (
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )

    return (
        <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 6 }}>
                        إدارة التجار والمتاجر
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                        إدارة جميع المتاجر المسجلة على المنصة، وحالة اشتراكاتهم وتفعيلهم
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="بحث عن متجر..."
                            className="form-control"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingRight: 40, width: 300 }}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ padding: '16px 20px', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>المتجر / التاجر</th>
                            <th style={{ padding: '16px 20px', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>الرابط</th>
                            <th style={{ padding: '16px 20px', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>الخطة</th>
                            <th style={{ padding: '16px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>الموافقة</th>
                            <th style={{ padding: '16px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>نشط</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                                    لا يوجد متاجر مطابقة للبحث
                                </td>
                            </tr>
                        ) : (
                            filtered.map((vendor) => (
                                <tr key={vendor.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(108,60,225,0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', border: '1px solid rgba(108,60,225,0.2)' }}>
                                                {vendor.logo_url ? (
                                                    <img src={vendor.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} />
                                                ) : (
                                                    <Store size={20} color="#6C3CE1" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>{vendor.name_ar}</div>
                                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{vendor.users?.name || 'مجهول'} • {vendor.users?.email || 'لا يوجد إيميل'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6, display: 'inline-block', color: 'rgba(255,255,255,0.8)' }}>
                                            /{vendor.slug}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>
                                            {vendor.plans?.name_ar || 'غير محدد'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleToggleStatus(vendor.id, vendor.is_approved, true)}
                                            style={{
                                                background: vendor.is_approved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                                border: vendor.is_approved ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)',
                                                padding: '6px 12px',
                                                borderRadius: 20,
                                                color: vendor.is_approved ? '#10B981' : '#F59E0B',
                                                fontSize: 12,
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6
                                            }}
                                        >
                                            {vendor.is_approved ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {vendor.is_approved ? 'موافق عليه' : 'بانتظار الموافقة'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={vendor.is_active}
                                                onChange={() => handleToggleStatus(vendor.id, vendor.is_active, false)}
                                                style={{ width: 18, height: 18, accentColor: '#6C3CE1' }}
                                            />
                                        </label>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'left' }}>
                                        <button
                                            onClick={() => setItemToDelete({ id: vendor.id, name: vendor.name_ar })}
                                            className="btn btn-sm"
                                            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', padding: 8 }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {itemToDelete && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32, textAlign: 'center', animation: 'slideUp 0.3s ease-out' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <ShieldAlert size={32} color="#EF4444" />
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>هل أنت متأكد من حذف المتجر؟</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
                            أنت على وشك حذف المتجر <strong style={{ color: 'white' }}>{itemToDelete.name}</strong>. هذا الإجراء لا يمكن التراجع عنه وسيحذف جميع بيانات المتجر.
                        </p>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={handleDeleteConfirmed}
                                disabled={deleting}
                                className="btn"
                                style={{
                                    flex: 1,
                                    background: '#EF4444',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 700,
                                    opacity: deleting ? 0.7 : 1
                                }}
                            >
                                {deleting ? 'جاري الحذف...' : 'نعم، احذف المتجر'}
                            </button>
                            <button
                                onClick={() => setItemToDelete(null)}
                                disabled={deleting}
                                className="btn"
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
