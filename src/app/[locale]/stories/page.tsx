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
        <div className='p-4 bg-orange-600 text-white'>
            <div className='text-3xl font-bold text-center'>
                {story.fields.title}
            </div>
            <div className='grid-cols-2 grid p-4 gap-2'>
                <div>
                    <Image
                        className='rounded-xl'
                        src={`https:${cardImageUrl}`}
                        alt={story.fields.cardImage.fields.title}
                        width={600}
                        height={600}
                    />
                </div>
                <div className='text-center text-black text-xl p-4 space-y-5 font-bold rounded-xl bg-green-500'>
                    {parseRichText(story.fields.summary, [])}
                </div>
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