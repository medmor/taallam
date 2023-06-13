import { useLocale } from 'next-intl';
import { getEntryById } from '@/lib/contentful/client'
import Stroy from '../../../stories/[id]/components/Story';
import { getImageUrl, parseQuizzes, parseSummary } from '@/lib/contentful/helpers';

interface StoryPageProps {
    params: {
        id: string;
    }
}

export default async function CoursePage({ params }: StoryPageProps) {
    const locale = useLocale();
    const course = await getEntryById(params.id, locale == 'en' ? 'en-US' : locale);

    const images = [{ src: `/images/content/${course.sys.id}/card.png`, alt: course.fields.title }]
    const texts: any[] = [course.fields.title]
    const audios: any[] = [`/audios/${course.sys.id}/${locale}/audio.mp3`]
    await parseSummary(course.fields.summary, texts, images, audios)

    const quizzes = parseQuizzes(course.fields.activities)

    return (
        <>
            <Stroy texts={texts.filter(t => t)} images={images} audios={audios} quizzes={quizzes} lessons={course.fields.objectifs} />
        </>
    )
}
