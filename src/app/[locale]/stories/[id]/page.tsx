import { useLocale } from 'next-intl';
import { getAsset, getEntryById } from '@/lib/contentful'
import { ImageAsset } from '@/types/CourseType';
import { BLOCKS, Block } from '@/types/RichText';
import StroyViewer from './components/StoryViewr';

interface StoryPageProps {
    params: {
        id: string;
    }
}
export default async function StoryPage({ params }: StoryPageProps) {
    const locale = useLocale();
    const story = await getEntryById(params.id, locale == 'en' ? 'en-US' : locale);

    const cardImageUrl = await getImageUrl(story.fields.cardImage, locale);

    const images = [{ src: cardImageUrl, alt: story.fields.cardImage.fields.title }]
    const texts: any[] = [story.fields.title]
    await parseSummary(story.fields.summary, texts, images)
    parseQuizzes(story.fields.activities)

    return (
        <StroyViewer texts={texts.filter(t => t)} images={images} />
    )
}

async function getImageUrl(img: ImageAsset, locale: string) {
    if (locale == 'en')
        return img.fields.file.url;
    //@ts-ignore
    const asset: ImageAsset = await getAsset(img.sys.id)
    return asset.fields.file.url;
}

async function parseSummary(document: any, texts: any, images: any) {
    for (let i = 0; i < document.content.length; i++) {
        const content = document.content[i];
        if (content.nodeType == BLOCKS.PARAGRAPH) {
            texts.push(content.content[0].value)
        } else if (content.nodeType == BLOCKS.EMBEDDED_ASSET) {
            const img = await getAsset(content.data.target.sys.id)
            images.push(
                {
                    src: img.fields.file?.url!,
                    alt: img.fields.title!
                }
            )
        }
        else {
            await parseSummary(content, texts, images)
        }
    }
}

function parseQuizzes(quizzes: Block) {
    for (let i = 0; i < quizzes.content.length; i++) {
        const content = quizzes.content[i];
        console.log(content.nodeType)
        if (content && content.nodeType !== 'text')
            parseQuizzes(content as Block)
    }
}