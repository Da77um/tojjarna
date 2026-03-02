'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Upload, Plus, Trash2, Sparkles, Package, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Variant { name: string; price: string; stock: string }

export default function NewProductPage() {
    const router = useRouter()
    const supabase = createClient()
    const [nameAr, setNameAr] = useState('')
    const [nameEn, setNameEn] = useState('')
    const [descAr, setDescAr] = useState('')
    const [price, setPrice] = useState('')
    const [comparePrice, setComparePrice] = useState('')
    const [stock, setStock] = useState('')
    const [sku, setSku] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [isFeatured, setIsFeatured] = useState(false)
    const [variants, setVariants] = useState<Variant[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [generatingAI, setGeneratingAI] = useState(false)
    const [saving, setSaving] = useState(false)
    const [storeId, setStoreId] = useState<string | null>(null)

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Get vendor's store
            const { data: stores } = await supabase
                .from('stores')
                .select('id')
                .eq('user_id', user.id)
                .limit(1)

            if (stores && stores.length > 0) {
                setStoreId(stores[0].id)
            }

            // Get categories
            const { data: cats } = await supabase
                .from('categories')
                .select('*')
                .order('name_ar')

            if (cats) setCategories(cats)
        }
        init()
    }, [supabase, router])

    const addVariant = () => setVariants([...variants, { name: '', price: '', stock: '' }])
    const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i))
    const updateVariant = (i: number, field: keyof Variant, val: string) => {
        const v = [...variants]
        v[i][field] = val
        setVariants(v)
    }

    const generateDesc = async () => {
        if (!nameAr) return
        setGeneratingAI(true)
        await new Promise((r) => setTimeout(r, 1500))
        setDescAr(`${nameAr} — منتج عالي الجودة مصنوع من أجود الخامات، مثالي للاستخدام اليومي. يتميز بتصميم أنيق وعصري يناسب جميع الأذواق. متوفر الآن في متجرنا بسعر تنافسي مع ضمان جودة المنتج وسهولة الإرجاع.`)
        setGeneratingAI(false)
    }

    const handleSave = async () => {
        if (!nameAr || !price || !storeId) {
            toast.error('يرجى ملء جميع الحقول المطلوبة (الاسم، السعر)')
            return
        }

        setSaving(true)
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    store_id: storeId,
                    name_ar: nameAr,
                    name_en: nameEn,
                    description_ar: descAr,
                    price: parseFloat(price),
                    compare_price: comparePrice ? parseFloat(comparePrice) : null,
                    stock: parseInt(stock) || 0,
                    sku: sku,
                    category_id: categoryId || null,
                    is_active: isActive,
                    is_featured: isFeatured,
                }])
                .select()

            if (error) throw error

            toast.success('تم حفظ المنتج بنجاح!')
            router.push('/dashboard/products')
        } catch (err: any) {
            console.error('Error saving product:', err)
            toast.error(`خطأ في حفظ المنتج: ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link
                        href="/dashboard/products"
                        style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}
                    >
                        <ArrowRight size={18} />
                    </Link>
                    <div>
                        <h1 className="page-title">إضافة منتج جديد</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>أضف منتجاً جديداً إلى متجرك</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost" onClick={() => setIsActive(!isActive)}>
                        {isActive ? '👁️ مرئي' : '🙈 مخفي'}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        <Save size={16} />
                        {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Basic Info */}
                    <div className="card card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>معلومات المنتج</h3>
                        <div className="form-group">
                            <label className="form-label">اسم المنتج (عربي) *</label>
                            <input className="form-control" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: قميص قطني أبيض" />
                        </div>
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label className="form-label">اسم المنتج (إنجليزي)</label>
                            <input className="form-control" value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. White Cotton T-Shirt" dir="ltr" />
                        </div>

                        {/* Description with AI */}
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <label className="form-label" style={{ margin: 0 }}>وصف المنتج</label>
                                <button
                                    onClick={generateDesc}
                                    disabled={generatingAI || !nameAr}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700,
                                        color: 'var(--primary)', background: 'rgba(108,60,225,0.08)', border: '1px solid rgba(108,60,225,0.2)',
                                        borderRadius: 8, padding: '5px 12px', cursor: nameAr ? 'pointer' : 'not-allowed', opacity: nameAr ? 1 : 0.4,
                                    }}
                                >
                                    <Sparkles size={13} />
                                    {generatingAI ? 'جاري الكتابة...' : 'اكتب بالذكاء الاصطناعي'}
                                </button>
                            </div>
                            <textarea
                                className="form-control"
                                rows={4}
                                value={descAr}
                                onChange={(e) => setDescAr(e.target.value)}
                                placeholder="وصف تفصيلي للمنتج..."
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="card card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>صور المنتج</h3>
                        <div
                            style={{
                                border: '2px dashed var(--border)', borderRadius: 12, padding: 40, textAlign: 'center',
                                background: 'var(--surface-2)', cursor: 'pointer', transition: 'border-color 0.2s ease',
                            }}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>اسحب الصور هنا أو اضغط للرفع</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PNG, JPG, WebP — حتى 5 ميجابايت لكل صورة</div>
                            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, border: '1px solid var(--border)' }}>
                                <Upload size={14} /> اختر صوراً
                            </button>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="card card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 15 }}>المتغيرات (مقاسات، ألوان...)</h3>
                            <button className="btn btn-ghost btn-sm" onClick={addVariant} style={{ border: '1px solid var(--border)' }}>
                                <Plus size={14} /> إضافة متغير
                            </button>
                        </div>
                        {variants.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                                لا توجد متغيرات — المنتج بمقاس أو لون واحد
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {variants.map((v, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 36px', gap: 10, alignItems: 'center' }}>
                                        <input className="form-control" placeholder="مثال: أزرق - L" value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} />
                                        <input className="form-control" placeholder="السعر" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} type="number" />
                                        <input className="form-control" placeholder="المخزون" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} type="number" />
                                        <button onClick={() => removeVariant(i)} style={{ width: 36, height: 36, background: '#FEE2E2', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={14} color="#EF4444" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Pricing */}
                    <div className="card card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>السعر والمخزون</h3>
                        <div className="form-group">
                            <label className="form-label">السعر (د.أ) *</label>
                            <input className="form-control" type="number" step="0.001" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.000" />
                        </div>
                        <div className="form-group" style={{ marginTop: 12 }}>
                            <label className="form-label">السعر قبل الخصم</label>
                            <input className="form-control" type="number" step="0.001" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="0.000" />
                            {comparePrice && price && Number(comparePrice) > Number(price) && (
                                <div style={{ fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: 600 }}>
                                    خصم {((1 - Number(price) / Number(comparePrice)) * 100).toFixed(0)}%
                                </div>
                            )}
                        </div>
                        <div className="form-group" style={{ marginTop: 12 }}>
                            <label className="form-label">الكمية في المخزون</label>
                            <input className="form-control" type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
                        </div>
                        <div className="form-group" style={{ marginTop: 12 }}>
                            <label className="form-label">كود المنتج (SKU)</label>
                            <input className="form-control" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="مثال: SKU-001" dir="ltr" />
                        </div>
                    </div>

                    {/* Category & Options */}
                    <div className="card card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>التصنيف والخيارات</h3>
                        <div className="form-group">
                            <label className="form-label">التصنيف</label>
                            <select
                                className="form-control"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                <option value="">اختر تصنيفاً...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name_ar}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {/* Toggle: Featured */}
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>منتج مميز</span>
                                <div
                                    onClick={() => setIsFeatured(!isFeatured)}
                                    style={{
                                        width: 44, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                                        background: isFeatured ? 'var(--primary)' : 'var(--border)',
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: 'white',
                                        transition: 'right 0.2s', right: isFeatured ? 3 : 23,
                                    }} />
                                </div>
                            </label>
                            {/* Toggle: Active */}
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>مرئي للعملاء</span>
                                <div
                                    onClick={() => setIsActive(!isActive)}
                                    style={{
                                        width: 44, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                                        background: isActive ? 'var(--primary)' : 'var(--border)',
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: 'white',
                                        transition: 'right 0.2s', right: isActive ? 3 : 23,
                                    }} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Tip box */}
                    <div style={{ background: 'rgba(108,60,225,0.06)', border: '1px solid rgba(108,60,225,0.15)', borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <Package size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', marginBottom: 4 }}>نصيحة</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                    المنتجات ذات الصور الجيدة والأوصاف التفصيلية تحقق مبيعات أعلى بنسبة 40%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
