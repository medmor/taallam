
'use client'

import Image from 'next/image'
import { useEffect, useState, useRef } from "react";
import { useTranslations } from 'next-intl'
import { Transition } from '@headlessui/react'
import { BsArrowDownCircleFill } from 'react-icons/bs'
import { GiSpeaker } from 'react-icons/gi'

import Carousel from "@/components/Carousel";
import Button from "@/components/Button";
import ContentPart from "./ContentPart";


interface StoryViewerProps {
    images: { src: string; alt: string; }[];
    texts: string[];
    audios: string[];
    canShowTest: boolean;
    setCanShowTest: any
}

export default function StroyViewer({ images, texts, audios, canShowTest, setCanShowTest }: StoryViewerProps) {
    const t = useTranslations("storyViewer");
    const [index, setIndex] = useState(0);
    const [loaded, setLoaded] = useState(-1);
    const [dir, setDirection] = useState('next');
    const [quizButtonClickd, setQuizButtonClicked] = useState(false);
    const audio = new Audio(audios[0]);
    const play = () => {
        audio.pause();
        const times = audios[1][index].split("-").map(t => Number(t));
        audio.currentTime = times[0];
        audio.play();
        setTimeout(() => {
            audio.pause()
        }, (times[1] - times[0]) * 1000);
    }
    useEffect(() => {
        if (index >= texts.length - 1) {
            setTimeout(() => {
                setCanShowTest(true);
            }, 3000);
        }
    }, [index, setCanShowTest, texts.length]);

    return (
        <ContentPart id="story-viewer">
            <Carousel index={index} setIndex={setIndex} dir={dir} setDir={setDirection} onSlide={() => audio.pause()}>
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
                                audios.length > 0 &&
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
                            <Image
                                className={`rounded-xl border-2 p-1 m-auto sm:min-w-[350px] h-auto bg-white`}
                                src={`https:${images[i].src}`}
                                alt={images[i].alt}
                                width={400}
                                height={350}
                                unoptimized
                                onLoad={() => { setLoaded(i) }}
                            />
                            {
                                <Transition
                                    show={loaded != index}
                                    enter="transition-opacity duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="transition-opacity duration-50"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="dot absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"></div>
                                </Transition>
                            }
                        </div>
                    </div>
                ))}
            </Carousel >
        </ContentPart>
    )
}

