'use client'

import { GameState } from "@/types/GameState";
import { useCallback, useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import Countdown from 'react-countdown';
import Button from "./Button";
import { useTranslations } from "next-intl";


interface MiniGameProps {
    saveKey: string
    children: React.ReactNode
    hideScore?: boolean
    hideCountdown?: boolean
    countdown?: number
    onGameEnded?: () => void
    onStart?: () => void
}

export interface MiniGameHandle {
    playWrongSound: () => void
    playGoodSound: () => void
    changeScore: (amount: number) => void
    changeErrors: (amount: number) => void
    callEndGame: () => void
}


const MiniGame = forwardRef<MiniGameHandle, MiniGameProps>(function MiniGame(props, ref) {
    const [state, setState] = useState<GameState>('pregame');
    const [score, setScore] = useState(0);
    const [errors, setErrors] = useState(0)
    const [bestScore, setBestScore] = useState(Infinity);
    const countdownRef = useRef(null);
    const [countdownDate] = useState(Date.now() + (props.countdown ? props.countdown : 100000));

    const [wrongAudio, setWrongAudio] = useState<HTMLAudioElement>()
    const [goodAudio, setGoodAudio] = useState<HTMLAudioElement>()

    const onStart = useCallback(() => {
        setState('running');
        if (props.hideScore != true) {
            setScore(0);
            setErrors(0);
        }
        (countdownRef.current as any).start();
    }, [props.hideScore])
    const gameEnded = useCallback(() => {
        setState('ended');
        (countdownRef.current as any).stop();
        if (props.hideScore != true) {
            let bests = Number(localStorage.getItem(props.saveKey));
            if (bests == null) {
                bests = 0;
            }
            if (bests > score) {
                setBestScore(bests)
            } else {
                setBestScore(score)
                localStorage.setItem(props.saveKey, score.toString());
            }
        }

        if (props.onGameEnded) {
            props.onGameEnded();
        }
    }, [score, props]);

    useImperativeHandle(ref, () => {
        return {
            playWrongSound: () => wrongAudio?.play(),
            playGoodSound: () => goodAudio?.play(),
            changeScore: (amount) => setScore(score => score + amount),
            changeErrors: (amount) => setErrors(errors => errors + amount),
            callEndGame: ()=> gameEnded()
        }
    }, [goodAudio, wrongAudio, gameEnded])

    useEffect(() => {
        setWrongAudio(new Audio("/audios/effects/wrong.mp3"))
        setGoodAudio(new Audio("/audios/effects/good.mp3"))
    }, [])
    return (
        <div className={`p-10 rounded-lg flex flex-col items-center justify-center bg-white min-w-[300px]`} dir="ltr">
            {
                state != 'running' && (<Overlap
                    state={state}
                    score={score}
                    bestScore={bestScore}
                    onStart={onStart}
                    hideScore={props.hideScore}
                />
                )
            }

            {
                (props.hideCountdown != true) && (
                    <Countdown
                        date={countdownDate}
                        renderer={
                            (props) => (
                                <div className="absolute top-1 right-5  font-semibold">
                                    {props.minutes} : {props.seconds}
                                </div>
                            )
                        }
                        onComplete={() => gameEnded()}
                        autoStart={false}
                        ref={countdownRef}
                    />
                )
            }
            {
                (props.hideScore != true) && (
                    <>
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
                    </>
                )
            }


            {props.children}
        </div>
    )
})

export default MiniGame;


////////////////////////// Overlap Component
interface OverlapProps {
    state: GameState;
    score: number;
    bestScore: number;
    hideScore?: boolean
    onStart: () => void
}
function Overlap({ state, score, bestScore, onStart, hideScore }: OverlapProps) {
    const t = useTranslations("common");
    return (
        <div className="z-10 absolute left-0 top-0 w-full h-full bg-orange-100 rounded-lg flex flex-col gap-4 justify-center items-center">
            {
                (state == 'ended' && hideScore != true) && (
                    <div>
                        <div className="font-bold text-lg">
                            {t("score")} : {score}
                        </div>
                        <div className="font-semibold">
                            {t("bestScore")} : {bestScore}
                        </div>
                    </div>
                )
            }
            <div className="w-32">
                <Button
                    label={state == 'ended' ? "Restart" : "Start"}
                    onClick={onStart}
                />
            </div>
        </div>
    )
}


