import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { LanguageProvider } from '@/i18n/LanguageContext'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'تجارنا | منصة التجارة الإلكترونية',
    template: '%s | تجارنا',
  },
  description: 'أنشئ متجرك الإلكتروني في دقائق. بيع منتجاتك عبر الإنترنت، واستقبل الدفعات بسهولة.',
  keywords: ['تجارة إلكترونية', 'متجر إلكتروني', 'الأردن', 'بيع اونلاين', 'e-commerce'],
  openGraph: {
    title: 'تجارنا | منصة التجارة الإلكترونية',
    description: 'ابدأ متجرك الإلكتروني في دقائق',
    locale: 'ar_JO',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* IBM Plex Sans Arabic — global font for Arabic + Latin */}
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols — kept for legacy icon usage */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
