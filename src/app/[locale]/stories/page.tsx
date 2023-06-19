import { useLocale } from 'next-intl';
import { getEntries, getImageUrl } from '@/lib/contentful/client'
import HomeCard from '@/components/HomeCard';
import PreviewContent from '@/components/PreviewContent';

export default async function StoriesPage() {
    const locale = useLocale();
    const uslocale = locale == 'en' ? 'en-US' : locale;
    const entries = await getEntries('course', locale == 'en' ? 'en-US' : locale, 'story');

    return (
        <div className="flex flex-wrap justify-center gap-5 p-10">
            {entries.map(async (story) => (
                <div key={story.fields.title}>
                    <HomeCard
                        label={story.fields.title}
                        href={`/${locale}/stories/${story.sys.id}`}
                        imageUrl={`/images/content/${story.sys.id}/card.png`}
                    />
                </div>
            ))}
            {process.env.NODE_ENV === 'development' && (
                <PreviewContent
                    href={`/${locale}/stories/`}
                    locale={uslocale}
                />
            )}
        </div>
    )
}


