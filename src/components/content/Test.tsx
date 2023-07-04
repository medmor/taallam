'use client'
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Mcq from "@/components/quiz/Mcq";
import ContentPart from "./ContentPart";

import { Quiz } from "@/types/QuizType";


interface ContentTestProps {
    quizzes: Quiz[];

}
export default function ContentTest({ quizzes }: ContentTestProps) {
    const t = useTranslations('contentTest');
    const [score, setScore] = useState(0);

    return (
        <ContentPart id="story-test">
            <div className="mb-2 p-1 text-center font-bold bg-white rounded-t-lg">
                <div className="border-b border-b-orange-400 py-2">{t("quiz")}</div>
                {t('score')} <span dir="ltr">{score} / {quizzes.length}</span>
            </div>
            <div dir="ltr">
                <Carousel
                    showThumbs={false}
                    useKeyboardArrows
                    showStatus={false}
                >
                    {quizzes.map(quiz => {
                        return (<Mcq quiz={quiz} key={quiz.question} setScore={setScore} />)
                    })}
                </Carousel>
            </div>
        </ContentPart>
    )
}