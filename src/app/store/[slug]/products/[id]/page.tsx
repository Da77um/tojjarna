'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { Star, ShoppingCart, Heart, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

const product = {
    id: 1,
    name: 'قميص قطني أبيض',
    nameEn: 'White Cotton T-Shirt',
    price: 12.5,
    comparePrice: 18.0,
    description: 'قميص قطني عالي الجودة مصنوع من أجود أقطان قصر الأزياء. ناعم على البشرة، سهل العناية، مثالي للاستخدام اليومي.',
    rating: 4.7,
    reviewCount: 34,
    stock: 45,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#FFFFFF', '#111827', '#3B82F6', '#10B981', '#EF4444'],
    images: ['🧥', '👕', '👔'],
}

const reviews = [
    { name: 'سارة م.', rating: 5, comment: 'ممتاز! الجودة أفضل من المتوقع وشحن سريع جداً', date: '2025-02-20' },
    { name: 'أحمد ك.', rating: 4, comment: 'منتج جيد ولكن المقاس كان أكبر قليلاً من المعتاد', date: '2025-02-18' },
    { name: 'نور ع.', rating: 5, comment: 'رائع! سأعيد الطلب مرة أخرى بالتأكيد', date: '2025-02-15' },
]

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const unwrappedParams = use(params)
    const slug = unwrappedParams.slug
    const [selectedSize, setSelectedSize] = useState('M')
    const [selectedColor, setSelectedColor] = useState('#FFFFFF')
    const [qty, setQty] = useState(1)
    const [activeImg, setActiveImg] = useState(0)
    const [wished, setWished] = useState(false)

    const primaryColor = '#6C3CE1'

    return (
        <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Tajawal, sans-serif' }}>
            {/* Breadcrumb header */}
            <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '14px 0' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
                    <Link href={`/store/${slug}`} style={{ color: primaryColor, fontWeight: 600, textDecoration: 'none' }}>المتجر</Link>
                    <ChevronRight size={14} />
                    <span>ملابس</span>
                    <ChevronRight size={14} />
                    <span style={{ color: '#374151', fontWeight: 600 }}>{product.name}</span>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
                    {/* Images */}
                    <div>
                        <div style={{ height: 420, background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, marginBottom: 16 }}>
                            {product.images[activeImg]}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {product.images.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    style={{
                                        width: 80, height: 80, borderRadius: 12, border: `2px solid ${activeImg === i ? primaryColor : '#E5E7EB'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, cursor: 'pointer', background: 'white',
                                    }}
                                >
                                    {img}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product info */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', lineHeight: 1.3 }}>{product.name}</h1>
                            <button onClick={() => setWished(!wished)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                <Heart size={24} fill={wished ? '#EF4444' : 'none'} stroke={wished ? '#EF4444' : '#9CA3AF'} />
                            </button>
                        </div>

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 20 }}>
                            <div style={{ display: 'flex', gap: 2 }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={16} fill={s <= Math.round(product.rating) ? '#F59E0B' : '#E5E7EB'} stroke="none" />
                                ))}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{product.rating}</span>
                            <span style={{ color: '#9CA3AF', fontSize: 13 }}>({product.reviewCount} تقييم)</span>
                        </div>

                        {/* Price */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 24 }}>
                            <span style={{ fontSize: 36, fontWeight: 900, color: primaryColor }}>{product.price.toFixed(2)}</span>
                            <span style={{ fontSize: 16, fontWeight: 600, color: primaryColor }}>د.أ</span>
                            {product.comparePrice && (
                                <span style={{ fontSize: 18, color: '#9CA3AF', textDecoration: 'line-through' }}>{product.comparePrice.toFixed(2)} د.أ</span>
                            )}
                            {product.comparePrice && (
                                <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                                    وفّر {(product.comparePrice - product.price).toFixed(2)} د.أ
                                </span>
                            )}
                        </div>

                        {/* Colors */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>اللون</div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {product.colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setSelectedColor(c)}
                                        style={{
                                            width: 36, height: 36, borderRadius: '50%', background: c, border: selectedColor === c ? `3px solid ${primaryColor}` : '2px solid #E5E7EB',
                                            outline: selectedColor === c ? `2px solid ${primaryColor}` : 'none', outlineOffset: 2, cursor: 'pointer',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Sizes */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>المقاس</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                                            background: selectedSize === size ? primaryColor : 'white',
                                            color: selectedSize === size ? 'white' : '#374151',
                                            border: `2px solid ${selectedSize === size ? primaryColor : '#E5E7EB'}`,
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Qty + Add to cart */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 46, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}>−</button>
                                <span style={{ width: 40, textAlign: 'center', fontWeight: 700, fontSize: 16 }}>{qty}</span>
                                <button onClick={() => setQty(qty + 1)} style={{ width: 40, height: 46, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}>+</button>
                            </div>
                            <button
                                style={{ flex: 1, background: primaryColor, color: 'white', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}
                            >
                                <ShoppingCart size={18} />
                                أضف إلى السلة — {(product.price * qty).toFixed(2)} د.أ
                            </button>
                        </div>

                        {/* Chips */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                            {['🚚 شحن سريع 1-3 أيام', '↩️ إرجاع مجاني 7 أيام', '✅ منتج أصلي مضمون'].map((t) => (
                                <span key={t} style={{ fontSize: 12, background: '#F3F4F6', padding: '5px 12px', borderRadius: 100, color: '#374151', fontWeight: 500 }}>{t}</span>
                            ))}
                        </div>

                        {/* Description */}
                        <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 16, fontSize: 14, color: '#4B5563', lineHeight: 1.8 }}>
                            {product.description}
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                <div style={{ marginTop: 48 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24 }}>آراء العملاء ({product.reviewCount})</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {reviews.map((r, i) => (
                            <div key={i} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E5E7EB' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                                        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} size={13} fill={s <= r.rating ? '#F59E0B' : '#E5E7EB'} stroke="none" />
                                            ))}
                                        </div>
                                    </div>
                                    <span style={{ color: '#9CA3AF', fontSize: 12 }}>{r.date}</span>
                                </div>
                                <p style={{ fontSize: 14, color: '#4B5563', lineHeight: 1.7 }}>{r.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
