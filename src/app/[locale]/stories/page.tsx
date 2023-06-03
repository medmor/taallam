import Image from 'next/image'
import { useLocale } from 'next-intl';
import { getAsset, getEntries } from '@/lib/contentful'
import { CourseType, ImageAsset } from '@/types/CourseType';
import { BLOCKS, Document as RichDocument } from '@/types/RichText';

export default async function Page() {
    const locale = useLocale();
    const entries = await getEntries(locale == 'en' ? 'en-US' : locale, 'story');
    //@ts-ignore
    const story = entries[0] as CourseType;

    const cardImageUrl = await getImageUrl(story.fields.cardImage, locale);

    return (
        <div className='p-4 text-orange-600'>
            <div className='text-3xl font-bold text-center bg-orange-600 text-white p-4 rounded-xl max-w-2xl m-auto'>{story.fields.title}</div>
            <Image
                className='mx-auto my-5 rounded-xl border-orange-600 border-4 p-1'
                src={`https:${cardImageUrl}`}
                alt={story.fields.cardImage.fields.title}
                width={400}
                height={400}
            />
            <div className='text-white text-center text-xl bg-orange-600 max-w-2xl m-auto p-4 space-y-5 font-semibold rounded-xl border-orange-600 border-4'>
                {parseRichText(story.fields.summary, [])}
            </div>
        </div>
    )
}

async function getImageUrl(img: ImageAsset, locale: string) {
    if (locale == 'en')
        return img.fields.file.url;
    //@ts-ignore
    const asset: ImageAsset = await getAsset(img.sys.id)
    return asset.fields.file.url;
}

function parseRichText(document: any, parsed: any) {
    for (let i = 0; i < document.content.length; i++) {
        const content = document.content[i];
        if (content.nodeType == BLOCKS.PARAGRAPH) {
            parsed.push(<div>{content.content[0].value}</div>)

        } else {
            parseRichText(content, parsed)
        }
    }
    return parsed
}