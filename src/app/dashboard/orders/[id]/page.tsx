'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Printer, CheckCircle, Truck, XCircle, Clock, MapPin, Phone, User, Package, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const statusConfig = {
    pending: { label: 'قيد الانتظار', color: '#F59E0B', bg: '#FEF3C7', Icon: Clock },
    processing: { label: 'قيد المعالجة', color: '#3B82F6', bg: '#DBEAFE', Icon: Clock },
    shipped: { label: 'تم الشحن', color: '#8B5CF6', bg: '#EDE9FE', Icon: Truck },
    delivered: { label: 'تم التسليم', color: '#10B981', bg: '#D1FAE5', Icon: CheckCircle },
    cancelled: { label: 'ملغي', color: '#EF4444', bg: '#FEE2E2', Icon: XCircle },
    refunded: { label: 'مسترجع', color: '#6B7280', bg: '#F3F4F6', Icon: XCircle },
}

export default function OrderDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [order, setOrder] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        async function fetchOrder() {
            try {
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (orderError) throw orderError
                setOrder(orderData)

                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*, products(name_ar)')
                    .eq('order_id', id)

                if (itemsError) throw itemsError
                setItems(itemsData || [])
            } catch (err) {
                console.error('Error fetching order:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [id, supabase])

    async function updateStatus(newStatus: string) {
        setUpdating(true)
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error
            setOrder({ ...order, status: newStatus })
            toast.success('تم تحديث حالة الطلب بنجاح')
        } catch (err) {
            console.error('Error updating status:', err)
            toast.error('حدث خطأ أثناء تحديث حالة الطلب')
        } finally {
            setUpdating(false)
        }
    }

    if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
    if (!order) return <div style={{ padding: 100, textAlign: 'center' }}>الطلب غير موجود</div>

    const s = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
    const StatusIcon = s.Icon

    return (
        <div className="page-container">
            <div style={{ marginBottom: 20 }}>
                <Link href="/dashboard/orders" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>
                    <ArrowRight size={16} /> العودة للطلبات
                </Link>
            </div>

            <div className="page-header">
                <div>
                    <h1 className="page-title">طلب #{order.order_number || order.id.slice(0, 8)}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        {new Date(order.created_at).toLocaleString('ar-JO')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost" onClick={() => window.print()}>
                        <Printer size={16} /> طباعة
                    </button>
                    <select
                        className="form-control"
                        style={{ width: 'auto', fontWeight: 700 }}
                        value={order.status}
                        onChange={(e) => updateStatus(e.target.value)}
                        disabled={updating}
                    >
                        {Object.entries(statusConfig).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* Left: Items & Payment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card">
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>منتجات الطلب</h3>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'right', padding: '12px 24px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)' }}>المنتج</th>
                                    <th style={{ textAlign: 'center', padding: '12px 24px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)' }}>الكمية</th>
                                    <th style={{ textAlign: 'right', padding: '12px 24px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)' }}>السعر</th>
                                    <th style={{ textAlign: 'right', padding: '12px 24px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--text-secondary)' }}>الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                                        <td style={{ padding: '14px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Package size={20} color="var(--text-muted)" />
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.products?.name_ar || 'منتج محذوف'}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 24px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                                        <td style={{ padding: '14px 24px' }}>{Number(item.unit_price).toFixed(2)} د.أ</td>
                                        <td style={{ padding: '14px 24px', fontWeight: 700 }}>{Number(item.total_price).toFixed(2)} د.أ</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ padding: '20px 24px', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>المجموع الفرعي</span>
                                <span style={{ fontWeight: 600 }}>{(Number(order.total) - Number(order.shipping_cost || 0)).toFixed(2)} د.أ</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                <span style={{ color: 'var(--text-secondary)' }}>التوصيل</span>
                                <span style={{ fontWeight: 600 }}>{Number(order.shipping_cost || 0).toFixed(2)} د.أ</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, marginTop: 8, borderTop: '1.5px solid var(--border)', paddingTop: 12 }}>
                                <span style={{ fontWeight: 800 }}>الإجمالي</span>
                                <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{Number(order.total).toFixed(2)} د.أ</span>
                            </div>
                        </div>
                    </div>

                    <div className="card card-body">
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>معلومات الدفع</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 13, background: order.payment_method === 'cod' ? '#FEF3C7' : '#DBEAFE', color: order.payment_method === 'cod' ? '#92400E' : '#1D4ED8', padding: '6px 12px', borderRadius: 8, fontWeight: 700 }}>
                                {order.payment_method === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة ائتمانية'}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>الحالة: {order.payment_status === 'paid' ? 'تم الدفع' : 'بانتظار الدفع'}</div>
                        </div>
                    </div>
                </div>

                {/* Right: Customer Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card card-body">
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>العميل</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={24} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{order.customer_name}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', direction: 'ltr', textAlign: 'right' }}>{order.customer_phone}</div>
                            </div>
                        </div>
                        {order.customer_email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                                <Mail size={16} color="var(--text-muted)" /> {order.customer_email}
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                            <Phone size={16} color="var(--text-muted)" /> {order.customer_phone}
                        </div>
                    </div>

                    <div className="card card-body">
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>عنوان التوصيل</h3>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <MapPin size={18} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <div style={{ fontSize: 14 }}>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>{order.shipping_address?.city || 'غير محدد'}</div>
                                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {order.shipping_address?.area}<br />
                                    {order.shipping_address?.street}, بناء {order.shipping_address?.building}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
