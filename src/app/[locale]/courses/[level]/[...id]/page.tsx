import { useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { getEntryById } from '@/lib/contentful/client'
import { parseQuizzes, parseSummary } from '@/lib/contentful/helpers';
import CourseContent from '@/components/content/CourseContent';

export async function generateMetadata() {
    const t = await getTranslations('home');
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

export default async function CoursePage({ params }: StoryPageProps) {
    const locale = useLocale();
    const course = await getEntryById(params.id, locale == 'en' ? 'en-US' : locale);

    const medias: any = []
    const texts: any[] = []
    const audios: any[] = [`/audios/${course.sys.id}/${locale}/audio.mp3`]
    await parseSummary(course.fields.summary, texts, medias, audios)
    const quizzes = parseQuizzes(course.fields.activities)

    return (
        <>
            <CourseContent
                texts={texts.filter(t => t)}
                medias={medias}
                audios={audios}
                quizzes={quizzes}
                lessons={course.fields.objectifs}
            />
        </>
    )
}
