
'use client'

import { useState } from "react";
import Image from 'next/image'
import { Transition } from '@headlessui/react'

import Carousel from "@/components/Carousel";


interface StoryViewerProps {
    images: { src: string; alt: string; }[];
    texts: string[];
}

export default function StroyViewer({ images, texts }: StoryViewerProps) {
    const [index, setIndex] = useState(0);
    const [loaded, setLoaded] = useState(-1);
    const [dir, setDirection] = useState('next')

    return (
        <Carousel index={index} setIndex={setIndex} dir={dir} setDir={setDirection}>
            {texts.map((text, i) => (
                <div className="flex flex-col sm:flex-row gap-2 justify-center p-4 " key={i}>
                    <div className={`
                            flex
                            items-center
                            justify-center
                            text-center
                            p-2 sm:p-10 space-y-5
                            rounded-xl
                            bg-white 
                            sm:text-[3vw] 
                            ${index == 0 ? 'font-bold' : ''}                     
                            `}>
                        {text}
                    </div>
                    <div className="relative">
                        <Image
                            className={`rounded-xl m-auto sm:min-w-[350px] min-h-[350px] bg-white`}
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
    )
}

