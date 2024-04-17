
import { useTranslations, } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { CloudHomeImage, EmptyCloudHomeImage } from '@/components/Shared/CloudHomeImage';
import { rnd } from '@/helpers/random';
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
    <div className="h-full w-full overflow-hidden" dir='ltr'>
      <CloudHomeImage
        label={t("Preschool")}
        href={`/${params.locale}/courses/preschool2`}
        imageUrl='/images/home/preschool.png'
        top={20}
        transition={randomTransion()}
      />
      <CloudHomeImage
        label={t("Primary")}
        href={`/${params.locale}/courses/primary3`}
        imageUrl='/images/home/primary.jpg'
        top={120}
        transition={randomTransion()}
      />
      <CloudHomeImage
        label={t("Stories")}
        href={`/${params.locale}/stories`}
        imageUrl='/images/home/stories.jpg'
        top={220}
        transition={randomTransion()}
      />
      <EmptyCloudHomeImage
        top={90}
        transition={{ duration: rnd(8, 12), initial: '-400px', animate: 'calc(100vw + 400px)' }}
      />
      <EmptyCloudHomeImage
        top={230}
        transition={{ duration: rnd(8, 12), initial: '-400px', animate: 'calc(100vw + 400px)' }}
      />
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
  );
}

const randomTransion = () => (
  {
    duration: rnd(8, 12),
    initial: 'calc(50vw-300px)',
    animate: `calc(50vw + 0px)`,

  }
)