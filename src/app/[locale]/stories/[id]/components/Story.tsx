'use client'
import { useState } from "react";

import { Quiz } from "@/types/QuizType";

import Summary from "@/components/content/Summary";
import Test from "@/components/content/Test";
import Objectifs from "@/components/content/Objectifs";


interface StoryProps {
    texts: string[];
    images: any[];
    audios: any[];
    quizzes: Quiz[];
    lessons: string[]
}
export default function Story({ texts, images, audios, quizzes, lessons }: StoryProps) {
    const [canShowTest, setCanShowTest] = useState(false);
    console.log(texts[0])
    return (
        <>
            <Summary
                texts={texts.filter(t => t)}
                images={images}
                audios={audios}
                canShowTest={canShowTest}
                setCanShowTest={setCanShowTest}
            />
            {
                canShowTest && (
                    <>
                        <Test quizzes={quizzes} />
                        <Objectifs lessons={lessons} />
                    </>
                )
            }
        </>
    )
}