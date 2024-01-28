
import { useTranslations, } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import HomeCard from '@/components/Shared/HomeCard';
import Image from 'next/image';


export async function generateMetadata() {
  const t = await getTranslations('home');
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription")
  }
}

interface HomeProps {
  params: {
    locale: string;
  }
}
export default function Home({ params }: HomeProps) {
  const t = useTranslations('home');

  return (
    <div className="min-h-[85vh] flex flex-col border-t-orange-200 border-t ">
      <div className='bg-white text-2xl p-5 w-full m-auto font-bold text-center'>
        <Image
          className='rounded-full m-auto mb-5'
          src='/images/home/hibahamza.jpg'
          alt='hiba hamza image'
          width={400}
          height={400}
          unoptimized
        />
        {/* {t("heading")} */}
      </div>
      <div className="flex flex-wrap justify-center gap-5 p-10">
        <HomeCard
          label={t("Preschool")}
          href={`/${params.locale}/courses/preschool2`}
          imageUrl='/images/home/preschool.jpg'
        />
        <HomeCard
          label={t("Primary")}
          href={`/${params.locale}/courses/primary3`}
          imageUrl='/images/home/primary.jpg'
        />
        <HomeCard
          label={t("Stories")}
          href={`/${params.locale}/stories`}
          imageUrl='/images/home/stories.jpg'
        />
      </div>
    </div>
  );
}

