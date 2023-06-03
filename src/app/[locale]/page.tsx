
import { useLocale, useTranslations } from 'next-intl';

import HomeCard from '@/components/HomeCard';

export default function Home() {
  const t = useTranslations('home');
  const locale = useLocale()

  return (
    <div className="p-5 flex items-center min-h-[80vh]">
      <div className="flex flex-wrap gap-5 m-auto h-full items-stretch">
        <HomeCard label={t("Preschool 2")} href={`/${locale}/courses/preschool.2`} />
        <HomeCard label={t("Primary 3")} href={`/${locale}/courses/primary.3`} />
        <HomeCard label={t("Stories")} href={`/${locale}/stories`} />
      </div>
    </div>
  );
}

