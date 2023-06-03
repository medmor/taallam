import '@/styles/globals.css'

import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  }
}


export default function RootLayout({ children, params }: RootLayoutProps) {
  const locale = useLocale();

  // Show a 404 error if the user requests an unknown locale
  if (params.locale !== locale) {
    notFound();
  }
  return (
    <html lang={locale} dir={locale == 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <Navbar />
        <div className="bg-green-500 h-full">
          {children}
        </div>
        <Footer></Footer>
      </body>
    </html>
  )
}
