'use client'

import { shuffle } from "@/lib/utils/array";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import MiniGame, { MiniGameHandle } from "../Shared/MiniGame";
import NumberImage from "../Shared/NumberImage";
import { rndExclude, rndItem } from "@/helpers/random";


interface AdditionProps {
    properties: string[] // Properties are an array of number like : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}


export default function Addition({ properties }: AdditionProps) {

    const saveKey = 'AdditionBestScore' + properties;

    const miniGameRef = useRef<MiniGameHandle>(null)
    const numbers = useMemo(() => properties.map(n => Number(n)), [properties]);

    const [firstNumber, setFirstNumber] = useState(0);
    const [secondNumber, setSecondNumber] = useState(0);
    const [answer, setAnswer] = useState(0);
    const [wrong1, setWrong1] = useState(0);
    const [wrong2, setWrong2] = useState(0);


    const resetNumber = useCallback(() => {
        const numb1 = rndItem(numbers);
        const numb2 = rndItem(numbers);
        const res = numb1 + numb2;
        const w1 = rndExclude(0, numbers[numbers.length - 1] + 20, [res]);
        const w2 = rndExclude(0, numbers[numbers.length - 1] + 20, [res, w1])
        setFirstNumber(numb1);
        setSecondNumber(numb2);
        setAnswer(res);
        setWrong1(w1)
        setWrong2(w2)
    }, [numbers]);

    const checkAnswer = useCallback((ans: number) => {
        if (ans == answer) {
            miniGameRef.current?.playGoodSound();
            miniGameRef.current?.changeScore(1)
        } else {
            miniGameRef.current?.playWrongSound();
            miniGameRef.current?.changeScore(-1)
            miniGameRef.current?.changeErrors(1)
        }
        resetNumber();
    }, [answer, resetNumber]);

    useEffect(() => {
        resetNumber();
    }, [resetNumber]);


    return (
        <MiniGame saveKey={saveKey} ref={miniGameRef}>
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
        </MiniGame>
    )
}

