'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Edit3, Trash2, Eye, EyeOff, FileText, Search, Globe } from 'lucide-react'
import { toast } from 'sonner'

export default function StorePagesPage() {
    const supabase = createClient()
    const router = useRouter()
    const [pages, setPages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [storeId, setStoreId] = useState<string | null>(null)
    const [storeSlug, setStoreSlug] = useState<string>('')
    const [editing, setEditing] = useState<any | null>(null) // null = list, {} = new, {...} = edit
    const [search, setSearch] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }
            const { data: stores } = await supabase.from('stores').select('id, slug').eq('user_id', user.id).limit(1)
            if (!stores || stores.length === 0) { setLoading(false); return }
            setStoreId(stores[0].id)
            setStoreSlug(stores[0].slug)
            const { data } = await supabase.from('store_pages').select('*').eq('store_id', stores[0].id).order('created_at', { ascending: false })
            setPages(data || [])
            setLoading(false)
        }
        load()
    }, [supabase, router])

    const savePage = async () => {
        if (!storeId || !editing) return
        if (!editing.title_ar || !editing.slug) { toast.error('العنوان والرابط مطلوبان'); return }
        setSaving(true)
        try {
            if (editing.id) {
                const { error } = await supabase.from('store_pages').update({
                    title_ar: editing.title_ar, title_en: editing.title_en,
                    content_ar: editing.content_ar, slug: editing.slug,
                    meta_title_ar: editing.meta_title_ar, meta_description_ar: editing.meta_description_ar,
                    is_published: editing.is_published,
                }).eq('id', editing.id)
                if (error) throw error
                setPages(prev => prev.map(p => p.id === editing.id ? { ...p, ...editing } : p))
                toast.success('تم حفظ الصفحة')
            } else {
                const { data, error } = await supabase.from('store_pages').insert({
                    store_id: storeId, title_ar: editing.title_ar, title_en: editing.title_en,
                    content_ar: editing.content_ar, slug: editing.slug,
                    meta_title_ar: editing.meta_title_ar, meta_description_ar: editing.meta_description_ar,
                    is_published: editing.is_published || false,
                }).select().single()
                if (error) throw error
                setPages(prev => [data, ...prev])
                toast.success('تم إنشاء الصفحة')
            }
            setEditing(null)
        } catch (err: any) {
            toast.error(err.message?.includes('unique') ? 'الرابط مستخدم مسبقًا' : 'خطأ في الحفظ')
        } finally { setSaving(false) }
    }

    const togglePublish = async (page: any) => {
        const { error } = await supabase.from('store_pages').update({ is_published: !page.is_published }).eq('id', page.id)
        if (!error) {
            setPages(prev => prev.map(p => p.id === page.id ? { ...p, is_published: !p.is_published } : p))
            toast.success(page.is_published ? 'تم إلغاء النشر' : 'تم النشر')
        }
    }

    const deletePage = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return
        const { error } = await supabase.from('store_pages').delete().eq('id', id)
        if (!error) { setPages(prev => prev.filter(p => p.id !== id)); toast.success('تم الحذف') }
    }

    const startEdit = (page?: any) => setEditing(page ? { ...page } : { title_ar: '', title_en: '', slug: '', content_ar: '', meta_title_ar: '', meta_description_ar: '', is_published: false })

    const generateSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    if (loading) return (
        <div className="page-container" dir="rtl">
            <div className="skeleton skeleton-text" style={{ width: 140, height: 22, marginBottom: 20 }} />
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14, marginBottom: 12 }} />)}
        </div>
    )

    // ── Editor view ────────────────────────────────────────────────────────
    if (editing !== null) {
        return (
            <div className="page-container" dir="rtl">
                <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 className="page-title">{editing.id ? 'تعديل الصفحة' : 'صفحة جديدة'}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setEditing(null)} className="btn btn-ghost" style={{ border: '1px solid #E0D6C8' }}>إلغاء</button>
                        <button onClick={savePage} disabled={saving} className="btn btn-primary">
                            {saving ? 'جاري الحفظ...' : 'حفظ الصفحة'}
                        </button>
                    </div>
                </div>

                <div className="product-form-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="card card-body">
                            <div className="form-group">
                                <label className="form-label">العنوان بالعربية *</label>
                                <input className="form-control" value={editing.title_ar} onChange={e => {
                                    const v = e.target.value
                                    setEditing((prev: any) => ({ ...prev, title_ar: v, slug: prev.slug || generateSlug(v) }))
                                }} placeholder="عن المتجر" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">العنوان بالإنجليزية</label>
                                <input className="form-control" value={editing.title_en || ''} onChange={e => setEditing((prev: any) => ({ ...prev, title_en: e.target.value }))} placeholder="About Us" dir="ltr" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">المحتوى</label>
                                <textarea className="form-control" rows={12} value={editing.content_ar || ''} onChange={e => setEditing((prev: any) => ({ ...prev, content_ar: e.target.value }))}
                                    placeholder="اكتب محتوى الصفحة هنا..." style={{ resize: 'vertical', lineHeight: 1.8 }} />
                            </div>
                        </div>

                        <div className="card card-body">
                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🔍 SEO</h3>
                            <div className="form-group">
                                <label className="form-label">عنوان SEO</label>
                                <input className="form-control" value={editing.meta_title_ar || ''} onChange={e => setEditing((prev: any) => ({ ...prev, meta_title_ar: e.target.value }))} placeholder="عنوان الصفحة في محركات البحث" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">الوصف</label>
                                <textarea className="form-control" rows={3} value={editing.meta_description_ar || ''} onChange={e => setEditing((prev: any) => ({ ...prev, meta_description_ar: e.target.value }))} placeholder="وصف مختصر للظهور في نتائج البحث..." />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="card card-body">
                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>إعدادات الصفحة</h3>
                            <div className="form-group">
                                <label className="form-label">رابط الصفحة *</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                                    <span style={{ padding: '10px 12px', background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap', borderLeft: '1px solid var(--border)' }}>
                                        /p/
                                    </span>
                                    <input style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: 14, background: 'transparent', direction: 'ltr', fontFamily: 'inherit' }}
                                        value={editing.slug} onChange={e => setEditing((prev: any) => ({ ...prev, slug: e.target.value }))} placeholder="about-us" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 10 }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>نشر الصفحة</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>ستظهر الصفحة للزوار</div>
                                </div>
                                <button onClick={() => setEditing((prev: any) => ({ ...prev, is_published: !prev.is_published }))} style={{
                                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                                    background: editing.is_published ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'background 0.2s',
                                }}>
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: editing.is_published ? 22 : 3, transition: 'left 0.2s' }} />
                                </button>
                            </div>
                            {storeSlug && editing.slug && (
                                <a href={`/store/${storeSlug}/p/${editing.slug}`} target="_blank" rel="noopener noreferrer"
                                    className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                                    <Globe size={13} /> عرض الصفحة
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── List view ──────────────────────────────────────────────────────────
    const filtered = pages.filter(p => !search || p.title_ar?.includes(search) || p.slug?.includes(search))

    return (
        <div className="page-container" dir="rtl">
            <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="page-title">صفحات المتجر</h1>
                    <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>أنشئ صفحات ثابتة مثل "عن المتجر" و"سياسة الخصوصية"</p>
                </div>
                <button onClick={() => startEdit()} className="btn btn-primary"><Plus size={16} />صفحة جديدة</button>
            </div>

            <div className="mobile-search" style={{ marginBottom: 16 }}>
                <Search size={17} className="search-icon" />
                <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في الصفحات..." style={{ paddingRight: 44 }} />
            </div>

            {filtered.length === 0 ? (
                <div className="card card-body" style={{ textAlign: 'center', padding: 60 }}>
                    <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
                    <h3 style={{ fontWeight: 700, marginBottom: 8 }}>لا توجد صفحات بعد</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>أنشئ صفحات "عن المتجر" وسياسة الإرجاع وغيرها</p>
                    <button onClick={() => startEdit()} className="btn btn-primary" style={{ display: 'inline-flex' }}><Plus size={15} />إنشاء أول صفحة</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {filtered.map((page) => (
                        <div key={page.id} className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{page.title_ar}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, direction: 'ltr', textAlign: 'right' }}>/{page.slug}</div>
                                </div>
                                <span className="badge" style={{
                                    background: page.is_published ? '#D1FAE5' : '#F3F4F6',
                                    color: page.is_published ? '#065F46' : '#374151',
                                }}>
                                    {page.is_published ? 'منشورة' : 'مسودة'}
                                </span>
                            </div>
                            {page.content_ar && (
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {page.content_ar}
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 2 }}>
                                <button onClick={() => startEdit(page)} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center', gap: 5 }}>
                                    <Edit3 size={13} />تعديل
                                </button>
                                <button onClick={() => togglePublish(page)} className="btn btn-sm" style={{
                                    background: page.is_published ? '#FEE2E2' : '#D1FAE5',
                                    color: page.is_published ? '#991B1B' : '#065F46',
                                    border: 'none', gap: 5, flex: 1, justifyContent: 'center'
                                }}>
                                    {page.is_published ? <><EyeOff size={13} />إلغاء النشر</> : <><Eye size={13} />نشر</>}
                                </button>
                                <button onClick={() => deletePage(page.id)} className="btn btn-sm" style={{ background: '#FEE2E2', color: '#991B1B', border: 'none' }}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
