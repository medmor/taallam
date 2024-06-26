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


    return (
        <>
            <Summary
                texts={texts.filter(t => t)}
                medias={medias}
                audios={audios}
            />

            <Test quizzes={quizzes} />
            <Objectifs lessons={lessons} />

        </>
    )
}