'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ChevronRight, ShoppingBag } from 'lucide-react'

const initialItems = [
    { id: 1, name: 'قميص قطني أبيض', variant: 'مقاس L — أبيض', price: 12.5, qty: 2, image: '👕' },
    { id: 2, name: 'عطر فرنسي', variant: 'حجم 50ml', price: 55.0, qty: 1, image: '🧴' },
]

export default function CartPage({ params }: { params: Promise<{ slug: string }> }) {
    const unwrappedParams = use(params)
    const slug = unwrappedParams.slug
    const [items, setItems] = useState(initialItems)
    const primaryColor = '#6C3CE1'

    const updateQty = (id: number, delta: number) => {
        setItems(items.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    }
    const remove = (id: number) => setItems(items.filter((i) => i.id !== id))

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const shipping = subtotal >= 50 ? 0 : 3.0
    const total = subtotal + shipping

    if (items.length === 0) return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Noto Sans Arabic, sans-serif', gap: 16, textAlign: 'center', padding: 40 }}>
            <ShoppingBag size={72} color="#D1D5DB" />
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#374151' }}>سلتك فارغة</h2>
            <p style={{ color: '#9CA3AF' }}>لم تقم بإضافة أي منتجات بعد</p>
            <Link href={`/store/${slug}`} style={{ background: primaryColor, color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
                تصفح المنتجات
            </Link>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Noto Sans Arabic, sans-serif', padding: '32px 20px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28 }}>سلة التسوق</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {items.map((item) => (
                            <div key={item.id} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E5E7EB', display: 'flex', gap: 16, alignItems: 'center' }}>
                                <div style={{ width: 72, height: 72, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
                                    {item.image}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>{item.name}</div>
                                    <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 10 }}>{item.variant}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <button onClick={() => updateQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Minus size={12} />
                                        </button>
                                        <span style={{ fontWeight: 700, width: 24, textAlign: 'center' }}>{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 900, fontSize: 16, color: primaryColor, marginBottom: 8 }}>
                                        {(item.price * item.qty).toFixed(2)} د.أ
                                    </div>
                                    <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                        <Trash2 size={14} /> حذف
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div>
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                            <div style={{ padding: '20px 20px 0', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #E5E7EB', paddingBottom: 16 }}>ملخص الطلب</div>
                            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280' }}>
                                    <span>المجموع الفرعي ({items.reduce((a, i) => a + i.qty, 0)} منتجات)</span>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>{subtotal.toFixed(2)} د.أ</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280' }}>
                                    <span>رسوم الشحن</span>
                                    <span style={{ fontWeight: 600, color: shipping === 0 ? '#10B981' : '#111827' }}>
                                        {shipping === 0 ? '🎉 مجاني' : `${shipping.toFixed(2)} د.أ`}
                                    </span>
                                </div>
                                {subtotal < 50 && (
                                    <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#065F46' }}>
                                        أضف {(50 - subtotal).toFixed(2)} د.أ للحصول على شحن مجاني 🚚
                                    </div>
                                )}
                                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 18 }}>
                                    <span>الإجمالي</span>
                                    <span style={{ color: primaryColor }}>{total.toFixed(2)} د.أ</span>
                                </div>
                                <Link
                                    href={`/store/${slug}/checkout`}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                                        background: primaryColor, color: 'white', textDecoration: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15,
                                    }}
                                >
                                    إتمام الشراء <ChevronRight size={18} />
                                </Link>
                                <Link href={`/store/${slug}`} style={{ textAlign: 'center', color: '#6B7280', fontSize: 13, textDecoration: 'none' }}>
                                    ← متابعة التسوق
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
