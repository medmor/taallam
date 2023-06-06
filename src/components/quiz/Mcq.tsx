'use client'
import { useTranslations } from 'next-intl'

import { Quiz } from "@/types/QuizType"
import { useEffect, useState } from 'react';


interface McqProps {
    quiz: Quiz
}

export default function Mcq({ quiz }: McqProps) {
    const [choices, setChoices] = useState(['']);
    useEffect(() => {
        setChoices(shuffleChoices([...quiz.choices, quiz.answer]))
    }, [quiz.choices, quiz.answer])
    return (
        (
            <div className='bg-white p-4 rounded-xl max-w-2xl mx-auto my-4' key={quiz.question}>
                <div className='font-semibold text-lg p-2 border-b-2 border-b-orange-600'>
                    {quiz.question}
                </div>
                <div className='p-4'>
                    {choices.map(choice => (
                        <div className='p-2 mb-1 border rounded-lg hover:bg-slate-100' key={choice}>{choice}</div>
                    ))}
                </div>
            </div>
        )
    )
}

function shuffleChoices(arr: string[]) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}