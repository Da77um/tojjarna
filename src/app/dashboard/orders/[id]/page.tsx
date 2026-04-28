'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, ArrowLeft, Printer, CheckCircle, Truck, XCircle,
  Clock, MapPin, Phone, User, Package, Mail, RotateCcw, RefreshCw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  pending:    { label: 'قيد الانتظار', color: '#D97706', bg: '#FEF3C7', Icon: Clock },
  processing: { label: 'قيد المعالجة', color: '#2563EB', bg: '#DBEAFE', Icon: RefreshCw },
  shipped:    { label: 'تم الشحن',     color: '#6C3CE1', bg: '#EDE9FB', Icon: Truck },
  delivered:  { label: 'تم التوصيل',  color: '#16A34A', bg: '#DCFCE7', Icon: CheckCircle },
  cancelled:  { label: 'ملغي',        color: '#DC2626', bg: '#FEE2E2', Icon: XCircle },
  refunded:   { label: 'مرتجع',       color: '#6B7280', bg: '#F3F4F6', Icon: RotateCcw },
}

const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const { id } = useParams()
  const { dir } = useLanguage()
  const supabase = createClient()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [tracking, setTracking] = useState('')

  const BackArrow = dir === 'rtl' ? ArrowLeft : ArrowRight

  useEffect(() => {
    async function fetchOrder() {
      try {
        const [orderRes, itemsRes] = await Promise.all([
          supabase.from('orders').select('*').eq('id', id).single(),
          supabase.from('order_items').select('*, products(name_ar, images)').eq('order_id', id),
        ])
        if (orderRes.data) {
          setOrder(orderRes.data)
          setTracking(orderRes.data.tracking_number || '')
        }
        setItems(itemsRes.data || [])
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchOrder()
  }, [id])

  async function updateStatus(newStatus: string) {
    setUpdating(true)
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    if (error) { toast.error('فشل تحديث الحالة'); setUpdating(false); return }
    setOrder((o: any) => ({ ...o, status: newStatus }))
    toast.success('تم تحديث حالة الطلب')
    setUpdating(false)
  }

  async function saveTracking() {
    const { error } = await supabase.from('orders').update({ tracking_number: tracking }).eq('id', id)
    if (error) toast.error('فشل الحفظ')
    else toast.success('تم حفظ رقم التتبع')
  }

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div className="spinner" />
    </div>
  )
  if (!order) return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
      <Package size={48} color="#E5E7EB" style={{ margin: '0 auto 16px' }} />
      <p style={{ color: '#9CA3AF' }}>الطلب غير موجود</p>
      <Link href="/dashboard/orders" style={{ color: '#6C3CE1', fontWeight: 600, fontSize: 14 }}>العودة للطلبات</Link>
    </div>
  )

  const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const StatusIcon = s.Icon
  const currentStepIdx = STATUS_FLOW.indexOf(order.status)
  const subtotal = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
  const shipping = Number(order.shipping_cost || 0)
  const discount = Number(order.discount_amount || 0)

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 1100 }}>

      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Link href="/dashboard/orders"
          style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0, background: '#fff', textDecoration: 'none' }}>
          <BackArrow size={16} />
        </Link>
        <div>
          <h1 className="page-title" style={{ fontSize: 22 }}>طلب #{order.order_number || order.id.slice(0, 8).toUpperCase()}</h1>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
            {new Date(order.created_at).toLocaleString('ar-JO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: s.bg, color: s.color, borderRadius: 20, padding: '6px 14px', fontWeight: 700, fontSize: 13 }}>
            <StatusIcon size={14} />
            {s.label}
          </div>
          <button onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Printer size={14} /> طباعة
          </button>
        </div>
      </div>

      {/* Status timeline (for non-cancelled/refunded) */}
      {!['cancelled', 'refunded'].includes(order.status) && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 20, overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 400 }}>
            {STATUS_FLOW.map((step, idx) => {
              const sc = STATUS_CONFIG[step]
              const StepIcon = sc.Icon
              const done = idx <= currentStepIdx
              const active = idx === currentStepIdx
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: idx < STATUS_FLOW.length - 1 ? 1 : undefined }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? '#6C3CE1' : '#F1F2F6',
                      color: done ? '#fff' : '#9CA3AF',
                      boxShadow: active ? '0 0 0 4px rgba(108,60,225,0.15)' : 'none',
                      transition: 'all 0.2s',
                    }}>
                      <StepIcon size={16} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: done ? '#6C3CE1' : '#9CA3AF', whiteSpace: 'nowrap' }}>
                      {sc.label}
                    </span>
                  </div>
                  {idx < STATUS_FLOW.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: idx < currentStepIdx ? '#6C3CE1' : '#E5E7EB', margin: '0 6px', marginBottom: 22, transition: 'all 0.3s' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Order items */}
          <div className="card">
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #F1F2F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>منتجات الطلب</h3>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{items.length} منتج</span>
            </div>
            <div>
              {items.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < items.length - 1 ? '1px solid #F7F8FA' : 'none' }}>
                  {item.products?.images?.[0] ? (
                    <img src={item.products.images[0]} alt="" style={{ width: 50, height: 50, borderRadius: 9, objectFit: 'cover', border: '1px solid #E5E7EB', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 50, height: 50, borderRadius: 9, background: '#F1F2F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package size={20} color="#9CA3AF" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.products?.name_ar || item.product_name || 'منتج محذوف'}</div>
                    {item.variant_name && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.variant_name}</div>}
                  </div>
                  <div style={{ textAlign: 'end', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, color: '#9CA3AF' }}>{Number(item.unit_price).toFixed(2)} × {item.quantity}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{Number(item.total_price).toFixed(2)} <span style={{ fontSize: 11, color: '#9CA3AF' }}>د.أ</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div style={{ padding: '16px 20px', background: '#F7F8FA', borderTop: '1px solid #F1F2F6' }}>
              {[
                { label: 'المجموع الفرعي', value: subtotal },
                { label: 'التوصيل', value: shipping },
                ...(discount > 0 ? [{ label: 'الخصم', value: -discount }] : []),
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
                  <span>{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.value < 0 ? '#16A34A' : '#374151' }}>
                    {row.value < 0 ? '-' : ''}{Math.abs(row.value).toFixed(2)} د.أ
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#0F172A', borderTop: '1.5px solid #E5E7EB', paddingTop: 12, marginTop: 4 }}>
                <span>الإجمالي</span>
                <span style={{ color: '#6C3CE1' }}>{Number(order.total).toFixed(2)} د.أ</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>معلومات الدفع</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{
                fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 8,
                background: order.payment_method === 'cod' ? '#FEF3C7' : '#DBEAFE',
                color: order.payment_method === 'cod' ? '#92400E' : '#1E40AF',
              }}>
                {order.payment_method === 'cod' ? 'الدفع عند الاستلام' : order.payment_method === 'card' ? 'بطاقة ائتمانية' : order.payment_method || 'غير محدد'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: order.payment_status === 'paid' ? '#16A34A' : '#D97706',
                }} />
                <span style={{ color: '#374151', fontWeight: 600 }}>
                  {order.payment_status === 'paid' ? 'مدفوع' : 'بانتظار الدفع'}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>رقم التتبع</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="أدخل رقم تتبع الشحنة..."
                style={{ flex: 1, padding: '9px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', direction: 'ltr', textAlign: 'start' }}
                onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
              />
              <button onClick={saveTracking}
                style={{ padding: '9px 18px', borderRadius: 9, background: '#6C3CE1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
                حفظ
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Customer info */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>معلومات العميل</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C3CE1', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                {(order.customer_name || order.customer_phone || '؟')[0]}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{order.customer_name || 'زائر'}</div>
                {order.customer_phone && <div style={{ fontSize: 12, color: '#9CA3AF', direction: 'ltr', textAlign: 'start' }}>{order.customer_phone}</div>}
              </div>
            </div>
            {[
              order.customer_phone && { icon: Phone, label: order.customer_phone },
              order.customer_email && { icon: Mail, label: order.customer_email },
            ].filter(Boolean).map((row: any) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151', marginBottom: 10 }}>
                <row.icon size={14} color="#9CA3AF" />
                <span>{row.label}</span>
              </div>
            ))}
          </div>

          {/* Shipping address */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>عنوان التوصيل</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <MapPin size={16} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 3 }} />
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>{order.shipping_address?.city || order.customer_city || 'غير محدد'}</div>
                {order.shipping_address?.area && <div>{order.shipping_address.area}</div>}
                {order.shipping_address?.street && <div>{order.shipping_address.street}</div>}
                {order.notes && <div style={{ marginTop: 8, padding: '8px 10px', background: '#FEF3C7', borderRadius: 7, fontSize: 12, color: '#92400E' }}>ملاحظة: {order.notes}</div>}
              </div>
            </div>
          </div>

          {/* Update status */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>تحديث الحالة</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const isActive = order.status === key
                const Icon = cfg.Icon
                return (
                  <button key={key} onClick={() => !isActive && updateStatus(key)} disabled={updating || isActive}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9,
                      border: isActive ? `2px solid ${cfg.color}` : '1.5px solid #E5E7EB',
                      background: isActive ? cfg.bg : '#fff',
                      color: isActive ? cfg.color : '#374151',
                      cursor: isActive ? 'default' : 'pointer',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13,
                      transition: 'all 0.15s',
                    }}>
                    <Icon size={14} />
                    {cfg.label}
                    {isActive && <span style={{ marginInlineStart: 'auto', fontSize: 10, fontWeight: 700, background: cfg.color, color: '#fff', padding: '2px 8px', borderRadius: 20 }}>الحالي</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
