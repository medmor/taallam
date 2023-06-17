
import { useLocale, useTranslations } from 'next-intl';

import HomeCard from '@/components/HomeCard';

export default function Home() {
  const t = useTranslations('home');
  const locale = useLocale()

  return (
    <div className="min-h-[85vh] flex flex-col p-10 ">
      <div className='bg-white text-2xl p-10 max-w-2xl rounded-full m-auto font-bold text-center'>
        {t("heading")}
      </div>
      <div className="flex flex-wrap justify-center gap-5 p-10">
        <HomeCard label={t("Preschool")} href={`/${locale}/courses/preschool2`} />
        <HomeCard label={t("Primary")} href={`/${locale}/courses/primary3`} />
        <HomeCard label={t("Stories")} href={`/${locale}/stories`} />
      </div>
    </div>
  );
}

