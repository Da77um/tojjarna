'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
    Tag, Settings, Store, LogOut, Menu, X, Bell, ChevronDown,
    Palette, ShoppingBag, FileText, Check, AlertTriangle, Ban
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const supabase = createClient()
    const router = useRouter()
    const { t, lang, dir } = useLanguage()

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [stores, setStores] = useState<any[]>([])
    const [activeStore, setActiveStore] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState<any[]>([])
    const [showNotifs, setShowNotifs] = useState(false)
    const notifsRef = useRef<HTMLDivElement>(null)
    const unreadCount = notifications.filter(n => !n.is_read).length

    const navItems = [
        { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
        { href: '/dashboard/products', label: t.nav.products, icon: Package },
        { href: '/dashboard/orders', label: t.nav.orders, icon: ShoppingCart },
        { href: '/dashboard/customers', label: t.nav.customers, icon: Users },
        { href: '/dashboard/analytics', label: t.nav.analytics, icon: BarChart3 },
        { href: '/dashboard/coupons', label: t.nav.coupons, icon: Tag },
        { href: '/dashboard/theme-editor', label: t.nav.themeEditor, icon: Palette },
        { href: '/dashboard/abandoned-carts', label: t.nav.abandonedCarts, icon: ShoppingBag },
        { href: '/dashboard/pages', label: t.nav.pages, icon: FileText },
        { href: '/dashboard/settings', label: t.nav.settings, icon: Settings },
    ]

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                router.push('/login')
            } else if (session?.user) {
                loadUserData(session.user)
            }
        })

        async function loadUserData(authUser: any) {
            try {
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()

                setUser(profile || authUser)

                const { data: vendorStores } = await supabase
                    .from('stores')
                    .select('*')
                    .eq('user_id', authUser.id)

                if (vendorStores && vendorStores.length > 0) {
                    setStores(vendorStores)
                    setActiveStore(vendorStores[0])

                    const { data: notifs } = await supabase
                        .from('store_notifications')
                        .select('*')
                        .eq('store_id', vendorStores[0].id)
                        .order('created_at', { ascending: false })
                        .limit(20)
                    setNotifications(notifs || [])
                }
            } catch (err) {
                console.error('Error loading profile:', err)
            } finally {
                setLoading(false)
            }
        }

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                router.push('/login')
            } else {
                loadUserData(user)
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase, router, pathname])

    // Close notifs when clicking outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
                setShowNotifs(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const markAllRead = async () => {
        if (!activeStore) return
        await supabase.from('store_notifications').update({ is_read: true }).eq('store_id', activeStore.id).eq('is_read', false)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
            <div className="spinner" style={{ width: 40, height: 40, border: '3px solid #C6A75E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
    )

    return (
        <div dir={dir} style={{ display: 'flex', minHeight: '100vh', background: '#F2EDE4' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(2px)',
                        zIndex: 199,
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #E0D6C8' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: '#222222', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(34,34,34,0.3)', flexShrink: 0,
                        }}>
                            <Store size={20} color="#C6A75E" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 17, color: '#111111' }}>تجارنا</div>
                            <div style={{ fontSize: 11, color: '#6B6058', marginTop: 1 }}>
                                {lang === 'ar' ? 'لوحة التاجر' : 'Merchant Dashboard'}
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Store selector */}
                <div style={{
                    margin: '16px 12px',
                    padding: '12px 14px',
                    background: 'linear-gradient(135deg, rgba(198,167,94,0.08), rgba(198,167,94,0.04))',
                    border: '1px solid rgba(198,167,94,0.18)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#222222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#C6A75E', fontWeight: 800, fontSize: 14 }}>م</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#111111' }}>
                                {activeStore?.name_ar || t.common.loading}
                            </div>
                            <div style={{ fontSize: 11, color: '#6B6058' }}>
                                {activeStore?.slug ? `tojjarna.com/store/${activeStore.slug}` : (lang === 'ar' ? 'متجر جديد' : 'New Store')}
                            </div>
                        </div>
                    </div>
                    <ChevronDown size={16} color="#6B6058" />
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '8px 0' }}>
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive =
                            item.href === '/dashboard'
                                ? pathname === '/dashboard'
                                : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Sidebar bottom */}
                <div style={{ padding: '16px 12px', borderTop: '1px solid #E0D6C8' }}>
                    <a
                        href={activeStore?.slug ? `/store/${activeStore.slug}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-item"
                        style={{ marginBottom: 4, textDecoration: 'none' }}
                    >
                        <Store size={18} />
                        {t.nav.viewStore}
                    </a>
                    <button
                        onClick={handleLogout}
                        className="nav-item"
                        style={{ width: '100%', textAlign: 'inherit', background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B' }}
                    >
                        <LogOut size={18} />
                        {t.nav.logout}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="main-with-sidebar" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Topbar */}
                <header style={{
                    height: 64,
                    background: '#FDFAF6',
                    borderBottom: '1px solid #E0D6C8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    gap: 12,
                }}>
                    {/* Mobile menu button — always on the leading side */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#111111', padding: 4, flexShrink: 0,
                        }}
                        className="show-on-mobile"
                    >
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* Right side: lang switcher + notifs + user */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>

                        {/* Language Switcher */}
                        <div className="hide-on-mobile">
                            <LanguageSwitcher compact />
                        </div>

                        {/* Notifications */}
                        <div style={{ position: 'relative' }} ref={notifsRef}>
                            <button
                                onClick={() => setShowNotifs(!showNotifs)}
                                style={{
                                    width: 38, height: 38, borderRadius: 10,
                                    border: '1px solid #E0D6C8', background: '#FDFAF6',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', position: 'relative', flexShrink: 0,
                                }}
                            >
                                <Bell size={18} color="#6B6058" />
                                {unreadCount > 0 && (
                                    <div style={{
                                        position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18,
                                        borderRadius: 9, background: '#EF4444', border: '2px solid #FDFAF6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 700, color: 'white', padding: '0 4px',
                                    }}>{unreadCount}</div>
                                )}
                            </button>

                            {showNotifs && (
                                <div style={{
                                    position: 'absolute', top: 48,
                                    insetInlineEnd: 0,
                                    width: 300, background: '#FDFAF6',
                                    border: '1px solid #E0D6C8', borderRadius: 14,
                                    boxShadow: '0 12px 48px rgba(34,34,34,0.13)',
                                    zIndex: 200, overflow: 'hidden',
                                }}>
                                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #E0D6C8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{t.common.notifications}</span>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C6A75E', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Check size={12} /> {t.common.markAllRead}
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ maxHeight: 320, overflow: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#A09080', fontSize: 13 }}>{t.common.noNotifications}</div>
                                        ) : notifications.map(n => (
                                            <div key={n.id} style={{
                                                padding: '12px 16px', borderBottom: '1px solid #E0D6C8',
                                                background: n.is_read ? 'transparent' : 'rgba(198,167,94,0.07)',
                                                display: 'flex', gap: 10, alignItems: 'flex-start',
                                            }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? 'transparent' : '#C6A75E', marginTop: 6, flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111111' }}>{n.title_ar}</div>
                                                    {n.message_ar && <div style={{ fontSize: 12, color: '#6B6058', marginTop: 2 }}>{n.message_ar}</div>}
                                                    <div style={{ fontSize: 11, color: '#A09080', marginTop: 4 }}>{new Date(n.created_at).toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-GB')}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
                            <div className="avatar">{user?.name ? user.name[0] : 'U'}</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }} className="hide-on-mobile">
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>
                                    {user?.name || (lang === 'ar' ? 'المستخدم' : 'User')}
                                </span>
                                <span style={{ fontSize: 11, color: '#6B6058' }}>
                                    {user?.role === 'admin' ? t.common.platformAdmin : t.common.merchant}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '100vw' }}>
                    {activeStore?.status === 'pending' && (
                        <div style={{ background: '#FEF3C7', color: '#92400E', padding: '14px 24px', fontSize: 14, fontWeight: 700, borderBottom: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={18} /> {t.dashboard.pendingApproval}
                        </div>
                    )}
                    {activeStore?.status === 'suspended' && (
                        <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '14px 24px', fontSize: 14, fontWeight: 700, borderBottom: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Ban size={18} /> {t.dashboard.storeSuspended}
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
