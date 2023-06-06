'use client'
import Carousel from "@/components/Carousel";
import Mcq from "@/components/quiz/Mcq";
import { Quiz, QuizCategoryConsts } from "@/types/QuizType";
import { useState } from "react";


interface StoryTestProps {
    quizzes: Quiz[]
}
export default function StroyTest({ quizzes }: StoryTestProps) {
    const [index, setIndex] = useState(0);
    const [dir, setDir] = useState('next');
    const [score, setScore] = useState(0);
    return (
        <div id="story-test" className="max-w-5xl m-auto border rounded-xl mb-2">
            <div className="mt-2 text-center font-bold text-white">
                Your score = {score}
            </div>
            <Carousel index={index} setIndex={setIndex} dir={dir} setDir={setDir} oneDirection>
                {quizzes.map(quiz => {
                    if (quiz.category == QuizCategoryConsts.mcq) {
                        return (<Mcq quiz={quiz} key={quiz.question} setScore={setScore} />)
                    }
                })}
            </Carousel>

        </div>
    )
}