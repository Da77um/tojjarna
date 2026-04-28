'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Upload, Plus, Trash2, Sparkles, Package, Save, Eye, EyeOff, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'

interface Variant { name: string; price: string; stock: string }

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: 46, height: 26, borderRadius: 13, position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0, background: on ? '#6C3CE1' : '#D1D5DB' }}>
      <div style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.25s, right 0.25s', left: on ? 'calc(100% - 23px)' : '3px', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
    </div>
  )
}

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t, lang, dir } = useLanguage()
  const BackArrow = dir === 'rtl' ? ArrowLeft : ArrowRight

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
      if (!user) { router.push('/login'); return }
      const { data: stores } = await supabase.from('stores').select('id, plans(max_products)').eq('user_id', user.id).limit(1)
      if (stores?.length) {
        setStoreId(stores[0].id)
        const maxLimit = (stores[0] as any).plans?.max_products ?? null
        if (maxLimit !== null) {
          const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', stores[0].id)
          if (count !== null && count >= maxLimit) {
            toast.error('وصلت للحد الأقصى من المنتجات'); router.push('/dashboard/products'); return
          }
        }
      }
      const { data: cats } = await supabase.from('categories').select('*').order('name_ar')
      if (cats) setCategories(cats)
    }
    init()
  }, [])

  const addVariant = () => setVariants([...variants, { name: '', price: '', stock: '' }])
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i))
  const updateVariant = (i: number, field: keyof Variant, val: string) => {
    const v = [...variants]; v[i][field] = val; setVariants(v)
  }

  async function generateDesc() {
    if (!nameAr) return
    setGeneratingAI(true)
    await new Promise(r => setTimeout(r, 1500))
    setDescAr(`${nameAr} — منتج عالي الجودة مصنوع من أجود الخامات، مثالي للاستخدام اليومي. يتميز بتصميم أنيق وعصري يناسب جميع الأذواق.`)
    setGeneratingAI(false)
  }

  async function handleSave() {
    if (!nameAr || !price || !storeId) { toast.error('أدخل اسم المنتج والسعر'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('products').insert([{
        store_id: storeId, name_ar: nameAr, name_en: nameEn || null, description_ar: descAr || null,
        price: parseFloat(price), compare_price: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock) || 0, sku: sku || null, category_id: categoryId || null,
        is_active: isActive, is_featured: isFeatured,
      }])
      if (error) throw error
      toast.success('تم إضافة المنتج بنجاح')
      router.push('/dashboard/products')
    } catch { toast.error('فشل الحفظ، حاول مرة أخرى') }
    finally { setSaving(false) }
  }

  const discountPct = comparePrice && price && Number(comparePrice) > Number(price)
    ? Math.round((1 - Number(price) / Number(comparePrice)) * 100)
    : null

  return (
    <div dir={dir} className="page-container" style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard/products"
            style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0, background: '#fff', textDecoration: 'none' }}>
            <BackArrow size={16} />
          </Link>
          <div>
            <h1 className="page-title">إضافة منتج جديد</h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>أضف تفاصيل المنتج وانشره في متجرك</p>
          </div>
        </div>
        <div className="hide-on-mobile" style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setIsActive(!isActive)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            {isActive ? <Eye size={15} /> : <EyeOff size={15} />}
            {isActive ? 'مرئي' : 'مخفي'}
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, background: '#6C3CE1', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(108,60,225,0.22)', opacity: saving ? 0.7 : 1 }}>
            <Save size={15} />
            {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
          </button>
        </div>
      </div>

      {/* Form grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* Main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Basic info */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 20 }}>معلومات المنتج</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 7 }}>اسم المنتج (عربي) <span style={{ color: '#DC2626' }}>*</span></label>
                <input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="مثال: حذاء رياضي Nike Air Max"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 7 }}>اسم المنتج (إنجليزي)</label>
                <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="Nike Air Max Sneakers" dir="ltr"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>وصف المنتج</label>
                  <button onClick={generateDesc} disabled={generatingAI || !nameAr}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#F97316', background: '#FEF0E6', border: '1px solid #FDBA74', borderRadius: 7, padding: '4px 10px', cursor: nameAr && !generatingAI ? 'pointer' : 'not-allowed', opacity: nameAr ? 1 : 0.5 }}>
                    <Sparkles size={12} />
                    {generatingAI ? 'جاري الكتابة...' : 'كتابة بالذكاء الاصطناعي'}
                  </button>
                </div>
                <textarea value={descAr} onChange={e => setDescAr(e.target.value)} rows={4} placeholder="وصف تفصيلي للمنتج..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.6 }}
                  onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>صور المنتج</h3>
            <div style={{ border: '2px dashed #E5E7EB', borderRadius: 12, padding: '36px 20px', textAlign: 'center', background: '#F7F8FA', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onDragOver={e => e.preventDefault()}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#6C3CE1' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Upload size={22} color="#6C3CE1" />
              </div>
              <div style={{ fontWeight: 600, color: '#374151', marginBottom: 5 }}>اسحب وأفلت الصور هنا</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>PNG, JPG, WebP — حتى 5 ميغابايت للصورة</div>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: '1.5px solid #6C3CE1', background: '#fff', color: '#6C3CE1', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <Upload size={13} /> اختر صور
              </button>
            </div>
          </div>

          {/* Variants */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>الأحجام والألوان (خيارات)</h3>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>أضف خيارات مختلفة للمنتج كالألوان والأحجام</p>
              </div>
              <button onClick={addVariant}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1.5px solid #6C3CE1', background: '#EDE9FB', color: '#6C3CE1', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <Plus size={14} /> إضافة خيار
              </button>
            </div>
            {variants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9CA3AF', fontSize: 13 }}>لا توجد خيارات — أضف خياراً للبدء</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 40px', gap: 8 }}>
                  {['اسم الخيار', 'السعر', 'المخزون', ''].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', padding: '0 4px' }}>{h}</div>
                  ))}
                </div>
                {variants.map((v, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 40px', gap: 8, alignItems: 'center' }}>
                    <input value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} placeholder="مثال: أحمر / XL"
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none' }}
                      onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                      onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                    />
                    <input value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} placeholder="0.00" type="number"
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none' }}
                      onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                      onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                    />
                    <input value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} placeholder="0" type="number"
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, outline: 'none' }}
                      onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                      onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                    />
                    <button onClick={() => removeVariant(i)}
                      style={{ width: 38, height: 38, borderRadius: 8, border: 'none', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Pricing */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>السعر والمخزون</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>السعر (د.أ) <span style={{ color: '#DC2626' }}>*</span></label>
                <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.001" placeholder="0.000" dir="ltr"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontWeight: 700 }}
                  onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>السعر قبل التخفيض</label>
                <input value={comparePrice} onChange={e => setComparePrice(e.target.value)} type="number" step="0.001" placeholder="0.000" dir="ltr"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                />
                {discountPct && (
                  <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 700, marginTop: 5 }}>
                    خصم {discountPct}%
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>المخزون</label>
                <input value={stock} onChange={e => setStock(e.target.value)} type="number" placeholder="0"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>رمز المنتج (SKU)</label>
                <input value={sku} onChange={e => setSku(e.target.value)} placeholder="مثال: PROD-001" dir="ltr"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}
                />
              </div>
            </div>
          </div>

          {/* Category & options */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>التصنيف والخيارات</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>التصنيف</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#6C3CE1' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB' }}>
                <option value="">بدون تصنيف</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'مرئي للعملاء', desc: 'سيظهر المنتج في المتجر', on: isActive, toggle: () => setIsActive(!isActive), icon: isActive ? Eye : EyeOff },
                { label: 'منتج مميز', desc: 'يظهر في قسم المنتجات المميزة', on: isFeatured, toggle: () => setIsFeatured(!isFeatured), icon: Star },
              ].map((opt, i) => (
                <div key={opt.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: i === 0 ? '1px solid #F1F2F6' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                  <Toggle on={opt.on} onChange={opt.toggle} />
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div style={{ background: '#EDE9FB', borderRadius: 12, padding: 16, border: '1px solid #C4B5FD' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Package size={16} color="#6C3CE1" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#5B21B6', marginBottom: 4 }}>نصيحة</div>
                <div style={{ fontSize: 12, color: '#6C3CE1', lineHeight: 1.7 }}>
                  أضف صوراً عالية الجودة واكتب وصفاً تفصيلياً لزيادة فرص البيع
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky save bar */}
      <div className="show-on-mobile" style={{ position: 'fixed', bottom: 64, insetInlineStart: 0, insetInlineEnd: 0, background: '#fff', borderTop: '1px solid #E5E7EB', padding: '12px 16px', display: 'flex', gap: 10, zIndex: 50 }}>
        <button onClick={() => setIsActive(!isActive)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          {isActive ? 'مرئي' : 'مخفي'}
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 9, background: '#6C3CE1', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
          <Save size={15} />
          {saving ? 'جاري الحفظ...' : 'حفظ المنتج'}
        </button>
      </div>
    </div>
  )
}
