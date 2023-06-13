import { useLocale } from 'next-intl';
import { getEntryById } from '@/lib/contentful/client'
import Stroy from './components/Story';
import { getImageUrl, parseQuizzes, parseSummary } from '@/lib/contentful/helpers';

interface StoryPageProps {
    params: {
        id: string;
    }
}

export default async function StoryPage({ params }: StoryPageProps) {
    const locale = useLocale();
    const story = await getEntryById(params.id, locale == 'en' ? 'en-US' : locale);

    const images = [{ src: `/images/content/${story.sys.id}/card.png`, alt: story.fields.title }]
    const texts: any[] = [story.fields.title]
    const audios: any[] = [`/audios/${story.sys.id}/${locale}/audio.mp3`]
    await parseSummary(story.fields.summary, texts, images, audios)
    const quizzes = parseQuizzes(story.fields.activities)


    return (
        <>
            <Stroy texts={texts.filter(t => t)} images={images} audios={audios} quizzes={quizzes} lessons={story.fields.objectifs} />
        </>
    )
}
