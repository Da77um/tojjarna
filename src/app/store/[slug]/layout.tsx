import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function StorefrontLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id, name_ar, slug, theme, status, is_active, is_approved, logo_url')
    .eq('slug', slug)
    .single()

  if (!store) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F7F8FA', fontFamily: 'Tajawal, Inter, sans-serif', direction: 'rtl' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏷️</div>
        <h2 style={{ marginBottom: 8, textAlign: 'center', fontSize: 22, fontWeight: 900, color: '#0F172A' }}>المتجر غير موجود</h2>
        <p style={{ color: '#6B7280', marginBottom: 24, fontSize: 15 }}>لم نتمكن من إيجاد هذا المتجر.</p>
        <Link href="/" style={{ background: '#6C3CE1', color: 'white', padding: '11px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
          العودة للرئيسية
        </Link>
      </div>
    )
  }

  if (store.status !== 'approved' || !store.is_active) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F7F8FA', fontFamily: 'Tajawal, Inter, sans-serif', direction: 'rtl' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🛠️</div>
        <h2 style={{ marginBottom: 8, color: '#0F172A', fontWeight: 900, textAlign: 'center', fontSize: 22 }}>المتجر غير متاح حالياً</h2>
        <p style={{ color: '#6B7280', margin: 0, marginBottom: 24, fontSize: 15, textAlign: 'center' }}>
          عذراً، هذا المتجر غير متاح في الوقت الحالي. يرجى المحاولة لاحقاً.
        </p>
        <Link href="/" style={{ background: '#6C3CE1', color: 'white', padding: '11px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
          تصفح متاجر أخرى
        </Link>
      </div>
    )
  }

  // Extract theme settings
  const themeData = store.theme || {}
  const global = themeData.global || {}
  const primaryColor = global.primary_color || themeData.primary_color || '#6C3CE1'
  const secondaryColor = global.secondary_color || '#F97316'
  const fontFamily = global.font_family || themeData.font || 'Tajawal'
  const borderRadius = global.border_radius ?? 12
  const isRtl = (global.layout || 'rtl') === 'rtl'

  // Build CSS variables for storefront theme override
  const themeCSS = `
    :root {
      --store-primary: ${primaryColor};
      --store-primary-hover: ${adjustColor(primaryColor, -20)};
      --store-primary-light: ${primaryColor}18;
      --store-secondary: ${secondaryColor};
      --store-radius: ${borderRadius}px;
      --store-font: '${fontFamily}', 'Tajawal', system-ui, sans-serif;
    }
    .store-theme { font-family: var(--store-font) !important; }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      <div dir={isRtl ? 'rtl' : 'ltr'} className="store-theme">
        {children}
      </div>
    </>
  )
}

function adjustColor(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  } catch {
    return hex
  }
}
