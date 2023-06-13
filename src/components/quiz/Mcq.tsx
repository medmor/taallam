
import { Quiz } from "@/types/QuizType"
import { useCallback, useEffect, useState } from 'react';
import Choice from "./Choice";


interface McqProps {
    quiz: Quiz
    setScore: any;
}

export default function Mcq({ quiz, setScore }: McqProps) {
    const [choices, setChoices] = useState(['']);
    const [selected, setSelected] = useState('');

    const selectedChoiceClass = useCallback((choice: string) => {
        if (choice == selected) {
            if (choice == quiz.answer) {
                return 'bg-lime-500';
            }
            else {
                return 'bg-red-600';
            }
        } else {
            return '';
        }
    }, [quiz.answer, selected])
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
                        <div
                            className={`
                                cursor-pointer
                                p-2 mb-1 
                                border rounded-lg 
                                flex justify-center
                                ${!selected ? 'hover:bg-slate-100' : ''}
                                ${selectedChoiceClass(choice)}
                            `}
                            key={choice}
                            onClick={() => {
                                if (!selected) {
                                    setSelected(choice)
                                    if (choice == quiz.answer) {
                                        setScore((score: number) => score + 2)
                                    } else {
                                        setScore((score: number) => score - 1)
                                    }
                                }
                            }
                            }
                        >
                            <Choice choice={choice} />
                        </div>
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