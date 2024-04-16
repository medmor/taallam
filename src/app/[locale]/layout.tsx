import '@/styles/globals.css'

import { NextIntlClientProvider } from 'next-intl';


import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/layout/Footer'

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  }
}


export default async function RootLayout({ children, params }: RootLayoutProps) {
  let messages;
  try {
    messages = (await import(`../../../messages/${params.locale}.json`)).default;
  } catch (error) {
    console.log(error);
  }

  // Show a 404 error if the user requests an unknown locale
  if (params.locale !== params.locale) {
    params.locale = params.locale
  }


  return (
    <html lang={params.locale} dir={params.locale == 'ar' ? 'rtl' : 'ltr'} >
      <body className='bg-orange-600 '>
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <Navbar />
          <div>
            {children}
          </div>
          <Footer></Footer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
