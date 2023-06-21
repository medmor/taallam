'use client'

import { useCallback, useEffect, useMemo, useState } from "react";

interface MultiplicationProps {
    properties: string[]
}

export default function Multiplication({ properties }: MultiplicationProps) {
    const numbers = useMemo(() => properties.map(n => Number(n)), [properties]);
    const allNumbers = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [])
    const [firstNumber, setFirstNumber] = useState(0);
    const [secondNumber, setSecondNumber] = useState(0);
    const [answer, setAnswer] = useState(0);
    const [wrong1, setWrong1] = useState(0)
    const [wrong2, setWrong2] = useState(0)
    const [score, setScore] = useState(0);
    const [errors, setErrors] = useState(0);
    const resetNumber = useCallback(() => {
        const numb1 = randomInNumbers(numbers);
        const numb2 = randomInNumbers(allNumbers);
        const res = numb1 * numb2;
        const w1 = randomBetween(0, numbers[numbers.length - 1] * 10, res, res);
        const w2 = randomBetween(0, numbers[numbers.length - 1] * 10, res, w1)
        setFirstNumber(numb1);
        setSecondNumber(numb2);
        setAnswer(res);
        setWrong1(w1)
        setWrong2(w2)
    }, [numbers, allNumbers]);
    const checkAnswer = useCallback((ans: number) => {
        if (ans == answer) {
            setScore((score) => score + 1)
        } else {
            setErrors((errors) => errors + 1)
        }
        resetNumber();
    }, [answer, resetNumber])
    useEffect(() => {
        resetNumber();
    }, [resetNumber])
    return (
        <div className={`p-10 rounded-lg flex flex-col items-center justify-center bg-white min-w-[300px]`} dir="ltr">
            <div>{firstNumber} x {secondNumber}</div>
            <div>=</div>
            <div className="flex gap-3">
                <div onClick={() => checkAnswer(wrong1)}>{wrong1}</div>
                <div onClick={() => checkAnswer(answer)} >{answer}</div>
                <div onClick={() => checkAnswer(wrong2)}>{wrong2}</div>
            </div>
            <div>
                Score : {score} Errors : {errors}
            </div>
            <button onClick={resetNumber}>refresh</button>
        </div>
    )
}

function randomInNumbers(numbers: number[]): number {
    return numbers[Math.floor(Math.random() * numbers.length)];
}
function randomBetween(min: number, max: number, dif1: number, dif2: number) {
    const numb = Math.floor(Math.random() * (max - min) + min);
    if (numb != dif1 && numb != dif2) {
        return numb
    } else {
        return randomBetween(min, max, dif1, dif2)
    }
}