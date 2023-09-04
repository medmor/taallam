import { useLocale } from 'next-intl';
import { getTranslator } from 'next-intl/server';

import { getEntryById } from '@/lib/contentful/client'
import { parseQuizzes, parseSummary } from '@/lib/contentful/helpers';
import CourseContent from '@/components/content/CourseContent';


export async function generateMetadata({ params: { locale } }: any) {
    const t = await getTranslator(locale, 'home');
    return {
        title: t("metadataTitle"),
        description: t("metadataDescription")
    }
}

interface StoryPageProps {
    params: {
        id: string;
    }
}

export default async function StoryPage({ params }: StoryPageProps) {
    const locale = useLocale();
    const story = await getEntryById(params.id, locale == 'en' ? 'en-US' : locale);

    const medias: any = []
    const texts: any[] = []
    const audios: any[] = [`/audios/${story.sys.id}/${locale}/audio.mp3`]
    await parseSummary(story.fields.summary, texts, medias, audios)
    const quizzes = parseQuizzes(story.fields.activities)


    return (
        <>
            <CourseContent
                texts={texts.filter(t => t)}
                medias={medias}
                audios={audios}
                quizzes={quizzes}
                lessons={story.fields.objectifs}
            />
        </>
    )
}
