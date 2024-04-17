
import { useTranslations, } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { CloudHomeImage } from '@/components/Shared/CloudHomeImage';


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
    <div className="h-full overflow-hidden">
      <CloudHomeImage
        label={t("Preschool")}
        href={`/${params.locale}/courses/preschool2`}
        imageUrl='/images/home/preschool.png'
        top={100}
        transition={{ duration: 10, animate: '70vw', initial: '30vw' }}
      />
      <CloudHomeImage
        label={t("Primary")}
        href={`/${params.locale}/courses/primary3`}
        imageUrl='/images/home/primary.jpg'
        top={200}
        transition={{ duration: 10, animate: '30vw', initial: '70vw' }}
      />
      <CloudHomeImage
        label={t("Stories")}
        href={`/${params.locale}/stories`}
        imageUrl='/images/home/stories.jpg'
        top={300}
        transition={{ duration: 10, animate: '70vw', initial: '30vw' }}
      />
    </div>
  );
}

