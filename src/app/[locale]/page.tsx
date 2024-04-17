
import { useTranslations, } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { CloudHomeImage, EmptyCloudHomeImage } from '@/components/Shared/CloudHomeImage';
import { rnd } from '@/helpers/random';


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
        top={90}
        transition={randomTransion()}
      />
      <CloudHomeImage
        label={t("Primary")}
        href={`/${params.locale}/courses/primary3`}
        imageUrl='/images/home/primary.jpg'
        top={190}
        transition={randomTransion()}
      />
      <CloudHomeImage
        label={t("Stories")}
        href={`/${params.locale}/stories`}
        imageUrl='/images/home/stories.jpg'
        top={290}
        transition={randomTransion()}
      />
      <EmptyCloudHomeImage
        top={150}
        transition={{ duration: rnd(8, 12), animate: 'calc(100vw + 400px)', initial: '0vw' }}
      />
      <EmptyCloudHomeImage
        top={230}
        transition={{ duration: rnd(8, 12), animate: 'calc(100vw + 400px)', initial: '0vw' }}
      />

    </div>
  );
}

const randomTransion = () => (
  {
    duration: rnd(8, 12),
    initial: `calc(${rnd(0, 8)}vw - 200px)`,
    animate: `calc(${rnd(50, 60)}vw)`,

  }
)