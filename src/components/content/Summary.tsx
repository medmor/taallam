
'use client'

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslations } from 'next-intl'
import { BsArrowDownCircleFill } from 'react-icons/bs'
import { GiSpeaker } from 'react-icons/gi'

import Carousel from "@/components/Carousel";
import Button from "@/components/Button";
import ContentPart from "./ContentPart";
import ContentMedia from './ContentMedia';


interface StoryViewerProps {
    images: { src: string; alt: string; }[];
    texts: string[];
    audios: any;
    canShowTest: boolean;
    setCanShowTest: any
}

export default function Summary({ images, texts, audios, canShowTest, setCanShowTest }: StoryViewerProps) {
    const t = useTranslations("storyViewer");
    const [index, setIndex] = useState(0);
    const [dir, setDirection] = useState('next');
    const [quizButtonClickd, setQuizButtonClicked] = useState(false);

    let audio: HTMLAudioElement | undefined = undefined;
    if (audios[1]) { audio = new Audio(audios[0]); }

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

    useEffect(() => {
        if (index >= texts.length - 1) {
            setTimeout(() => {
                setCanShowTest();
            }, 3000);
        }
    }, [index, setCanShowTest, texts.length]);

    return (
        <ContentPart id="story-viewer">
            <Carousel index={index} setIndex={setIndex} dir={dir} setDir={setDirection} onSlide={() => pause()}>
                {texts.map((text, i) => (
                    <div className="flex flex-col sm:flex-row gap-2 justify-center p-4 " key={i}>
                        <div className={
                            `relative
                            flex
                            items-center
                            justify-center
                            text-center
                            p-2 pt-6 sm:p-10 space-y-5
                            rounded-xl
                            bg-white 
                            text-2xl
                            ${index == 0 ? 'font-bold' : ''}                    
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
                        <div className="relative">
                            {
                                canShowTest && !quizButtonClickd && (
                                    <a className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
                                        href="#story-test"
                                    >
                                        <Button label={t("quiz")} onClick={() => setQuizButtonClicked(true)} icon={BsArrowDownCircleFill} />
                                    </a>
                                )
                            }
                            <ContentMedia src={images[i].src} alt={images[i].alt} />
                        </div>
                    </div>
                ))}
            </Carousel >
        </ContentPart>
    )
}

