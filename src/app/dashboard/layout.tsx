'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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

    const navItems = [
        { href: '/dashboard', label: t.nav.dashboard || 'Overview', icon: 'dashboard' },
        { href: '/dashboard/products', label: t.nav.products || 'Products', icon: 'inventory_2' },
        { href: '/dashboard/orders', label: t.nav.orders || 'Orders', icon: 'shopping_cart' },
        { href: '/dashboard/customers', label: t.nav.customers || 'Customers', icon: 'group' },
        { href: '/dashboard/analytics', label: t.nav.analytics || 'Analytics', icon: 'analytics' },
        { href: '/dashboard/apps', label: (t.nav as any).apps || 'Apps', icon: 'grid_view' },
        { href: '/dashboard/settings', label: t.nav.settings || 'Settings', icon: 'settings' },
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

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    return (
        <div dir={dir} className="bg-background text-on-background min-h-screen flex flex-col md:flex-row antialiased">
            {/* Desktop Navigation Drawer */}
            <aside className="hidden md:flex flex-col py-6 px-4 space-y-2 h-screen w-72 border-r border-surface-variant rounded-r-lg bg-surface-container-lowest shadow-[0px_12px_32px_rgba(26,43,60,0.05)] sticky top-0 shrink-0 z-50">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="h-10 w-10 rounded-lg bg-surface-variant overflow-hidden border border-outline-variant shrink-0 flex items-center justify-center text-on-surface font-h3 font-bold">
                        {activeStore?.name_ar ? activeStore.name_ar[0] : 'S'}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-primary font-h3 text-h3 leading-none truncate max-w-[180px]">
                            {activeStore?.name_ar || 'My Store'}
                        </h2>
                        <div className="flex flex-col gap-0.5 mt-1">
                            <span className="font-caption text-caption text-on-surface-variant">Premium Merchant</span>
                            <span className="font-caption text-caption text-on-surface-variant/70 truncate max-w-[180px]">
                                {activeStore?.slug ? `${activeStore.slug}.tojjarna.com` : 'Amman, JO'}
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="flex flex-col gap-1 flex-grow overflow-y-auto pb-4">
                    {navItems.map((item) => {
                        const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-manrope text-sm font-medium ease-out duration-200 ${
                                    isActive 
                                    ? 'bg-primary/10 text-primary border-l-4 border-primary rtl:border-l-0 rtl:border-r-4' 
                                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]" data-icon={item.icon} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="pt-4 border-t border-surface-variant mt-auto">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-lg font-manrope text-sm font-medium text-error hover:bg-error-container/50 text-left transition-colors">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        {t.nav.logout || 'Logout'}
                    </button>
                </div>
            </aside>

            {/* Mobile Top AppBar */}
            <header className="md:hidden flex justify-between items-center w-full px-6 h-16 bg-surface-container-lowest border-b border-surface-variant shadow-sm sticky top-0 z-40">
                <button onClick={() => setSidebarOpen(true)} className="text-on-surface-variant hover:bg-primary/5 transition-colors p-2 rounded-full active:opacity-80">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <span className="font-manrope font-semibold tracking-tight text-xl font-bold text-primary tracking-wide">
                    {activeStore?.name_ar || 'Merchant Central'}
                </span>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant flex items-center justify-center font-bold text-sm text-on-surface">
                        {user?.name ? user.name[0] : 'U'}
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-[100] flex">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="relative flex flex-col py-6 px-4 space-y-2 h-screen w-72 bg-surface-container-lowest border-r border-surface-variant shadow-xl">
                        <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-2 text-on-surface-variant">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="flex items-center gap-3 mb-8 px-2 mt-8">
                            <div className="w-12 h-12 rounded-lg bg-surface-variant border border-outline-variant shrink-0 flex items-center justify-center font-h3 font-bold">{activeStore?.name_ar ? activeStore.name_ar[0] : 'S'}</div>
                            <div>
                                <h2 className="text-lg font-bold text-primary font-h3 leading-none truncate max-w-[160px]">{activeStore?.name_ar || 'My Store'}</h2>
                            </div>
                        </div>
                        <nav className="flex flex-col gap-1 flex-grow overflow-y-auto">
                            {navItems.map((item) => {
                                const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
                                return (
                                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-manrope text-sm font-medium ${isActive ? 'bg-primary/10 text-primary border-l-4 border-primary rtl:border-l-0 rtl:border-r-4' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'}`}>
                                        <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                                        {item.label}
                                    </Link>
                                )
                            })}
                            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full rounded-lg font-manrope text-sm font-medium text-error hover:bg-error-container/50 text-left mt-auto">
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                {t.nav.logout || 'Logout'}
                            </button>
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen w-full relative pb-24 md:pb-0 min-w-0 bg-background">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 pb-safe bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-variant rounded-t-2xl z-50 shadow-[0px_-4px_20px_rgba(26,43,60,0.08)]">
                {[
                    { href: '/dashboard', icon: 'home', label: t.nav.dashboard || 'Home' },
                    { href: '/dashboard/products', icon: 'inventory_2', label: t.nav.products || 'Catalog' },
                    { href: '/dashboard/orders', icon: 'shopping_cart', label: t.nav.orders || 'Orders' },
                    { href: '/dashboard/settings', icon: 'person', label: t.nav.settings || 'Account' },
                ].map((item) => {
                    const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
                    return (
                        <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center font-manrope text-[10px] uppercase tracking-widest active:scale-95 duration-150 ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                            {isActive ? (
                                <div className="bg-primary/10 rounded-xl px-4 py-1 mb-1">
                                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                                </div>
                            ) : (
                                <span className="material-symbols-outlined mb-1">{item.icon}</span>
                            )}
                            <span className="mt-0.5">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
