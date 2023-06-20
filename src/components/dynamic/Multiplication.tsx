'use client'

import { useCallback, useState } from "react";

interface MultiplicationProps {
    min: number;
    max: number;
}

export default function Multiplication({ min, max }: MultiplicationProps) {
    const [firstNumber, setFirstNumber] = useState(randomNumber(min, max));
    const [secondNumber, setSecondNumber] = useState(randomNumber(min, max));
    const result: number | undefined = undefined;
    const resetNumber = useCallback(() => {
        setFirstNumber(randomNumber(min, max));
        setSecondNumber(randomNumber(min, max))
    }, [max, min])
    return (
        <div className={`p-10 rounded-lg flex flex-col items-center justify-center bg-white`}>
            <div>{firstNumber} x {secondNumber}</div>
            <div>{firstNumber * secondNumber}</div>
            <button onClick={resetNumber}>refresh</button>
        </div>
    )
}

function randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}