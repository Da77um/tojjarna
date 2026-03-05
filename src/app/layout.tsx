import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'باسكت | منصة التجارة الإلكترونية الأردنية',
    template: '%s | باسكت',
  },
  description: 'أنشئ متجرك الإلكتروني في دقائق. بيع منتجاتك عبر الإنترنت، واستقبل الدفعات بسهولة في الأردن.',
  keywords: ['تجارة إلكترونية', 'متجر إلكتروني', 'الأردن', 'بيع اونلاين', 'e-commerce Jordan'],
  openGraph: {
    title: 'باسكت | منصة التجارة الإلكترونية الأردنية',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Lalezar&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="top-center"
          dir="rtl"
        />
      </body>
    </html>
  )
}
