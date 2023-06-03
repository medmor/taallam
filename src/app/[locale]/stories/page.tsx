import { useLocale } from 'next-intl';
import { getEntries } from '@/lib/contentful'

export default async function Page() {
    const locale = useLocale();
    const entries = await getEntries(locale == 'en' ? 'en-US' : locale, 'story');

    return (
        <div>
            {JSON.stringify(entries[0])}
        </div>
    )
}

