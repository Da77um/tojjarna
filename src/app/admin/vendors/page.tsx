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
    const [allPlans, setAllPlans] = useState<any[]>([])

    // Modal state for deletion
    const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Modal state for editing plan
    const [planToEdit, setPlanToEdit] = useState<{ store: any, newPlanId: string } | null>(null)
    const [savingPlan, setSavingPlan] = useState(false)

    // Modal state for editing user
    const [userToEdit, setUserToEdit] = useState<{ id: string, name: string, email: string, newName: string, newEmail: string } | null>(null)
    const [savingUser, setSavingUser] = useState(false)

    useEffect(() => {
        fetchVendors()
        fetchPlans()
    }, [])

    async function fetchPlans() {
        const { data } = await supabase.from('plans').select('id, name_ar, price_jod').order('sort_order', { ascending: true })
        if (data) setAllPlans(data)
    }

    async function fetchVendors() {
        setLoading(true)
        const { data, error } = await supabase
            .from('stores')
            .select(`
                *,
                users (id, name, email),
                plans (id, name_ar, price_jod)
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
        if (isApprovalToggle) {
            const { error } = await supabase.from('stores').update({ is_approved: !currentStatus }).eq('id', id)
            if (error) { toast.error('حدث خطأ أثناء تعديل حالة المتجر'); return }
            setVendors(prev => prev.map(v => v.id === id ? { ...v, is_approved: !currentStatus } : v))
            toast.success(!currentStatus ? 'تمت الموافقة على المتجر' : 'تم إلغاء الموافقة')
        } else {
            // Suspended toggle (mapping boolean to status string)
            const newStatus = currentStatus ? 'suspended' : 'approved'
            const { error } = await supabase.from('stores').update({ status: newStatus }).eq('id', id)
            if (error) { toast.error('حدث خطأ أثناء إيقاف المتجر'); return }
            setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v))
            toast.success(newStatus === 'suspended' ? 'تم إيقاف المتجر مؤقتاً' : 'تم تفعيل المتجر')
        }
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

    async function handleSavePlan() {
        if (!planToEdit) return
        setSavingPlan(true)
        try {
            const { error } = await supabase.from('stores').update({ plan_id: planToEdit.newPlanId }).eq('id', planToEdit.store.id)
            if (error) throw error

            const updatedPlan = allPlans.find(p => p.id === planToEdit.newPlanId)

            setVendors(prev => prev.map(v => v.id === planToEdit.store.id ? {
                ...v, plan_id: planToEdit.newPlanId, plans: updatedPlan
            } : v))

            toast.success('تم تغيير الباقة بنجاح')
            setPlanToEdit(null)
        } catch (err: any) {
            toast.error('حدث خطأ أثناء تغيير الباقة: ' + err.message)
        } finally {
            setSavingPlan(false)
        }
    }

    async function handleSaveUser() {
        if (!userToEdit) return
        setSavingUser(true)
        try {
            const { error } = await supabase.from('users').update({
                name: userToEdit.newName,
                email: userToEdit.newEmail
            }).eq('id', userToEdit.id)

            if (error) throw error

            setVendors(prev => prev.map(v => v.users?.id === userToEdit.id ? {
                ...v, users: { ...v.users, name: userToEdit.newName, email: userToEdit.newEmail }
            } : v))

            toast.success('تم تحديث بيانات التاجر بنجاح')
            setUserToEdit(null)
        } catch (err: any) {
            toast.error('حدث خطأ أثناء تحديث التاجر: ' + err.message)
        } finally {
            setSavingUser(false)
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
                                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {vendor.users?.name || 'مجهول'} • {vendor.users?.email || 'لا يوجد إيميل'}
                                                    {vendor.users && (
                                                        <button
                                                            onClick={() => setUserToEdit({ id: vendor.users.id, name: vendor.users.name || '', email: vendor.users.email || '', newName: vendor.users.name || '', newEmail: vendor.users.email || '' })}
                                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: '#6C3CE1' }}
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontSize: 13, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6, display: 'inline-block', color: 'rgba(255,255,255,0.8)' }}>
                                            /{vendor.slug}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontSize: 13, color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {vendor.plans?.name_ar || 'غير محدد'}
                                            <button
                                                onClick={() => setPlanToEdit({ store: vendor, newPlanId: vendor.plan_id || '' })}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#6C3CE1' }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
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
                                                checked={vendor.status !== 'suspended'}
                                                onChange={() => handleToggleStatus(vendor.id, vendor.status !== 'suspended', false)}
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

            {/* Edit Plan Modal */}
            {planToEdit && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32, animation: 'slideUp 0.3s ease-out' }}>
                        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: 'white' }}>تعديل باقة المتجر</h2>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>اختر الباقة الجديدة</label>
                            <select
                                value={planToEdit.newPlanId}
                                onChange={e => setPlanToEdit({ ...planToEdit, newPlanId: e.target.value })}
                                className="form-control"
                            >
                                <option value="">اختر باقة...</option>
                                {allPlans.map(p => (
                                    <option key={p.id} value={p.id}>{p.name_ar} {p.price_jod === 0 ? '(مجاني)' : `(${p.price_jod} د.أ)`}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={handleSavePlan}
                                disabled={savingPlan || !planToEdit.newPlanId}
                                className="btn btn-primary"
                                style={{ flex: 1, opacity: (savingPlan || !planToEdit.newPlanId) ? 0.7 : 1 }}
                            >
                                {savingPlan ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                            <button
                                onClick={() => setPlanToEdit(null)}
                                disabled={savingPlan}
                                className="btn"
                                style={{
                                    flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {userToEdit && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32, animation: 'slideUp 0.3s ease-out' }}>
                        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: 'white' }}>تعديل بيانات التاجر</h2>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>اسم التاجر</label>
                            <input
                                type="text"
                                value={userToEdit.newName}
                                onChange={e => setUserToEdit({ ...userToEdit, newName: e.target.value })}
                                className="form-control"
                                placeholder="اسم التاجر"
                            />
                        </div>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={userToEdit.newEmail}
                                onChange={e => setUserToEdit({ ...userToEdit, newEmail: e.target.value })}
                                className="form-control"
                                placeholder="البريد الإلكتروني"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={handleSaveUser}
                                disabled={savingUser || !userToEdit.newName || !userToEdit.newEmail}
                                className="btn btn-primary"
                                style={{ flex: 1, opacity: (savingUser || !userToEdit.newName || !userToEdit.newEmail) ? 0.7 : 1 }}
                            >
                                {savingUser ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                            <button
                                onClick={() => setUserToEdit(null)}
                                disabled={savingUser}
                                className="btn"
                                style={{
                                    flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
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
