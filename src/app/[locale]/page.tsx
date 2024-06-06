
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
        top={30}
        transition={randomTransion()}
      />
      <CloudHomeImage
        label={t("Primary")}
        href={`/${params.locale}/courses/primary3`}
        imageUrl='/images/home/primary.jpg'
        top={160}
        transition={randomTransion()}
      />
      <CloudHomeImage
        label={t("Stories")}
        href={`/${params.locale}/stories`}
        imageUrl='/images/home/stories.jpg'
        top={280}
        transition={randomTransion()}
      />
      <EmptyCloudHomeImage
        ease='linear'
        top={100}
        transition={{ duration: rnd(12, 20), initial: '-400px', animate: 'calc(100vw + 400px)' }}
      />
      <EmptyCloudHomeImage
        ease='linear'
        top={220}
        transition={{ duration: rnd(12, 20), initial: '-400px', animate: 'calc(100vw + 400px)' }}
      />
      <EmptyCloudHomeImage
        ease='linear'
        top={120}
        transition={{ duration: rnd(12, 20), initial: '-400px', animate: 'calc(100vw + 400px)' }}
      />
      <EmptyCloudHomeImage
        ease='linear'
        top={240}
        transition={{ duration: rnd(12, 20), initial: '-400px', animate: 'calc(100vw + 400px)' }}
      />
    </div>
  );
}

const randomTransion = () => (
  {
    duration: rnd(4, 8),
    initial: 'calc(50vw-300px)',
    animate: `calc(50vw + 0px)`,

  }
)

/*
// Photos from https://citizenofnowhe.re/lines-of-the-city
"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import "./globals.css";

function useParallax(value, distance) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function Image({ id }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useParallax(scrollYProgress, 300);

  return (
    <section>
      <div ref={ref}>
        <img src={`/${id}.jpg`} alt="A London skyscraper" />
      </div>
      <motion.h2 style={{ y }}>{`#00${id}`}</motion.h2>
    </section>
  );
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      {[1, 2, 3, 4, 5].map((image) => (
        <Image id={image} />
      ))}
      <motion.div className="progress" style={{ scaleX }} />
    </>
  );
}

*/