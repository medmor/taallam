
'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTranslations } from 'next-intl'
import { BsArrowDownCircleFill } from 'react-icons/bs'
import { GiSpeaker } from 'react-icons/gi'

import Carousel from "@/components/Carousel";
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
    const [dir, setDirection] = useState('next');

    let audio = useMemo(() => {
        if (audios[1]) {
            return new Audio(audios[0])
        }
        return undefined
    }, [audios])
    const pause = useCallback(() => {
        if (audio)
            audio.pause();
    }, [audio])
    const play = useCallback(() => {
        if (audio) {
            pause();
            const times = audios[1][index];
            audio.currentTime = times.start;
            audio.play();
            setTimeout(() => {
                pause()
            }, (times.end - times.start) * 1000);
        }
    }, [audio, audios, index, pause])



    return (
        <ContentPart id="story-viewer">
            <Carousel index={index} setIndex={setIndex} dir={dir} setDir={setDirection} onSlide={() => pause()}>
                {texts.map((text, i) => (
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 justify-center" key={i}>
                        <div className="relative">
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
                            {
                                audios[1] &&
                                <div className='absolute top-2 right-2'>
                                    <Button
                                        label=''
                                        onClick={() => play()}
                                        icon={GiSpeaker}
                                        small
                                        outline
                                    />
                                </div>
                            }
                            <div >
                                {text}
                            </div>
                        </div>
                    </div>
                ))}
            </Carousel >
        </ContentPart>
    )
}

