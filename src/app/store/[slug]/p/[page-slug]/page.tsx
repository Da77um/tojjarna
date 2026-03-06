import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CmsPageClient from './CmsPageClient'

interface Props {
    params: Promise<{ slug: string; 'page-slug': string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, 'page-slug': pageSlug } = await params
    const supabase = await createClient()

    const { data: store } = await supabase.from('stores').select('id, name_ar').eq('slug', slug).single()
    if (!store) return { title: 'الصفحة غير موجودة' }

    const { data: page } = await supabase.from('store_pages').select('title_ar, meta_title_ar, meta_description_ar').eq('store_id', store.id).eq('slug', pageSlug).eq('is_published', true).single()
    if (!page) return { title: 'الصفحة غير موجودة' }

    return {
        title: page.meta_title_ar || `${page.title_ar} — ${store.name_ar}`,
        description: page.meta_description_ar || undefined,
    }
}

export default async function StorefrontCmsPage({ params }: Props) {
    const { slug, 'page-slug': pageSlug } = await params
    const supabase = await createClient()

    const { data: store } = await supabase.from('stores').select('id, name_ar, theme').eq('slug', slug).single()
    if (!store) notFound()

    const { data: page } = await supabase
        .from('store_pages')
        .select('*')
        .eq('store_id', store.id)
        .eq('slug', pageSlug)
        .eq('is_published', true)
        .single()

    if (!page) notFound()

    const primaryColor = store.theme?.global?.primary_color || store.theme?.primary_color || '#6C3CE1'

    return <CmsPageClient store={store} page={page} slug={slug} />
}
