'use client'
import { useEffect, useState } from "react";
import { BsArrowDownCircleFill } from "react-icons/bs";
import { useTranslations } from "next-intl";

import Button from "@/components/Button";
import Carousel from "@/components/Carousel";
import Mcq from "@/components/quiz/Mcq";
import StoryPart from "./StoryPart";

import { Quiz, QuizCategoryConsts } from "@/types/QuizType";


interface StoryTestProps {
    quizzes: Quiz[];
    canShowStoryLessons: boolean;
    setCanShowStoryLessons: any;
}
export default function StroyTest({ quizzes, canShowStoryLessons, setCanShowStoryLessons }: StoryTestProps) {
    const t = useTranslations('storyTest');
    const [index, setIndex] = useState(0);
    const [dir, setDir] = useState('next');
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (index >= quizzes.length - 1) {
            setTimeout(() => {
                setCanShowStoryLessons(true);
            }, 5000);
        }
    }, [index, setCanShowStoryLessons, quizzes.length]);

    return (
        <StoryPart id="story-test">
            <div className="mt-2 text-center font-bold bg-white rounded-t-lg">
                {t('score')} <span dir="ltr">{score} / {quizzes.length * 2}</span>
            </div>
            <Carousel index={index} setIndex={setIndex} dir={dir} setDir={setDir} oneDirection>
                {quizzes.map(quiz => {
                    if (quiz.category == QuizCategoryConsts.mcq) {
                        return (<Mcq quiz={quiz} key={quiz.question} setScore={setScore} />)
                    }
                })}
            </Carousel>
            {
                canShowStoryLessons && (
                    <a href="#story-lessons" className="p-4 block">
                        <Button label={t("lessonsBtn")} onClick={() => ''} icon={BsArrowDownCircleFill} />
                    </a>
                )
            }

        </StoryPart>
    )
}