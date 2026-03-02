'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Tag,
    Settings,
    Store,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
    { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'المنتجات', icon: Package },
    { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingCart },
    { href: '/dashboard/customers', label: 'العملاء', icon: Users },
    { href: '/dashboard/analytics', label: 'التحليلات', icon: BarChart3 },
    { href: '/dashboard/discounts', label: 'الخصومات', icon: Tag },
    { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const supabase = createClient()
    const router = useRouter()

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [stores, setStores] = useState<any[]>([])
    const [activeStore, setActiveStore] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser()
                if (!authUser) {
                    router.push('/login')
                    return
                }

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
                } else if (!pathname.includes('/dashboard/setup')) {
                    // router.push('/dashboard/setup')
                }
            } catch (err) {
                console.error('Error loading dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [supabase, router, pathname])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
            <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--primary)', borderTopColor: 'transparent' }} />
        </div>
    )

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 99,
                    }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`sidebar ${sidebarOpen ? 'open' : ''}`}
                style={{
                    background: 'var(--surface)',
                    borderLeft: '1px solid var(--border)',
                    borderRight: 'none',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        padding: '24px 20px 20px',
                        borderBottom: '1px solid var(--border)',
                    }}
                >
                    <Link
                        href="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            textDecoration: 'none',
                        }}
                    >
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(108,60,225,0.3)',
                                flexShrink: 0,
                            }}
                        >
                            <Store size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-primary)' }}>
                                مزيدي
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                                لوحة التاجر
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Store selector */}
                <div
                    style={{
                        margin: '16px 12px',
                        padding: '12px 14px',
                        background: 'linear-gradient(135deg, rgba(108,60,225,0.08), rgba(139,92,246,0.05))',
                        border: '1px solid rgba(108,60,225,0.15)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 8,
                                background: 'linear-gradient(135deg, #6C3CE1, #8B5CF6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>م</span>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                                {activeStore?.name_ar || 'جاري التحميل...'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                {activeStore?.slug ? `mazidi.com/${activeStore.slug}` : 'متجر جديد'}
                            </div>
                        </div>
                    </div>
                    <ChevronDown size={16} color="var(--text-secondary)" />
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

                {/* Bottom */}
                <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
                    <Link href="/store/preview" className="nav-item" style={{ marginBottom: 4 }}>
                        <Store size={18} />
                        عرض المتجر
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="nav-item"
                        style={{ width: '100%', textAlign: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                    >
                        <LogOut size={18} />
                        تسجيل الخروج
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="main-with-sidebar" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Topbar */}
                <header
                    style={{
                        height: 64,
                        background: 'var(--surface)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 24px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 40,
                    }}
                >
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            display: 'none',
                            padding: 4,
                        }}
                        className="lg:hidden"
                    >
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    {/* Page breadcrumb - filled by children via context (simplified here) */}
                    <div />

                    {/* Right actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Notifications */}
                        <button
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 10,
                                border: '1px solid var(--border)',
                                background: 'var(--surface)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                            }}
                        >
                            <Bell size={18} color="var(--text-secondary)" />
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: '#EF4444',
                                    border: '2px solid var(--surface)',
                                }}
                            />
                        </button>

                        {/* User avatar */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                cursor: 'pointer',
                            }}
                        >
                            <div className="avatar">{user?.name ? user.name[0] : 'U'}</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {user?.name || 'مستخدم مزيدي'}
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                    {user?.role === 'admin' ? 'مدير المنصة' : 'تاجر'}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, overflow: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}
