import { useLocale } from 'next-intl';
import { getAsset, getEntryById } from '@/lib/contentful'
import { ImageAsset } from '@/types/CourseType';
import { BLOCKS, Block } from '@/types/RichText';
import StroyViewer from './components/StoryViewer';
import Mcq from '@/components/quiz/Mcq';
import { EmptyQuiz, Quiz, QuizCategory, QuizCategoryConsts } from '@/types/QuizType';
import StroyTest from './components/StoryTest';

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

    const quizzes = parseQuizzes(story.fields.activities)

    return (
        <>
            <StroyViewer texts={texts.filter(t => t)} images={images} />
            <StroyTest quizzes={quizzes} />
        </>
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

function parseQuizzes(doc: Block, quizzes: any[] = []): Quiz[] {
    const lines = getAllDocLines(doc)
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let start = line.substring(0, 3);
        if (isQuestion(start)) {
            const quiz = EmptyQuiz();
            quiz.category = start as QuizCategory;
            quiz.question = line.replace(start + '-', "").trim();
            let j = i + 1
            start = lines[j].substring(0, 3);
            while (lines[j] && !isQuestion(start)) {
                if (lines[j].endsWith('===')) {
                    quiz.answer = lines[j].replace('===', '')
                } else {
                    quiz.choices.push(lines[j])
                }
                j++
                if (lines[j])
                    start = lines[j].substring(0, 3);
            }
            i = j - 1
            quizzes.push(quiz)
        }
    }
    return quizzes;
}

function getAllDocLines(doc: Block, lines: string[] = []) {
    for (let i = 0; i < doc.content.length; i++) {
        let node = doc.content[i];
        if (node.nodeType == 'text') {
            const text = node.value.trim()
            if (text.length)
                lines.push(text)
        }
        else {
            getAllDocLines(node as any, lines)
        }
    }
    return lines;
}

function isQuestion(start: string) {
    return start in QuizCategoryConsts
}