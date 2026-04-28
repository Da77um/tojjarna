'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  Palette, Settings, LogOut, Bell, Menu, X, ExternalLink,
  Home, Tag, MessageSquare, FileText, Smartphone, ChevronDown,
  Store, CreditCard, Zap,
} from 'lucide-react'

const navGroups = [
  {
    label: 'الرئيسية',
    items: [
      { href: '/dashboard', label: 'نظرة عامة', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/analytics', label: 'التحليلات', icon: BarChart3 },
    ],
  },
  {
    label: 'المتجر',
    items: [
      { href: '/dashboard/products', label: 'المنتجات', icon: Package },
      { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingCart },
      { href: '/dashboard/customers', label: 'العملاء', icon: Users },
      { href: '/dashboard/coupons', label: 'الكوبونات', icon: Tag },
      { href: '/dashboard/abandoned-carts', label: 'السلات المتروكة', icon: ShoppingCart },
    ],
  },
  {
    label: 'المحتوى',
    items: [
      { href: '/dashboard/theme-editor', label: 'تصميم المتجر', icon: Palette },
      { href: '/dashboard/pages', label: 'الصفحات', icon: FileText },
      { href: '/dashboard/apps', label: 'التطبيقات', icon: Smartphone },
    ],
  },
  {
    label: 'الإعدادات',
    items: [
      { href: '/dashboard/settings', label: 'إعدادات المتجر', icon: Settings },
    ],
  },
]

const bottomNavItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: Home, exact: true },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingCart },
  { href: '/dashboard/analytics', label: 'التحليلات', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const supabase = createClient()
  const router = useRouter()
  const { t, dir } = useLanguage()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [stores, setStores] = useState<any[]>([])
  const [activeStore, setActiveStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [storeSwitcherOpen, setStoreSwitcherOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) router.push('/login')
      else if (session?.user) loadUserData(session.user)
    })

    async function loadUserData(authUser: any) {
      try {
        const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single()
        setUser(profile || authUser)

        const { data: vendorStores } = await supabase.from('stores').select('*').eq('user_id', authUser.id)
        if (vendorStores?.length) {
          setStores(vendorStores)
          setActiveStore(vendorStores[0])

          const { count } = await supabase.from('store_notifications')
            .select('id', { count: 'exact', head: true })
            .eq('store_id', vendorStores[0].id)
            .eq('is_read', false)
          setUnreadNotifs(count || 0)
        }
      } catch (err) {
        console.error('Profile load error:', err)
      } finally {
        setLoading(false)
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else loadUserData(user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FA' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px', borderWidth: 3 }} />
        <p style={{ color: '#6B7280', fontSize: 14 }}>جاري التحميل...</p>
      </div>
    </div>
  )

  /* ── Sidebar content (shared between desktop + mobile drawer) ── */
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Logo + close button (mobile) */}
      <div style={{ padding: '18px 16px', borderBottom: '1px solid #F1F2F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>تجارنا</span>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 6, display: 'flex', alignItems: 'center' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Store switcher */}
      <div style={{ padding: '12px 10px', borderBottom: '1px solid #F1F2F6' }}>
        <button
          onClick={() => setStoreSwitcherOpen(!storeSwitcherOpen)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 10, background: '#F7F8FA', border: '1px solid #E5E7EB', cursor: 'pointer', textAlign: 'start' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: activeStore ? '#6C3CE1' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
            {activeStore?.name_ar?.[0] || 'م'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeStore?.name_ar || 'متجري'}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeStore?.slug ? `${activeStore.slug}.tojjarna.com` : 'اختر متجراً'}
            </div>
          </div>
          <ChevronDown size={15} color="#6B7280" style={{ flexShrink: 0, transform: storeSwitcherOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* Store list dropdown */}
        {storeSwitcherOpen && stores.length > 1 && (
          <div style={{ marginTop: 4, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}>
            {stores.map(store => (
              <button key={store.id} onClick={() => { setActiveStore(store); setStoreSwitcherOpen(false) }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: store.id === activeStore?.id ? '#EDE9FB' : 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: store.id === activeStore?.id ? '#6C3CE1' : '#374151', fontFamily: 'inherit' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#6C3CE1' }}>
                  {store.name_ar?.[0] || 'م'}
                </div>
                {store.name_ar || store.name_en}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 10px 4px' }}>
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href, item.exact)
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} onClick={() => onClose?.()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                    borderRadius: 8, marginBottom: 1, textDecoration: 'none',
                    background: active ? '#EDE9FB' : 'transparent',
                    color: active ? '#6C3CE1' : '#374151',
                    fontWeight: active ? 600 : 500,
                    fontSize: 13.5,
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = '#F7F8FA'; (e.currentTarget as HTMLAnchorElement).style.color = '#0F172A' } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#374151' } }}>
                  <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom area */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid #F1F2F6' }}>
        {/* View storefront */}
        {activeStore?.slug && (
          <a href={`/store/${activeStore.slug}`} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, color: '#6B7280', fontSize: 13, fontWeight: 500, textDecoration: 'none', marginBottom: 2 }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#F7F8FA'; (e.currentTarget as HTMLAnchorElement).style.color = '#0F172A' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = '#6B7280' }}>
            <ExternalLink size={15} style={{ opacity: 0.6 }} />
            عرض المتجر
          </a>
        )}
        {/* Logout */}
        <button onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 13, fontWeight: 500, fontFamily: 'inherit' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
          <LogOut size={15} />
          تسجيل الخروج
        </button>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 4px', marginTop: 4, borderTop: '1px solid #F1F2F6' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C3CE1', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
            {user?.name?.[0] || 'م'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'المستخدم'}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div dir={dir} style={{ fontFamily: dir === 'rtl' ? 'Tajawal, sans-serif' : 'Inter, sans-serif', minHeight: '100vh', background: '#F7F8FA' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hide-on-mobile sidebar" style={{ display: 'flex', flexDirection: 'column', boxShadow: 'none', borderInlineEnd: '1px solid #F1F2F6' }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay Sidebar ── */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }} onClick={() => setSidebarOpen(false)} />
          <aside style={{
            position: 'absolute', top: 0, bottom: 0,
            [dir === 'rtl' ? 'right' : 'left']: 0,
            width: 280, background: '#fff',
            boxShadow: '0 0 40px rgba(15,23,42,0.18)',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}>
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="main-with-sidebar" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* ── Top bar ── */}
        <header style={{
          height: 60, background: '#fff', borderBottom: '1px solid #F1F2F6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
        }}>
          {/* Mobile hamburger + logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="show-on-mobile"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 8, display: 'none', alignItems: 'center', borderRadius: 8 }}>
              <Menu size={22} />
            </button>
            {/* Breadcrumb / page title placeholder — pages fill this via their own header */}
            <span className="hide-on-mobile" style={{ fontSize: 15, fontWeight: 600, color: '#6B7280' }}>
              {activeStore?.name_ar || 'لوحة التحكم'}
            </span>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LanguageSwitcher compact />

            {/* Notifications */}
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#6B7280', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F7F8FA' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
              <Bell size={20} />
              {unreadNotifs > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #fff' }} />
              )}
            </button>

            {/* User avatar */}
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EDE9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C3CE1', fontWeight: 800, fontSize: 13, cursor: 'pointer', border: '2px solid #EDE9FB' }}>
              {user?.name?.[0] || 'م'}
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main style={{ flex: 1, overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation ── */}
      <nav className="bottom-nav">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href, item.exact)
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, flex: 1, fontSize: 10, fontWeight: 600, textDecoration: 'none', color: active ? '#6C3CE1' : '#9CA3AF', padding: '6px 0', transition: 'color 0.15s' }}>
              <div style={{ width: 32, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: active ? '#EDE9FB' : 'transparent', transition: 'background 0.15s' }}>
                <Icon size={17} />
              </div>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
