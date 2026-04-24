'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
    Tag, Settings, Store, LogOut, Menu, X, Bell, ChevronDown,
    Palette, ShoppingBag, FileText, Check, AlertTriangle, Ban,
    Search, ExternalLink, Sparkles
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
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'var(--background)',
            flexDirection: 'column',
            gap: 16
        }}>
            <div className="spinner spinner-lg" />
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t.common.loading}</p>
        </div>
    )

    return (
        <div dir={dir} style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 199,
                        animation: 'fadeIn 200ms ease',
                    }}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ background: 'var(--surface)' }}>
                {/* Logo Section */}
                <div style={{ 
                    padding: '24px 20px', 
                    borderBottom: '1px solid var(--border)',
                    background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-muted) 100%)'
                }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                        <div style={{
                            width: 44, 
                            height: 44, 
                            borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                            display: 'flex',
                            alignItems: 'center', 
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                        }}>
                            <Store size={22} color="var(--accent)" />
                        </div>
                        <div>
                            <div style={{ 
                                fontWeight: 800, 
                                fontSize: 18, 
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.02em'
                            }}>
                                Tojjarna
                            </div>
                            <div style={{ 
                                fontSize: 12, 
                                color: 'var(--text-muted)', 
                                fontWeight: 500 
                            }}>
                                {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Store Selector */}
                <div style={{ padding: '16px 16px 8px' }}>
                    <div style={{
                        padding: '14px 16px',
                        background: 'var(--accent-muted)',
                        border: '1px solid var(--accent)',
                        borderRadius: 'var(--radius-xl)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all var(--transition-fast)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ 
                                width: 36, 
                                height: 36, 
                                borderRadius: 'var(--radius-md)', 
                                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                            }}>
                                <Sparkles size={18} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                                    {activeStore?.name_ar || t.common.loading}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                    {activeStore?.slug ? `/${activeStore.slug}` : (lang === 'ar' ? 'متجر جديد' : 'New Store')}
                                </div>
                            </div>
                        </div>
                        <ChevronDown size={16} color="var(--text-muted)" />
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
                    <div style={{ 
                        padding: '8px 20px 12px', 
                        fontSize: 11, 
                        fontWeight: 600, 
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
                    </div>
                    {navItems.slice(0, 6).map((item) => {
                        const Icon = item.icon
                        const isActive = item.href === '/dashboard' 
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
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                    
                    <div style={{ 
                        padding: '20px 20px 12px', 
                        fontSize: 11, 
                        fontWeight: 600, 
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {lang === 'ar' ? 'المتجر' : 'Store'}
                    </div>
                    {navItems.slice(6).map((item) => {
                        const Icon = item.icon
                        const isActive = pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div style={{ 
                    padding: '16px', 
                    borderTop: '1px solid var(--border)',
                    background: 'var(--surface-muted)'
                }}>
                    <a
                        href={activeStore?.slug ? `/store/${activeStore.slug}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '12px 14px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            textDecoration: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: 14,
                            fontWeight: 500,
                            transition: 'all var(--transition-fast)',
                            marginBottom: 8,
                        }}
                    >
                        <ExternalLink size={16} />
                        <span>{t.nav.viewStore}</span>
                    </a>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '12px 14px',
                            background: 'var(--error-bg)',
                            border: '1px solid transparent',
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--error)',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all var(--transition-fast)',
                        }}
                    >
                        <LogOut size={16} />
                        <span>{t.nav.logout}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-with-sidebar" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top Bar */}
                <header style={{
                    height: 72,
                    background: 'var(--surface)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    gap: 16,
                }}>
                    {/* Left: Menu + Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="show-on-mobile"
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--surface-hover)',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-primary)',
                            }}
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {/* Search Bar - Desktop */}
                        <div className="hide-on-mobile" style={{ position: 'relative', maxWidth: 400, flex: 1 }}>
                            <input
                                type="text"
                                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                                style={{
                                    width: '100%',
                                    height: 44,
                                    padding: dir === 'rtl' ? '0 16px 0 44px' : '0 44px 0 16px',
                                    borderRadius: 'var(--radius-xl)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface-muted)',
                                    fontSize: 14,
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    color: 'var(--text-primary)',
                                    transition: 'all var(--transition-fast)',
                                }}
                            />
                            <Search 
                                size={18} 
                                color="var(--text-muted)" 
                                style={{ 
                                    position: 'absolute', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)',
                                    [dir === 'rtl' ? 'left' : 'right']: 14,
                                }} 
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        {/* Language Switcher */}
                        <div className="hide-on-mobile">
                            <LanguageSwitcher compact />
                        </div>

                        {/* Notifications */}
                        <div style={{ position: 'relative' }} ref={notifsRef}>
                            <button
                                onClick={() => setShowNotifs(!showNotifs)}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border)',
                                    background: showNotifs ? 'var(--surface-hover)' : 'var(--surface)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'all var(--transition-fast)',
                                }}
                            >
                                <Bell size={18} color="var(--text-secondary)" />
                                {unreadCount > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 6,
                                        right: 6,
                                        minWidth: 18,
                                        height: 18,
                                        borderRadius: 9,
                                        background: 'var(--error)',
                                        border: '2px solid var(--surface)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: 'white',
                                    }}>
                                        {unreadCount}
                                    </div>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifs && (
                                <div style={{
                                    position: 'absolute',
                                    top: 52,
                                    insetInlineEnd: 0,
                                    width: 360,
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-xl)',
                                    boxShadow: 'var(--shadow-xl)',
                                    zIndex: 200,
                                    overflow: 'hidden',
                                    animation: 'fadeInScale 200ms ease',
                                }}>
                                    <div style={{ 
                                        padding: '16px 20px', 
                                        borderBottom: '1px solid var(--border)', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center' 
                                    }}>
                                        <span style={{ fontWeight: 700, fontSize: 15 }}>{t.common.notifications}</span>
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={markAllRead} 
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    cursor: 'pointer', 
                                                    color: 'var(--accent)', 
                                                    fontSize: 13, 
                                                    fontWeight: 600, 
                                                    fontFamily: 'inherit', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 4 
                                                }}
                                            >
                                                <Check size={14} /> {t.common.markAllRead}
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ maxHeight: 360, overflow: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                                                {t.common.noNotifications}
                                            </div>
                                        ) : notifications.map(n => (
                                            <div 
                                                key={n.id} 
                                                style={{
                                                    padding: '14px 20px',
                                                    borderBottom: '1px solid var(--border-light)',
                                                    background: n.is_read ? 'transparent' : 'var(--accent-muted)',
                                                    display: 'flex',
                                                    gap: 12,
                                                    alignItems: 'flex-start',
                                                    cursor: 'pointer',
                                                    transition: 'background var(--transition-fast)',
                                                }}
                                            >
                                                <div style={{ 
                                                    width: 8, 
                                                    height: 8, 
                                                    borderRadius: '50%', 
                                                    background: n.is_read ? 'transparent' : 'var(--accent)', 
                                                    marginTop: 6, 
                                                    flexShrink: 0 
                                                }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                                        {n.title_ar}
                                                    </div>
                                                    {n.message_ar && (
                                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                                                            {n.message_ar}
                                                        </div>
                                                    )}
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                                        {new Date(n.created_at).toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-GB')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 12, 
                            cursor: 'pointer',
                            padding: '6px 12px 6px 6px',
                            borderRadius: 'var(--radius-xl)',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            transition: 'all var(--transition-fast)',
                        }}>
                            <div className="avatar" style={{ width: 36, height: 36 }}>
                                {user?.name ? user.name[0].toUpperCase() : 'U'}
                            </div>
                            <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {user?.name || (lang === 'ar' ? 'المستخدم' : 'User')}
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {user?.role === 'admin' ? t.common.platformAdmin : t.common.merchant}
                                </span>
                            </div>
                            <ChevronDown size={14} color="var(--text-muted)" className="hide-on-mobile" />
                        </div>
                    </div>
                </header>

                {/* Status Banners */}
                {activeStore?.status === 'pending' && (
                    <div style={{ 
                        background: 'var(--warning-bg)', 
                        color: 'var(--warning-text)', 
                        padding: '12px 24px', 
                        fontSize: 14, 
                        fontWeight: 600, 
                        borderBottom: '1px solid rgba(245, 158, 11, 0.2)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10 
                    }}>
                        <AlertTriangle size={18} /> {t.dashboard.pendingApproval}
                    </div>
                )}
                {activeStore?.status === 'suspended' && (
                    <div style={{ 
                        background: 'var(--error-bg)', 
                        color: 'var(--error-text)', 
                        padding: '12px 24px', 
                        fontSize: 14, 
                        fontWeight: 600, 
                        borderBottom: '1px solid rgba(239, 68, 68, 0.2)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10 
                    }}>
                        <Ban size={18} /> {t.dashboard.storeSuspended}
                    </div>
                )}

                {/* Main Page Content */}
                <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {children}
                </main>
            </div>
        </div>
    )
}
