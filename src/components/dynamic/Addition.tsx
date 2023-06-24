'use client'

import { shuffle } from "@/lib/utils/array";
import { GameState } from "@/types/GameState";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Countdown from 'react-countdown';
import Button from "../Button";
import Image from "next/image";


interface AdditionProps {
    properties: string[]
}


export default function Addition({ properties }: AdditionProps) {

    const saveKey = 'AdditionBestScore' + properties;
    const numbers = useMemo(() => properties.map(n => Number(n)), [properties]);
    //const allNumbers = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], []);
    const [state, setState] = useState<GameState>('pregame');
    const [firstNumber, setFirstNumber] = useState(0);
    const [secondNumber, setSecondNumber] = useState(0);
    const [answer, setAnswer] = useState(0);
    const [wrong1, setWrong1] = useState(0);
    const [wrong2, setWrong2] = useState(0);
    const [score, setScore] = useState(0);
    const [errors, setErrors] = useState(0)
    const [bestScore, setBestScore] = useState(Infinity);
    const countdownRef = useRef(null);
    const [countdownDate] = useState(Date.now() + 100000);

    const wrongAudio = useMemo(() => new Audio("/audios/effects/wrong.mp3"), [])
    const goodAudio = useMemo(() => new Audio("/audios/effects/good.mp3"), [])

    const onComplete = useCallback(() => {
        setState('ended');
        (countdownRef.current as any).stop();
        let bests = Number(localStorage.getItem(saveKey));
        if (bests == null) {
            bests = 0;
        }
        if (bests > score) {
            setBestScore(bests)
        } else {
            setBestScore(score)
            localStorage.setItem(saveKey, score.toString());
        }
    }, [score, saveKey]);

    const resetNumber = useCallback(() => {
        const numb1 = randomInNumbers(numbers);
        const numb2 = randomInNumbers(numbers);
        const res = numb1 + numb2;
        const w1 = randomBetween(0, numbers[numbers.length - 1] + 20, res, res);
        const w2 = randomBetween(0, numbers[numbers.length - 1] + 20, res, w1)
        setFirstNumber(numb1);
        setSecondNumber(numb2);
        setAnswer(res);
        setWrong1(w1)
        setWrong2(w2)
    }, [numbers]);

    const checkAnswer = useCallback((ans: number) => {
        if (ans == answer) {
            goodAudio.play();
            setScore((score) => score + 1);
        } else {
            wrongAudio.play();
            setScore((score) => score - 1);
            setErrors((errors) => errors + 1);

        }
        resetNumber();
    }, [answer, resetNumber, goodAudio, wrongAudio]);

    useEffect(() => {
        resetNumber();
    }, [resetNumber]);


    return (
        <div className={`p-10 rounded-lg flex flex-col items-center justify-center bg-white min-w-[300px]`} dir="ltr">
            {
                state != 'running' && (<Overlap
                    state={state}
                    score={score}
                    bestScore={bestScore}
                    setScore={setScore}
                    setState={setState}
                    countdownRef={countdownRef}

                />
                )
            }

            <Countdown
                date={countdownDate}
                renderer={
                    (props) => (
                        <div className="absolute top-1 right-5  font-semibold">
                            {props.minutes} : {props.seconds}
                        </div>
                    )
                }
                onComplete={() => onComplete()}
                autoStart={false}
                ref={countdownRef}
            />
            {
                errors > 0 && (

                    <div className="absolute top-1 left-[50%] font-semibold translate-x-[-50%] text-red-600">
                        Errors : {errors}
                    </div>
                )
            }
            <div className="absolute top-1 left-5 font-semibold">
                Score : {score}
            </div>

            <div className="flex flex-col justify-between items-center gap-2">
                <div className="flex">
                    <NumberImage number={firstNumber.toString()} className="flex" onClick={() => console.log(firstNumber)} />
                    <NumberImage number="+" className="p-0 pt-10" onClick={() => console.log("+")} />
                    <NumberImage number={secondNumber.toString()} className="flex" onClick={() => console.log(secondNumber)} />
                </div>
                <div><NumberImage number="=" className="" onClick={() => console.log("=")} /></div>
                <div className="flex gap-5">
                    {
                        shuffle([answer, wrong1, wrong2])
                            .map((n, i) => (

                                <NumberImage number={n.toString()} className="
                                        border
                                        border-orange-600
                                        rounded-lg 
                                        p-4
                                        sm:p-8
                                        cursor-pointer 
                                        flex 
                                        justify-center
                                        min-w-[60px]
                                        sm:min-w-[120px]
                                        "
                                    onClick={() => checkAnswer(n)} key={i} />

                            ))
                    }
                </div>
            </div>
        </div>
    )
}


////////////////////////// Overlap Component
interface OverlapProps {
    state: GameState;
    score: number;
    bestScore: number;
    setState: any;
    setScore: any;
    countdownRef: any
}
function Overlap({ state, score, bestScore, setScore, setState, countdownRef }: OverlapProps) {
    return (
        <div className="z-10 absolute left-0 top-0 w-full h-full bg-orange-100 rounded-lg flex flex-col gap-4 justify-center items-center">
            {
                state == 'ended' && (
                    <div>
                        <div className="font-bold text-lg">
                            Score : {score}
                        </div>
                        <div className="font-semibold">
                            Best Score : {bestScore}
                        </div>
                    </div>
                )
            }
            <div className="w-32">
                <Button
                    label={state == 'ended' ? "Restart" : "Start"}
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

////////////////////////// NumberImage Component

interface NumberImagePrps {
    number: string;
    className: string;
    onClick: any
}
function NumberImage({ number, className, onClick }: NumberImagePrps) {
    const arr = number.split("")
    return (
        <div className={className} onClick={onClick}>

            {arr.map((n, i) => (
                <Image
                    src={`/images/content/numbers/small/${n}.png`}
                    alt={n}
                    key={i}
                    width={60}
                    height={60}
                    unoptimized
                    className="h-auto w-[60px]"
                />
            ))}
        </div>
    )
}


///////////////////////////// Helper functions
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