'use client'
import { useState } from "react";
import { useTranslations } from "next-intl";

import Carousel from "@/components/Carousel";
import Mcq from "@/components/quiz/Mcq";
import ContentPart from "./ContentPart";

import { Quiz, QuizCategoryConsts } from "@/types/QuizType";


interface ContentTestProps {
    quizzes: Quiz[];

}
export default function ContentTest({ quizzes }: ContentTestProps) {
    const t = useTranslations('contentTest');
    const [index, setIndex] = useState(0);
    const [dir, setDir] = useState('next');
    const [score, setScore] = useState(0);



    return (
        <ContentPart id="story-test">
            <div className="mb-2 p-1 text-center font-bold bg-white rounded-t-lg">
                <div className="border-b border-b-orange-400 py-2">{t("quiz")}</div>
                {t('score')} <span dir="ltr">{score} / {quizzes.length}</span>
            </div>
            <Carousel index={index} setIndex={setIndex} dir={dir} setDir={setDir} oneDirection>
                {quizzes.map(quiz => {
                    if (quiz.category == QuizCategoryConsts.mcq) {
                        return (<Mcq quiz={quiz} key={quiz.question} setScore={setScore} />)
                    }
                })}
            </Carousel>
        </ContentPart>
    )
}