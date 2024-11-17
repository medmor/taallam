import "@/styles/globals.css";

import { NextIntlClientProvider } from "next-intl";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";


interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise< {
    locale: string;
  }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  let messages;
  let {locale } = await params
  try {
    messages = (await import(`../../../messages/${locale}.json`))
      .default;
  } catch (error) {
    console.log(error);
  }

  return (
    <html lang={locale} dir={locale == "ar" ? "rtl" : "ltr"}>
      <body style={{ backgroundColor: "#94D8FB" }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* <Preloader /> */}

          <Navbar />
          <div
            className="relative min-h-[80vh] overflow-hidden bg-cover bg-no-repeat"
            style={{ backgroundImage: 'url("/images/home/bannerT.jpg")' }}
          >
            {children}
          </div>
          <div
            className="relative -mt-1 h-[200px] bg-cover bg-no-repeat"
            style={{ backgroundImage: 'url("/images/home/bannerB.jpg")' }}
          >
            <div className="absolute bottom-0 flex w-full items-end justify-around">
              <Image
                className="h-auto w-[400px] "
                src="/images/home/kids.png"
                alt="kids"
                width={400}
                height={400}
              />
              <Image
                className="hidden h-auto w-[400px] md:block "
                src="/images/home/kids1.png"
                alt="kids"
                width={400}
                height={400}
              />
            </div>
          </div>
          <Footer></Footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
