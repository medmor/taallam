
import useTranslation from 'next-translate/useTranslation'

import HomeCard from '@/components/HomeCard';

export default async function Home() {
  const { t, lang } = useTranslation('home')

  return (
    <div className="p-5 flex items-center h-full">
      <div className="flex flex-wrap gap-5 m-auto">
        <HomeCard label={t("Preschool 2")} href='/courses/preschool.2' />
        <HomeCard label={t("Primary 3")} href='/courses/primary.3' />
        <HomeCard label={t("Stories")} href='/stories' />
      </div>
    </div>
  );
}

