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
    // dir and lang are set dynamically by LanguageProvider on the client.
    // Default to RTL Arabic for SSR / first paint.
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
