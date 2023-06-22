'use client'

import { shuffle } from "@/lib/utils/array";
import { GameState } from "@/types/GameState";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Countdown from 'react-countdown';
import Button from "../Button";


interface MultiplicationProps {
    properties: string[]
}

const saveKey = 'MultiplicationBestScore'

export default function Multiplication({ properties }: MultiplicationProps) {

    const numbers = useMemo(() => properties.map(n => Number(n)), [properties]);
    const allNumbers = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], []);
    const [state, setState] = useState<GameState>('pregame');
    const [firstNumber, setFirstNumber] = useState(0);
    const [secondNumber, setSecondNumber] = useState(0);
    const [answer, setAnswer] = useState(0);
    const [wrong1, setWrong1] = useState(0)
    const [wrong2, setWrong2] = useState(0)
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(Infinity);
    const countdownRef = useRef(null);

    const onComplete = useCallback(() => {
        setState('ended');
        (countdownRef.current as any).stop();
        const bests = localStorage.getItem(saveKey);
        console.log(bests, 'best');
        console.log(score, 'score');
        localStorage.setItem(saveKey, score.toString());
    }, [])
    const countdown = useMemo(() => (
        <Countdown
            date={Date.now() + 10000}
            renderer={
                (props) => (
                    <div className="absolute top-1 left-1 font-semibold">
                        {props.minutes} : {props.seconds}
                    </div>
                )
            }
            onComplete={onComplete}
            autoStart={false}
            ref={countdownRef}
        />
    ), [onComplete]);

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
            setScore((score) => score - 1)
        }
        resetNumber();
    }, [answer, resetNumber]);

    useEffect(() => {
        resetNumber();
    }, [resetNumber]);


    return (
        <div className={`p-10 rounded-lg flex flex-col items-center justify-center bg-white min-w-[300px]`} dir="ltr">
            {
                state != 'running' && (
                    <div className="z-10 absolute left-0 top-0 w-full h-full bg-slate-200 rounded-lg flex flex-col gap-4 justify-center items-center">
                        {
                            state == 'ended' && (
                                <div>
                                    Score : {score}
                                </div>
                            )
                        }
                        <div className="w-32">
                            <Button
                                label="Start"
                                onClick={
                                    () => {
                                        setState('running');
                                        setScore(0);
                                        (countdownRef.current as any).start();
                                    }
                                }
                            />
                        </div>
                    </div>
                )
            }

            {countdown}
            <div>{firstNumber} x {secondNumber}</div>
            <div>=</div>
            <div className="flex gap-3">
                {
                    shuffle([answer, wrong1, wrong2])
                        .map((n, i) => <div onClick={() => checkAnswer(n)} key={i}>{n}</div>)
                }
            </div>
            <div>
                Score : {score}
            </div>
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