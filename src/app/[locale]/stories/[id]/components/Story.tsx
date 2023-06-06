'use client'
import { Quiz } from "@/types/QuizType";
import StroyViewer from "./StoryViewer";
import StroyTest from "./StoryTest";
import { useState } from "react";


interface StoryProps {
    texts: string[];
    images: any[];
    quizzes: Quiz[]
}
export default function Story({ texts, images, quizzes }: StoryProps) {
    const [canShowTest, setCanShowTest] = useState(false);
    return (
        <>
            <StroyViewer texts={texts.filter(t => t)} images={images} canShowTest={canShowTest} setCanShowTest={setCanShowTest} />
            {canShowTest && <StroyTest quizzes={quizzes} />}
        </>
    )
}