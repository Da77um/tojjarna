'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Upload, Plus, Trash2, Sparkles, Package, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import CategorySelector, { CategoryItem } from '@/components/CategorySelector'

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
    const [categoryLabel, setCategoryLabel] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [isFeatured, setIsFeatured] = useState(false)
    const [variants, setVariants] = useState<Variant[]>([])
    const [categories, setCategories] = useState<CategoryItem[]>([])
    const [generatingAI, setGeneratingAI] = useState(false)
    const [saving, setSaving] = useState(false)
    const [storeId, setStoreId] = useState<string | null>(null)

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const { data: stores } = await supabase
                .from('stores').select('id, plans(max_products)').eq('user_id', user.id).limit(1)

            if (stores && stores.length > 0) {
                const currentStoreId = stores[0].id
                setStoreId(currentStoreId)
                const maxLimit = (stores[0].plans as any)?.max_products ?? null
                if (maxLimit !== null) {
                    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', currentStoreId)
                    if (count !== null && count >= maxLimit) {
                        toast.error('لقد وصلت للحد الأقصى للمنتجات المسموح بها في باقتك.')
                        router.push('/dashboard/products')
                        return
                    }
                }
            }

            const { data: cats } = await supabase.from('categories').select('*').order('name_ar')
            if (cats) setCategories(cats as CategoryItem[])
        }
        init()
    }, [supabase, router])

    const addVariant = () => setVariants([...variants, { name: '', price: '', stock: '' }])
    const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i))
    const updateVariant = (i: number, field: keyof Variant, val: string) => {
        const v = [...variants]; v[i][field] = val; setVariants(v)
    }

    const generateDesc = async () => {
        if (!nameAr) return
        setGeneratingAI(true)
        await new Promise((r) => setTimeout(r, 1500))
        setDescAr(`${nameAr} — منتج عالي الجودة مصنوع من أجود الخامات، مثالي للاستخدام اليومي. يتميز بتصميم أنيق وعصري يناسب جميع الأذواق.`)
        setGeneratingAI(false)
    }

    const handleSave = async () => {
        if (!nameAr || !price || !storeId) { toast.error('يرجى ملء الاسم والسعر'); return }
        setSaving(true)
        try {
            const { error } = await supabase.from('products').insert([{
                store_id: storeId, name_ar: nameAr, name_en: nameEn, description_ar: descAr,
                price: parseFloat(price), compare_price: comparePrice ? parseFloat(comparePrice) : null,
                stock: parseInt(stock) || 0, sku, category_id: categoryId || null,
                is_active: isActive, is_featured: isFeatured,
            }]).select()
            if (error) throw error
            toast.success('تم حفظ المنتج بنجاح!')
            router.push('/dashboard/products')
        } catch (err: any) {
            toast.error(`خطأ في حفظ المنتج: ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="page-container" dir="rtl">
            {/* Header */}
            <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/dashboard/products" style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #E0D6C8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6058', flexShrink: 0 }}>
                        <ArrowRight size={18} />
                    </Link>
                    <div>
                        <h1 className="page-title">إضافة منتج جديد</h1>
                        <p style={{ color: '#6B6058', fontSize: 13, marginTop: 2 }}>أضف منتجاً جديداً إلى متجرك</p>
                    </div>
                </div>
                <div className="hide-on-mobile" style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost" onClick={() => setIsActive(!isActive)} style={{ border: '1px solid #E0D6C8' }}>
                        {isActive ? '👁️ مرئي' : '🙈 مخفي'}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        <Save size={16} /> {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
                    </button>
                </div>
            </div>

            {/* Responsive 2-col → 1-col on mobile */}
            <div className="product-form-grid">
                {/* ── Main column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Basic Info */}
                    <div className="card card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15 }}>معلومات المنتج</h3>
                        <div className="form-group">
                            <label className="form-label">اسم المنتج (عربي) *</label>
                            <input className="form-control" value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="مثال: قميص قطني أبيض" />
                        </div>
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label className="form-label">اسم المنتج (إنجليزي)</label>
                            <input className="form-control" value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="e.g. White Cotton T-Shirt" dir="ltr" />
                        </div>
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                                <label className="form-label" style={{ margin: 0 }}>وصف المنتج</label>
                                <button onClick={generateDesc} disabled={generatingAI || !nameAr}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#C6A75E', background: 'rgba(198,167,94,0.08)', border: '1px solid rgba(198,167,94,0.3)', borderRadius: 8, padding: '5px 12px', cursor: nameAr ? 'pointer' : 'not-allowed', opacity: nameAr ? 1 : 0.4 }}>
                                    <Sparkles size={13} /> {generatingAI ? 'جاري الكتابة...' : 'اكتب بالذكاء الاصطناعي'}
                                </button>
                            </div>
                            <textarea className="form-control" rows={4} value={descAr} onChange={e => setDescAr(e.target.value)} placeholder="وصف تفصيلي للمنتج..." style={{ resize: 'vertical' }} />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="card card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>صور المنتج</h3>
                        <div style={{ border: '2px dashed #E0D6C8', borderRadius: 12, padding: '32px 20px', textAlign: 'center', background: '#F9F5EF', cursor: 'pointer' }} onDragOver={e => e.preventDefault()}>
                            <Upload size={32} color="#A09080" style={{ margin: '0 auto 12px' }} />
                            <div style={{ fontWeight: 600, color: '#6B6058', marginBottom: 6 }}>اسحب الصور هنا أو اضغط للرفع</div>
                            <div style={{ fontSize: 12, color: '#A09080' }}>PNG, JPG, WebP — حتى 5 ميجابايت</div>
                            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, border: '1px solid #E0D6C8' }}>
                                <Upload size={14} /> اختر صوراً
                            </button>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="card card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 15 }}>المتغيرات (مقاسات، ألوان...)</h3>
                            <button className="btn btn-ghost btn-sm" onClick={addVariant} style={{ border: '1px solid #E0D6C8' }}>
                                <Plus size={14} /> إضافة متغير
                            </button>
                        </div>
                        {variants.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: '#A09080', fontSize: 14 }}>لا توجد متغيرات — المنتج بمقاس أو لون واحد</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {variants.map((v, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 40px', gap: 8, alignItems: 'center' }}>
                                        <input className="form-control" placeholder="مثال: أزرق - L" value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} />
                                        <input className="form-control" placeholder="السعر" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} type="number" />
                                        <input className="form-control" placeholder="المخزون" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} type="number" />
                                        <button onClick={() => removeVariant(i)} style={{ width: 40, height: 40, background: '#FEE2E2', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={14} color="#B91C1C" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Sidebar column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Pricing */}
                    <div className="card card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>السعر والمخزون</h3>
                        <div className="form-group">
                            <label className="form-label">السعر (د.أ) *</label>
                            <input className="form-control" type="number" step="0.001" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.000" />
                        </div>
                        <div className="form-group" style={{ marginTop: 12 }}>
                            <label className="form-label">السعر قبل الخصم</label>
                            <input className="form-control" type="number" step="0.001" value={comparePrice} onChange={e => setComparePrice(e.target.value)} placeholder="0.000" />
                            {comparePrice && price && Number(comparePrice) > Number(price) && (
                                <div style={{ fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: 600 }}>
                                    خصم {((1 - Number(price) / Number(comparePrice)) * 100).toFixed(0)}%
                                </div>
                            )}
                        </div>
                        <div className="form-group" style={{ marginTop: 12 }}>
                            <label className="form-label">الكمية في المخزون</label>
                            <input className="form-control" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" />
                        </div>
                        <div className="form-group" style={{ marginTop: 12 }}>
                            <label className="form-label">كود المنتج (SKU)</label>
                            <input className="form-control" value={sku} onChange={e => setSku(e.target.value)} placeholder="مثال: SKU-001" dir="ltr" />
                        </div>
                    </div>

                    {/* Category & Options */}
                    <div className="card card-body">
                        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>التصنيف والخيارات</h3>
                        <div className="form-group">
                            <label className="form-label">التصنيف</label>
                            <CategorySelector categories={categories} value={categoryId} onChange={(id, label) => { setCategoryId(id); setCategoryLabel(label) }} placeholder="اختر تصنيف المنتج..." />
                        </div>
                        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', minHeight: 52, padding: '4px 0', borderBottom: '1px solid #F0EBE3' }}>
                                <span style={{ fontSize: 15, color: '#222', fontWeight: 500 }}>منتج مميز ⭐</span>
                                <div onClick={() => setIsFeatured(!isFeatured)} style={{ width: 48, height: 28, borderRadius: 14, position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0, background: isFeatured ? '#C6A75E' : '#D4C8BB' }}>
                                    <div style={{ position: 'absolute', top: 4, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'right 0.25s', right: isFeatured ? 4 : 24, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                                </div>
                            </label>
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', minHeight: 52, padding: '4px 0' }}>
                                <span style={{ fontSize: 15, color: '#222', fontWeight: 500 }}>مرئي للعملاء 👁️</span>
                                <div onClick={() => setIsActive(!isActive)} style={{ width: 48, height: 28, borderRadius: 14, position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0, background: isActive ? '#C6A75E' : '#D4C8BB' }}>
                                    <div style={{ position: 'absolute', top: 4, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'right 0.25s', right: isActive ? 4 : 24, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Tip */}
                    <div style={{ background: '#FDF8F0', border: '1px solid #E8D9BC', borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <Package size={18} color="#C6A75E" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: '#7A5C20', marginBottom: 4 }}>نصيحة</div>
                                <div style={{ fontSize: 12, color: '#6B6058', lineHeight: 1.7 }}>المنتجات ذات الصور الجيدة والأوصاف التفصيلية تحقق مبيعات أعلى بنسبة 40%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky save bar on mobile */}
            <div className="mobile-save-bar">
                <button className="btn btn-ghost" onClick={() => setIsActive(!isActive)} style={{ border: '1px solid #E0D6C8', minWidth: 90 }}>
                    {isActive ? '👁️ مرئي' : '🙈 مخفي'}
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                    <Save size={16} /> {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
            </div>
        </div>
    )
}
