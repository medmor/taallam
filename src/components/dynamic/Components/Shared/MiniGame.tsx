'use client'

import { shuffle } from "@/lib/utils/array";
import { GameState } from "@/types/GameState";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Countdown from 'react-countdown';
import Button from "../../../Button";
import Image from "next/image";


interface MiniGameProps {
    saveKey: string
    children: React.ReactNode
}


export default function Addition({ saveKey, children }: MiniGameProps) {


    const [state, setState] = useState<GameState>('pregame');
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

            {children}
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


