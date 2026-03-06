'use client'

import { useState, useEffect } from 'react'
import { Search, Users, Phone, Mail, MapPin } from 'lucide-react'
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
                const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id)
                if (!stores || stores.length === 0) return
                const { data, error } = await supabase
                    .from('customers').select('*').in('store_id', stores.map(s => s.id))
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
        <div className="page-container" dir="rtl">
            <div className="skeleton skeleton-text" style={{ width: 120, height: 22, marginBottom: 8 }} />
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-card" style={{ marginBottom: 10 }} />)}
        </div>
    )

    return (
        <div className="page-container" dir="rtl">
            <div className="page-header">
                <div>
                    <h1 className="page-title">العملاء</h1>
                    <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>{customers.length} عميل في متجرك</p>
                </div>
            </div>

            {/* Search */}
            <div className="mobile-search" style={{ marginBottom: 20 }}>
                <Search size={17} className="search-icon" />
                <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="ابحث باسم العميل أو رقم الهاتف..."
                    style={{ paddingRight: 44 }}
                />
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#A09080' }}>
                    <Users size={48} color="#D4C8BB" style={{ margin: '0 auto 16px', display: 'block' }} />
                    <h3 style={{ fontWeight: 700, color: '#6B6058', marginBottom: 6 }}>لا يوجد عملاء بعد</h3>
                    <p style={{ fontSize: 14 }}>سيظهر هنا العملاء الذين أتموا طلبات من متجرك</p>
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="card hide-on-mobile">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['العميل', 'المدينة', 'الطلبات', 'إجمالي الإنفاق', 'آخر طلب'].map(h => (
                                        <th key={h} style={{ textAlign: 'right', padding: '14px 16px', background: '#F5F0E8', fontSize: 12, color: '#6B6058', fontWeight: 700 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(customer => (
                                    <tr key={customer.id} style={{ borderTop: '1px solid #E0D6C8' }}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{customer.full_name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3 }}>
                                                <span style={{ fontSize: 11, color: '#A09080', display: 'flex', alignItems: 'center', gap: 3, direction: 'ltr' }}><Phone size={10} />{customer.phone}</span>
                                                {customer.email && <span style={{ fontSize: 11, color: '#A09080', display: 'flex', alignItems: 'center', gap: 3 }}><Mail size={10} />{customer.email}</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B6058' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} color="#A09080" />{customer.city || '—'}</div>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14 }}>{customer.total_orders || 0}</td>
                                        <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: 14, color: '#C6A75E' }}>{(customer.total_spent || 0).toFixed(2)} <span style={{ fontWeight: 500, fontSize: 11, color: '#6B6058' }}>د.أ</span></td>
                                        <td style={{ padding: '14px 16px', fontSize: 12, color: '#A09080' }}>{customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString('ar-JO') : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="show-on-mobile" style={{ flexDirection: 'column', gap: 10 }}>
                        {filtered.map(customer => (
                            <div key={customer.id} className="mobile-card">
                                {/* Avatar + name row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0EBE3', border: '1.5px solid #E0D6C8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 16, color: '#C6A75E' }}>
                                        {(customer.full_name || 'ع')[0]}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 15, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.full_name}</div>
                                        <div style={{ fontSize: 12, color: '#A09080', marginTop: 2, direction: 'ltr', textAlign: 'right' }}>{customer.phone}</div>
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: '#C6A75E', flexShrink: 0 }}>{(customer.total_spent || 0).toFixed(0)}<span style={{ fontSize: 11, fontWeight: 500, color: '#6B6058' }}> د.أ</span></div>
                                </div>

                                {/* Stats row */}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {customer.city && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B6058', background: '#F5F0E8', padding: '5px 10px', borderRadius: 8 }}>
                                            <MapPin size={11} />{customer.city}
                                        </span>
                                    )}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6B6058', background: '#F5F0E8', padding: '5px 10px', borderRadius: 8 }}>
                                        🛍️ {customer.total_orders || 0} طلب
                                    </span>
                                    {customer.last_order_at && (
                                        <span style={{ fontSize: 11, color: '#A09080', padding: '5px 0', marginRight: 'auto' }}>
                                            {new Date(customer.last_order_at).toLocaleDateString('ar-JO')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
