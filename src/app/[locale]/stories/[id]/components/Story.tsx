'use client'
import { useCallback, useMemo, useState } from "react";

import { Quiz } from "@/types/QuizType";

import Summary from "@/components/content/Summary";
import Test from "@/components/content/Test";
import Objectifs from "@/components/content/Objectifs";


interface StoryProps {
    texts: string[];
    medias: any[];
    audios: any[];
    quizzes: Quiz[];
    lessons: string[]
}
export default function Story({ texts, medias, audios, quizzes, lessons }: StoryProps) {

    const [canShowTest, setCanShowTest] = useState(false);
    const updateShowTest = useCallback(() => {
        setCanShowTest(true);
    }, [])
    return (
        <>
            <Summary
                texts={texts.filter(t => t)}
                medias={medias}
                audios={audios}
                canShowTest={canShowTest}
                setCanShowTest={updateShowTest}
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