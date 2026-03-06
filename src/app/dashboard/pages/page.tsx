'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Edit3, Trash2, Eye, EyeOff, FileText, Search, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '@/i18n/LanguageContext'

export default function StorePagesPage() {
    const supabase = createClient()
    const router = useRouter()
    const { t, dir } = useLanguage()
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
        if (!editing.title_ar || !editing.slug) { toast.error(t.storePages.requiredError); return }
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
                toast.success(t.storePages.savedSuccess)
            } else {
                const { data, error } = await supabase.from('store_pages').insert({
                    store_id: storeId, title_ar: editing.title_ar, title_en: editing.title_en,
                    content_ar: editing.content_ar, slug: editing.slug,
                    meta_title_ar: editing.meta_title_ar, meta_description_ar: editing.meta_description_ar,
                    is_published: editing.is_published || false,
                }).select().single()
                if (error) throw error
                setPages(prev => [data, ...prev])
                toast.success(t.storePages.createdSuccess)
            }
            setEditing(null)
        } catch (err: any) {
            toast.error(err.message?.includes('unique') ? t.storePages.slugUsed : t.storePages.saveError)
        } finally { setSaving(false) }
    }

    const togglePublish = async (page: any) => {
        const { error } = await supabase.from('store_pages').update({ is_published: !page.is_published }).eq('id', page.id)
        if (!error) {
            setPages(prev => prev.map(p => p.id === page.id ? { ...p, is_published: !p.is_published } : p))
            toast.success(page.is_published ? t.storePages.unpublishSuccess : t.storePages.publishSuccess)
        }
    }

    const deletePage = async (id: string) => {
        if (!confirm(t.storePages.deleteConfirm)) return
        const { error } = await supabase.from('store_pages').delete().eq('id', id)
        if (!error) { setPages(prev => prev.filter(p => p.id !== id)); toast.success(t.storePages.deleteSuccess) }
    }

    const startEdit = (page?: any) => setEditing(page ? { ...page } : { title_ar: '', title_en: '', slug: '', content_ar: '', meta_title_ar: '', meta_description_ar: '', is_published: false })

    const generateSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    if (loading) return (
        <div className="page-container" dir={dir}>
            <div className="skeleton skeleton-text" style={{ width: 140, height: 22, marginBottom: 20 }} />
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14, marginBottom: 12 }} />)}
        </div>
    )

    // ── Editor view ────────────────────────────────────────────────────────
    if (editing !== null) {
        return (
            <div className="page-container" dir={dir}>
                <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 className="page-title">{editing.id ? t.storePages.editPage : t.storePages.newPage}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setEditing(null)} className="btn btn-ghost" style={{ border: '1px solid #E0D6C8' }}>{t.common.cancel}</button>
                        <button onClick={savePage} disabled={saving} className="btn btn-primary">
                            {saving ? t.common.saving : t.storePages.savePage}
                        </button>
                    </div>
                </div>

                <div className="product-form-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="card card-body">
                            <div className="form-group">
                                <label className="form-label">{t.storePages.titleAr} *</label>
                                <input className="form-control" value={editing.title_ar} onChange={e => {
                                    const v = e.target.value
                                    setEditing((prev: any) => ({ ...prev, title_ar: v, slug: prev.slug || generateSlug(v) }))
                                }} placeholder={t.storePages.aboutStoreAr} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t.storePages.titleEn}</label>
                                <input className="form-control" value={editing.title_en || ''} onChange={e => setEditing((prev: any) => ({ ...prev, title_en: e.target.value }))} placeholder={t.storePages.aboutStoreEn} dir="ltr" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t.storePages.contentAr}</label>
                                <textarea className="form-control" rows={12} value={editing.content_ar || ''} onChange={e => setEditing((prev: any) => ({ ...prev, content_ar: e.target.value }))}
                                    placeholder={t.storePages.contentPlaceholder} style={{ resize: 'vertical', lineHeight: 1.8 }} />
                            </div>
                        </div>

                        <div className="card card-body">
                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🔍 SEO</h3>
                            <div className="form-group">
                                <label className="form-label">{t.storePages.seoTitle}</label>
                                <input className="form-control" value={editing.meta_title_ar || ''} onChange={e => setEditing((prev: any) => ({ ...prev, meta_title_ar: e.target.value }))} placeholder={t.storePages.seoTitlePlaceholder} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">{t.storePages.seoDescription}</label>
                                <textarea className="form-control" rows={3} value={editing.meta_description_ar || ''} onChange={e => setEditing((prev: any) => ({ ...prev, meta_description_ar: e.target.value }))} placeholder={t.storePages.seoDescPlaceholder} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="card card-body">
                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{t.storePages.pageSettings}</h3>
                            <div className="form-group">
                                <label className="form-label">{t.storePages.slug} *</label>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                                    <span style={{ padding: '10px 12px', background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap', borderRight: dir === 'rtl' ? 'none' : '1px solid var(--border)', borderLeft: dir === 'rtl' ? '1px solid var(--border)' : 'none' }}>
                                        /p/
                                    </span>
                                    <input style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontSize: 14, background: 'transparent', direction: 'ltr', fontFamily: 'inherit' }}
                                        value={editing.slug} onChange={e => setEditing((prev: any) => ({ ...prev, slug: e.target.value }))} placeholder="about-us" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 10 }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.storePages.publishPage}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{t.storePages.publishDesc}</div>
                                </div>
                                <button onClick={() => setEditing((prev: any) => ({ ...prev, is_published: !prev.is_published }))} style={{
                                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                                    background: editing.is_published ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'background 0.2s',
                                }}>
                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: editing.is_published ? (dir === 'rtl' ? 22 : 3) : (dir === 'rtl' ? 3 : 22), transition: 'left 0.2s' }} />
                                </button>
                            </div>
                            {storeSlug && editing.slug && (
                                <a href={`/store/${storeSlug}/p/${editing.slug}`} target="_blank" rel="noopener noreferrer"
                                    className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                                    <Globe size={13} /> {t.storePages.viewPage}
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
        <div className="page-container" dir={dir}>
            <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="page-title">{t.storePages.title}</h1>
                    <p style={{ color: '#6B6058', fontSize: 14, marginTop: 4 }}>{t.storePages.subtitle}</p>
                </div>
                <button onClick={() => startEdit()} className="btn btn-primary"><Plus size={16} />{t.storePages.newPage}</button>
            </div>

            <div className="mobile-search" style={{ marginBottom: 16 }}>
                <Search size={17} className="search-icon" />
                <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.storePages.searchPlaceholder} style={{ paddingRight: dir === 'rtl' ? 44 : 12, paddingLeft: dir === 'ltr' ? 44 : 12 }} />
            </div>

            {filtered.length === 0 ? (
                <div className="card card-body" style={{ textAlign: 'center', padding: 60 }}>
                    <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
                    <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{t.storePages.noPages}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{t.storePages.createPagesDesc}</p>
                    <button onClick={() => startEdit()} className="btn btn-primary" style={{ display: 'inline-flex' }}><Plus size={15} />{t.storePages.createFirstPage}</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                    {filtered.map((page) => (
                        <div key={page.id} className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{dir === 'rtl' ? page.title_ar || page.title_en : page.title_en || page.title_ar}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, direction: 'ltr', textAlign: dir === 'rtl' ? 'right' : 'left' }}>/{page.slug}</div>
                                </div>
                                <span className="badge" style={{
                                    background: page.is_published ? '#D1FAE5' : '#F3F4F6',
                                    color: page.is_published ? '#065F46' : '#374151',
                                }}>
                                    {page.is_published ? t.storePages.publishedBadge : t.storePages.draftBadge}
                                </span>
                            </div>
                            {(dir === 'rtl' ? page.content_ar : page.content_en) && (
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {dir === 'rtl' ? page.content_ar : page.content_en}
                                </p>
                            )}
                            <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 2 }}>
                                <button onClick={() => startEdit(page)} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center', gap: 5 }}>
                                    <Edit3 size={13} />{t.common.edit}
                                </button>
                                <button onClick={() => togglePublish(page)} className="btn btn-sm" style={{
                                    background: page.is_published ? '#FEE2E2' : '#D1FAE5',
                                    color: page.is_published ? '#991B1B' : '#065F46',
                                    border: 'none', gap: 5, flex: 1, justifyContent: 'center'
                                }}>
                                    {page.is_published ? <><EyeOff size={13} />{t.storePages.unpublish}</> : <><Eye size={13} />{t.storePages.publish}</>}
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
