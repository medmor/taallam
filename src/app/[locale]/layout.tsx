import '@/styles/globals.css'

import { NextIntlClientProvider } from 'next-intl';


import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/layout/Footer'
import Image from 'next/image';

import Preloader from '@/components/layout/Preloader'

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
      <body style={{ backgroundColor: "#94D8FB" }}>
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <Preloader />

          <Navbar />
          <div
            className="min-h-[80vh] bg-no-repeat bg-cover relative overflow-hidden"
            style={{ backgroundImage: 'url("/images/home/bannerT.jpg")' }}>
            {children}
          </div>
          <div
            className="bg-no-repeat bg-cover h-[200px] -mt-1 relative"
            style={{ backgroundImage: 'url("/images/home/bannerB.jpg")' }}
          >
            <div className='flex absolute bottom-0 w-full justify-around items-end'>
              <Image
                className="w-[400px] h-auto "
                src="/images/home/kids.png" alt="kids"
                width={400}
                height={400}
              />
              <Image
                className="w-[400px] h-auto hidden md:block "
                src="/images/home/kids1.png" alt="kids"
                width={400}
                height={400}
              />
            </div>
          </div>
          <Footer></Footer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
