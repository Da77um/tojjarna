'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/LanguageContext'

export default function CustomersPage() {
    const supabase = createClient()
    const { t, dir } = useLanguage()
    const [search, setSearch] = useState('')
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'vip' | 'active'>('all')

    useEffect(() => {
        async function fetchCustomers() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user.id)
                if (!stores || stores.length === 0) return
                const { data, error } = await supabase
                    .from('customers').select('*').in('store_id', stores.map(s => s.id))
                    .order('created_at', { ascending: false })
                if (error) throw error
                setCustomers(data || [])
            } catch (err) {
                console.error('Error fetching customers:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchCustomers()
    }, [supabase])

    const filtered = customers.filter(c => {
        const matchesSearch = c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
        if (!matchesSearch) return false
        
        if (filter === 'vip') return c.total_spent > 100 // Arbitrary threshold for VIP
        if (filter === 'active') return c.total_orders > 0
        return true
    })

    if (loading) return (
        <div className="flex-1 p-4 lg:p-8 space-y-6">
            <div className="h-32 rounded-2xl bg-surface-container-highest animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-surface-container animate-pulse"></div>)}
            </div>
        </div>
    )

    return (
        <div dir={dir} className="p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto w-full">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface tracking-tight font-h1">{t.customers.title || 'Customers Management'}</h1>
                    <p className="text-on-surface-variant mt-1 font-manrope">
                        {customers.length} {t.customers.customersInStore || 'Total Profiles'}
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest p-4 rounded-[1.5rem] border border-surface-variant shadow-sm">
                
                {/* Search */}
                <div className="relative w-full md:max-w-md">
                    <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2 left-4 rtl:left-auto rtl:right-4 text-on-surface-variant">search</span>
                    <input 
                        type="search" 
                        placeholder={t.customers.searchPlaceholder || 'Search names, phones...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-container-low border hover:border-outline focus:border-primary border-outline-variant rounded-full py-2.5 pl-11 pr-4 rtl:pl-4 rtl:pr-11 text-sm text-on-surface outline-none transition-colors"
                    />
                </div>

                {/* Filters */}
                <div className="flex bg-surface-container-low rounded-full p-1 border border-surface-variant w-full md:w-auto overflow-x-auto">
                    {[
                        { id: 'all', label: 'All Customers' },
                        { id: 'vip', label: 'VIP' },
                        { id: 'active', label: 'Active' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as any)}
                            className={`flex-1 md:flex-none px-6 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                filter === f.id
                                ? 'bg-white text-on-surface shadow-sm border border-outline-variant'
                                : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-surface-container-lowest rounded-[2rem] border border-surface-variant">
                    <div className="h-20 w-20 bg-surface-container rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[40px]">group_off</span>
                    </div>
                    <h3 className="text-xl font-bold text-on-surface">{t.customers.noCustomers || 'No customers found'}</h3>
                    <p className="text-on-surface-variant mt-2">{t.customers.noCustomersDesc || 'Try adjusting your search criteria.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(customer => {
                        const isVip = customer.total_spent > 100;
                        return (
                            <div key={customer.id} className="bg-surface-container-lowest rounded-3xl border border-surface-variant p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                {/* Decorator */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-fixed to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="relative">
                                    <div className="w-20 h-20 bg-surface-variant border-2 border-surface-container-highest rounded-full flex items-center justify-center text-2xl font-bold text-primary mb-4 shadow-inner">
                                        {(customer.full_name || 'U')[0]}
                                    </div>
                                    {isVip && (
                                        <div className="absolute -bottom-2 -right-2 bg-warning text-on-error w-8 h-8 rounded-full flex items-center justify-center shadow-md border-[3px] border-surface-container-lowest" title="VIP Customer">
                                            <span className="material-symbols-outlined text-[16px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className="font-bold text-on-surface text-lg font-h3 mb-1 truncate w-full" title={customer.full_name}>{customer.full_name}</h3>
                                
                                <div className="flex items-center gap-1.5 text-on-surface-variant text-sm bg-surface-container-low px-3 py-1 rounded-full mb-6">
                                    <span className="material-symbols-outlined text-[16px]">call</span>
                                    <span dir="ltr">{customer.phone}</span>
                                </div>

                                <div className="w-full grid grid-cols-2 gap-2 border-t border-surface-variant pt-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">Orders</span>
                                        <span className="text-lg font-extrabold text-on-surface font-manrope">{customer.total_orders || 0}</span>
                                    </div>
                                    <div className="flex flex-col border-l border-surface-variant rtl:border-l-0 rtl:border-r pl-2 rtl:pl-0 rtl:pr-2">
                                        <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-1">Spent</span>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-lg font-extrabold text-primary font-manrope">{(customer.total_spent || 0).toFixed(0)}</span>
                                            <span className="text-[10px] uppercase font-bold text-on-surface-variant">JOD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
