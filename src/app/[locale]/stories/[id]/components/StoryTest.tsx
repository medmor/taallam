'use client'
import Carousel from "@/components/Carousel";
import Heading from "@/components/Heading";
import Mcq from "@/components/quiz/Mcq";
import { Quiz, QuizCategoryConsts } from "@/types/QuizType";
import { useTranslations } from "next-intl";
import { useState } from "react";


interface StoryTestProps {
    quizzes: Quiz[]
}
export default function StroyTest({ quizzes }: StoryTestProps) {
    const t = useTranslations('quiz');
    const [index, setIndex] = useState(0);
    const [dir, setDir] = useState('next');
    return (
        <div className="max-w-5xl m-auto">
            <Heading title={t("Comprehension Quiz")} center />
            <Carousel index={index} setIndex={setIndex} dir={dir} setDir={setDir}>
                {quizzes.map(quiz => {
                    if (quiz.category == QuizCategoryConsts.mcq) {
                        return (<Mcq quiz={quiz} key={quiz.question} />)
                    }
                })}
            </Carousel>

        </div>
    )
}