import { useLocale } from 'next-intl';
import { getAsset, getEntries, getImageUrl } from '@/lib/contentful'
import HomeCard from '@/components/HomeCard';

export default async function StoriesPage() {
    const locale = useLocale();

    const entries = await getEntries(locale == 'en' ? 'en-US' : locale, 'story');

    return (
        <div className="flex flex-wrap justify-center gap-5 p-10">
            {entries.map(async (story) => (
                <div key={story.fields.title}>
                    <HomeCard
                        label={story.fields.title}
                        href={`/${locale}/stories/${story.sys.id}`}
                        imageUrl={await getImageUrl(story.fields.cardImage.sys.id)}
                    />

                </div>
            ))}
        </div>
    )
}


