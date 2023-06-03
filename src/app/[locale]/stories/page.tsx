import { getEntries } from '@/lib/contentful'

export default async function Page() {
    const entries = await getEntries('story');

    return (
        <div>
            {JSON.stringify(entries)}
        </div>
    )
}