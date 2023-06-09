'use client'
import { Quiz } from "@/types/QuizType";
import StroyViewer from "./StoryViewer";
import StroyTest from "./StoryTest";
import { useState } from "react";
import StoryLessons from "./StoryLessons";


interface StoryProps {
    texts: string[];
    images: any[];
    audios: any[];
    quizzes: Quiz[];
    lessons: string[]
}
export default function Story({ texts, images, audios, quizzes, lessons }: StoryProps) {
    const [canShowTest, setCanShowTest] = useState(false);
    const [canShowLessons, SetCanShowLessons] = useState(false);
    return (
        <>
            <StroyViewer
                texts={texts.filter(t => t)}
                images={images}
                audios={audios}
                canShowTest={canShowTest}
                setCanShowTest={setCanShowTest}
            />
            {
                canShowTest && (
                    <>
                        <StroyTest quizzes={quizzes} />
                        <StoryLessons lessons={lessons} />
                    </>
                )
            }
        </>
    )
}