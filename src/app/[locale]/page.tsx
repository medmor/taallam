
import { useLocale, useTranslations } from 'next-intl';

import HomeCard from '@/components/HomeCard';

export default function Home() {
  const t = useTranslations('home');
  const locale = useLocale()

  return (
    <div className="flex justify-center items-center min-h-[85vh]">
      <div className="flex flex-wrap justify-center gap-5">
        <HomeCard label={t("Preschool 2")} href={`/${locale}/courses/preschool.2`} />
        <HomeCard label={t("Primary 3")} href={`/${locale}/courses/primary.3`} />
        <HomeCard label={t("Stories")} href={`/${locale}/stories`} />
      </div>
    </div>
  );
}

