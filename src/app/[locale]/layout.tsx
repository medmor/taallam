import '@/styles/globals.css'

import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';


import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/Footer'

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  }
}


export default async function RootLayout({ children, params }: RootLayoutProps) {
  let locale = useLocale();
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.log(error);
  }

  // Show a 404 error if the user requests an unknown locale
  if (params.locale !== locale) {
    locale = params.locale
  }
  return (
    <html lang={locale} dir={locale == 'ar' ? 'rtl' : 'ltr'}>
      <body className='bg-orange-600 '>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <div className="h-full">
            {children}
          </div>
        </NextIntlClientProvider>
        <Footer></Footer>
      </body>
    </html>
  )
}
