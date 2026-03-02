'use client'

import { useState, useEffect } from 'react'
import { Search, Users, ExternalLink, MapPin, Phone, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CustomersPage() {
    const supabase = createClient()
    const [search, setSearch] = useState('')
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCustomers() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: stores } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('user_id', user.id)

                if (!stores || stores.length === 0) return
                const storeIds = stores.map(s => s.id)

                const { data, error } = await supabase
                    .from('customers')
                    .select('*')
                    .in('store_id', storeIds)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setCustomers(data || [])
            } catch (err) {
                console.error('Error fetching customers:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchCustomers()
    }, [supabase])

    const filtered = customers.filter(c =>
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    )

    if (loading) return (
        <div style={{ padding: 100, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
    )

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">العملاء</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        {customers.length} عميل في متجرك
                    </p>
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
                <Search
                    size={18}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14 }}
                />
                <input
                    type="text"
                    className="form-control"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث باسم العميل أو رقم الهاتف..."
                    style={{ paddingRight: 42 }}
                />
            </div>

            {/* Customers Table */}
            <div className="card">
                {filtered.length === 0 ? (
                    <div style={{ padding: 80, textAlign: 'center' }}>
                        <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>لا يوجد عملاء بعد</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
                            سيظهر هنا العملاء الذين أتموا طلبات من متجرك
                        </p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'right', padding: '14px 20px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>العميل</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>المدينة</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>الطلبات</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>إجمالي الإنفاق</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>آخر طلب</th>
                                <th style={{ textAlign: 'right', padding: '14px 16px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((customer) => (
                                <tr key={customer.id} style={{ borderTop: '1px solid var(--border)' }}>
                                    <td style={{ padding: '14px 20px' }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                                            {customer.full_name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, direction: 'ltr' }}>
                                                <Phone size={10} /> {customer.phone}
                                            </div>
                                            {customer.email && (
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Mail size={10} /> {customer.email}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <MapPin size={14} color="var(--text-muted)" />
                                            {customer.city || '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                                        {customer.total_orders || 0}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                                        {(customer.total_spent || 0).toFixed(2)} د.أ
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                                        {customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString('ar-JO') : '-'}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <button
                                            title="عرض التفاصيل"
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                border: '1px solid var(--border)',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <ExternalLink size={14} color="var(--text-secondary)" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
