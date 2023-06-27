
import { useLocale, useTranslations, } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import HomeCard from '@/components/HomeCard';
import Image from 'next/image';


export async function generateMetadata() {
  const t = await getTranslations('home');
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription")
  }
}
export default function Home() {
  const t = useTranslations('home');
  const locale = useLocale()

  return (
    <div className="min-h-[85vh] flex flex-col border-t-orange-200 border-t ">
      <div className='bg-white text-2xl p-5 w-full m-auto font-bold text-center'>
        <Image
          className='rounded-full m-auto mb-5'
          src='/images/home/hibahamza.jpg'
          alt='hiba hamza image'
          width={300}
          height={300}
          unoptimized
        />
        {t("heading")}
      </div>
      <div className="flex flex-wrap justify-center gap-5 p-10">
        <HomeCard
          label={t("Preschool")}
          href={`/${locale}/courses/preschool2`}
          imageUrl='/images/home/preschool.jpg'
        />
        <HomeCard
          label={t("Primary")}
          href={`/${locale}/courses/primary3`}
          imageUrl='/images/home/primary.jpg'
        />
        <HomeCard
          label={t("Stories")}
          href={`/${locale}/stories`}
          imageUrl='/images/home/stories.jpg'
        />
      </div>
    </div>
  );
}

