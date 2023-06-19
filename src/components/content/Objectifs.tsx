import ContentPart from "./ContentPart";
import { useTranslations } from "next-intl";

interface Storylessons {
    lessons: string[];
}
export default function StoryLessons({ lessons }: Storylessons) {
    const t = useTranslations('storyLessons');
    return (
        <ContentPart id="story-lessons" >
            <div className="text-center bg-white rounded-t-lg text-xl p-2 font-bold">
                {t("lessons")}
            </div>
            <div className="p-4">
                {lessons.map((lesson) => {
                    const parts = lesson.split(":")
                    return (
                        <div key={parts[0]} className="text-center text-lg bg-white p-2 rounded-lg my-2">
                            <span className="font-bold">{parts[0]} </span> {parts[1]}
                        </div>
                    )
                })}
            </div>
        </ContentPart>
    )
}