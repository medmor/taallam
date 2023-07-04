
'use client'

import { useState, useCallback, useMemo } from "react";

import { GiSpeaker } from 'react-icons/gi'

import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Button from "@/components/Button";
import ContentPart from "./ContentPart";
import ContentMedia from './ContentMedia';


interface ContentViewerProps {
    medias: any[];
    texts: string[];
    audios: any;
}

export default function Summary({ medias, texts, audios }: ContentViewerProps) {
    const [index, setIndex] = useState(0);
    const [playTimeout, setPlayTimeout]: any = useState()

    let audio = useMemo(() => {
        if (audios[1]) {
            return new Audio(audios[0])
        }
        return undefined
    }, [audios])
    const pause = useCallback(() => {
        if (audio)
            audio.pause();
    }, [audio]);

    const play = useCallback(() => {
        if (playTimeout != null) {
            clearTimeout(playTimeout)
        }
        if (audio) {
            pause();
            const times = audios[1][index];
            audio.currentTime = times.start;
            audio.play();
            setPlayTimeout(setTimeout(() => {
                pause();
                setPlayTimeout(null)
            }, (times.end - times.start) * 1000));
        }
    }, [audio, audios, index, pause, playTimeout])

    return (
        <ContentPart id="story-viewer">
            <div dir="ltr">
                <Carousel
                    showThumbs={false}
                    useKeyboardArrows
                    showStatus={false}
                    autoFocus
                    showIndicators={texts.length > 1}
                    onChange={(i) => setIndex(i)}
                >
                    {
                        texts.map((text, i) => (
                            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 justify-center" key={i}>
                                <div className="relative">
                                    {
                                        audios[1] &&
                                        <div className='absolute top-2 left-[50%]'>
                                            <Button
                                                label=''
                                                onClick={() => play()}
                                                icon={GiSpeaker}
                                                small

                                            />
                                        </div>
                                    }
                                    <ContentMedia data={medias[i]} />
                                </div>
                                <div className={
                                    `relative
                                        flex
                                        items-center
                                        justify-center
                                        text-center
                                        p-2 sm:px-10
                                        rounded-xl
                                        bg-white 
                                        text-2xl sm:leading-[2em]
                                        `
                                }>
                                    <div >
                                        {text}
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </Carousel >
            </div>
        </ContentPart>
    )
}

