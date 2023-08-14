import { useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { getEntries, getImageUrl } from '@/lib/contentful/client'
import HomeCard from '@/components/Shared/HomeCard';
import PreviewContent from '@/components/Shared/PreviewContent';
import HomeCardList from '@/components/Shared/HomeCardList';


export async function generateMetadata() {
    const t = await getTranslations('home');
    return {
        title: t("metadataTitle"),
        description: t("metadataDescription")
    }
}

export default async function StoriesPage() {
    const locale = useLocale();
    const uslocale = locale == 'en' ? 'en-US' : locale;
    const entries = await getEntries('course', locale == 'en' ? 'en-US' : locale, 'story');

    return (
        <>
            <HomeCardList entries={entries} hrefBase={`/${locale}/stories`} />
            {
                process.env.NODE_ENV === 'development' && (
                    <PreviewContent
                        href={`/${locale}/stories/`}
                        locale={uslocale}
                    />
                )
            }
        </>
    )
}


