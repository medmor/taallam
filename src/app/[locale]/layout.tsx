import '@/styles/globals.css'

import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';


import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  }
}


export default async function RootLayout({ children, params }: RootLayoutProps) {
  const locale = useLocale();
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.log(error);
  }

  // Show a 404 error if the user requests an unknown locale
  if (params.locale !== locale) {
    notFound();
  }
  return (
    <html lang={locale} dir={locale == 'ar' ? 'rtl' : 'ltr'}>
      <body className='bg-orange-600 '>
        <Navbar />
        <div className="h-full">
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </div>
        <Footer></Footer>
      </body>
    </html>
  )
}
