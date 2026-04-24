'use client'

import { useState } from 'react'
import { useLanguage } from '@/i18n/LanguageContext'

export default function AppsMarketplacePage() {
    const { t, dir } = useLanguage()
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('all')

    const tabs = [
        { id: 'all', label: 'All Apps' },
        { id: 'shipping', label: 'Shipping & Delivery' },
        { id: 'payments', label: 'Payment Gateways' },
        { id: 'marketing', label: 'Marketing' },
        { id: 'analytics', label: 'Analytics' },
    ]

    const apps = [
        {
            id: '1',
            name: 'Aramex Integration',
            description: 'Automate your shipping and fulfillment across the MENA region with real-time tracking.',
            icon: 'local_shipping',
            category: 'shipping',
            color: 'bg-[#e21a22] text-white',
            installed: true,
            featured: true
        },
        {
            id: '2',
            name: 'Thawani Pay',
            description: 'Secure Oman-based payment gateway for your customers. Zero hidden fees.',
            icon: 'payments',
            category: 'payments',
            color: 'bg-[#003865] text-white',
            installed: false,
            featured: true
        },
        {
            id: '3',
            name: 'Mailchimp Sync',
            description: 'Sync your customers and orders directly to Mailchimp for automated campaigns.',
            icon: 'mark_email_read',
            category: 'marketing',
            color: 'bg-[#ffe01b] text-black',
            installed: false,
            featured: false
        },
        {
            id: '4',
            name: 'Google Analytics 4',
            description: 'Advanced store analytics, conversions tracking, and user behavior flows.',
            icon: 'analytics',
            category: 'analytics',
            color: 'bg-[#fbbc04] text-black',
            installed: true,
            featured: false
        },
        {
            id: '5',
            name: 'Stripe Global',
            description: 'Accept credit cards, Apple Pay, and Google Pay from international customers.',
            icon: 'credit_card',
            category: 'payments',
            color: 'bg-[#635bff] text-white',
            installed: false,
            featured: true
        },
        {
            id: '6',
            name: 'WhatsApp Business',
            description: 'Send automated order notifications and chat with customers live.',
            icon: 'chat',
            category: 'marketing',
            color: 'bg-[#25d366] text-white',
            installed: false,
            featured: true
        }
    ]

    const filtered = apps.filter(app => {
        const matchesTab = activeTab === 'all' || app.category === activeTab
        const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || app.description.toLowerCase().includes(search.toLowerCase())
        return matchesTab && matchesSearch
    })

    return (
        <div dir={dir} className="p-4 lg:p-8 space-y-8 max-w-[1440px] mx-auto w-full">
            
            {/* Header & Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-surface-container-lowest p-8 rounded-[2rem] border border-surface-variant shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                
                <div className="relative z-10 w-full lg:w-auto">
                    <span className="inline-block px-3 py-1 bg-tertiary-container text-on-tertiary-container font-bold text-xs uppercase tracking-widest rounded-full mb-3">Integrations</span>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight font-h1 leading-tight">App Marketplace</h1>
                    <p className="text-on-surface-variant mt-2 font-manrope text-lg max-w-xl">
                        Power up your Merchant Central store with localized tools and global services.
                    </p>
                </div>

                <div className="relative z-10 w-full lg:w-96">
                    <span className="material-symbols-outlined absolute top-1/2 -translate-y-1/2 left-4 rtl:left-auto rtl:right-4 text-on-surface-variant">search</span>
                    <input 
                        type="search" 
                        placeholder="Search apps..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-container border focus:bg-white focus:border-primary focus:shadow-md border-outline-variant rounded-full py-4 pl-12 pr-6 rtl:pl-6 rtl:pr-12 text-sm text-on-surface outline-none transition-all"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                            activeTab === tab.id
                            ? 'bg-primary text-on-primary border-primary shadow-md'
                            : 'bg-surface-container-lowest text-on-surface border-surface-variant hover:bg-surface-variant/50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(app => (
                    <div key={app.id} className="bg-surface-container-lowest rounded-[2rem] border border-surface-variant p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all group duration-300 relative overflow-hidden">
                        
                        {/* Decorator line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-surface-variant to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${app.color}`}>
                                <span className="material-symbols-outlined text-[28px]">{app.icon}</span>
                            </div>
                            
                            {app.installed ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-lg">
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                    Installed
                                </span>
                            ) : app.featured ? (
                                <span className="flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 px-3 py-1.5 rounded-lg">
                                    <span className="material-symbols-outlined text-[14px]">star</span>
                                    Popular
                                </span>
                            ) : null}
                        </div>
                        
                        <h3 className="text-xl font-bold text-on-surface mb-2 font-h3">{app.name}</h3>
                        <p className="text-on-surface-variant text-sm font-manrope leading-relaxed flex-grow">
                            {app.description}
                        </p>
                        
                        <div className="mt-6 pt-6 border-t border-surface-variant flex gap-3">
                            {app.installed ? (
                                <button className="flex-1 bg-surface-variant text-on-surface-variant font-bold py-3 rounded-xl hover:bg-surface-container-high transition-colors text-sm">
                                    Configure
                                </button>
                            ) : (
                                <button className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-xl shadow-md shadow-primary/20 hover:bg-surface-tint hover:shadow-lg transition-all text-sm group-hover:scale-[1.02]">
                                    Install App
                                </button>
                            )}
                            <button className="w-12 flex items-center justify-center bg-surface-container-lowest border border-outline-variant text-on-surface rounded-xl hover:bg-surface-variant transition-colors group-hover:border-on-surface-variant">
                                <span className="material-symbols-outlined text-[20px]">info</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-24 text-center bg-surface-container-low rounded-[2rem] border border-dashed border-outline-variant">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-4">search_off</span>
                    <h3 className="text-xl font-bold text-on-surface mb-2">No apps found</h3>
                    <p className="text-on-surface-variant">Try a different search term or category.</p>
                </div>
            )}
        </div>
    )
}
