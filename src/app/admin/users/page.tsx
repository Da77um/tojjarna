'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Search, ShieldCheck, Mail, Phone, Calendar, MoreVertical, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminUsersPage() {
    const supabase = createClient()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        setLoading(true)
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching users:', error)
            toast.error('حدث خطأ أثناء جلب قائمة المستخدمين')
        } else {
            setUsers(data || [])
        }
        setLoading(false)
    }

    async function handleRoleChange(userId: string, newRole: string) {
        const { error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) {
            toast.error('حدث خطأ أثناء تغيير صلاحية المستخدم')
            return
        }

        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
        toast.success('تم تحديث صلاحية المستخدم بنجاح')
    }

    async function handleToggleActive(userId: string, currentStatus: boolean) {
        const { error } = await supabase
            .from('users')
            .update({ is_active: !currentStatus })
            .eq('id', userId)

        if (error) {
            toast.error('حدث خطأ أثناء تعديل حالة المستخدم')
            return
        }

        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u))
        toast.success(!currentStatus ? 'تم تفعيل حساب المستخدم' : 'تم إيقاف حساب المستخدم')
    }

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
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
                        إدارة المستخدمين
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                        التحكم بجميع حسابات المنصة وإدارة الصلاحيات الخاصة بهم
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الإيميل..."
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
                            <th style={{ padding: '16px 20px', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>المستخدم</th>
                            <th style={{ padding: '16px 20px', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>تاريخ التسجيل</th>
                            <th style={{ padding: '16px 20px', textAlign: 'right', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>الصلاحية</th>
                            <th style={{ padding: '16px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>الوصول (نشط)</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 13 }}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                                    لا يوجد مستخدمين مطابقين للبحث
                                </td>
                            </tr>
                        ) : (
                            filtered.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #EF4444, #EC4899)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: 'white', fontSize: 14 }}>{user.name}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Mail size={10} /> {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Phone size={10} /> {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Calendar size={14} color="rgba(255,255,255,0.4)" />
                                            {new Date(user.created_at).toLocaleDateString('ar-JO')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <select
                                            className="form-control"
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            style={{
                                                padding: '6px 12px',
                                                height: 'auto',
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: user.role === 'admin' ? '#EF4444' : user.role === 'vendor' ? '#10B981' : 'white',
                                                background: user.role === 'admin' ? 'rgba(239,68,68,0.1)' : user.role === 'vendor' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                                                border: 'none',
                                                width: 130
                                            }}
                                        >
                                            <option value="admin" style={{ color: 'black' }}>مدير نظام (Admin)</option>
                                            <option value="vendor" style={{ color: 'black' }}>تاجر (Vendor)</option>
                                            <option value="customer" style={{ color: 'black' }}>مشتري (Customer)</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                        <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={user.is_active}
                                                onChange={() => handleToggleActive(user.id, user.is_active)}
                                                style={{ width: 18, height: 18, accentColor: '#10B981' }}
                                            />
                                        </label>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'left' }}>
                                        <button
                                            className="btn btn-sm"
                                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: 'none', padding: 8 }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
