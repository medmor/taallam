
'use client'

import { useState } from "react";
import Image from 'next/image'
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai'
import { useTranslations } from 'next-intl';
import { Transition } from '@headlessui/react'

import Button from "@/components/Button";


interface StoryViewerProps {
    images: { src: string; alt: string; }[];
    texts: string[];
}

export default function StroyViewer({ images, texts }: StoryViewerProps) {
    const t = useTranslations("storyViewer");
    const [index, setIndex] = useState(0);
    const [loaded, setLoaded] = useState(-1);
    const [dir, setDirection] = useState('next')

    return (
        <div className='p-4'>
            <div dir="ltr" className='flex justify-around bg-white p-2 rounded-xl max-w-xl m-auto gap-5'>
                <Button
                    label={""}
                    disabled={index <= 0}
                    onClick={() => { setIndex((index) => index - 1); setDirection("prev") }}
                    icon={AiOutlineArrowLeft}
                />
                <div>{index + 1}/{texts.length}</div>
                <Button
                    label={""}
                    disabled={index > texts.length - 2}
                    onClick={() => { setIndex((index) => index + 1); setDirection('next') }}
                    icon={AiOutlineArrowRight}
                />
            </div>
            <div className="grid grid-cols-1">
                {texts.map((t, i) => (
                    <Transition className={`flex flex-col sm:flex-row gap-2 justify-center p-4 row-start-1 col-start-1`}
                        key={t}
                        show={i == index}
                        enter="transition ease-in-out duration-500 transform"
                        enterFrom={dir == "next" ? "-translate-x-full" : "translate-x-full"}
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-500 transform"
                        leaveFrom="translate-x-0"
                        leaveTo={dir == "next" ? "translate-x-full" : "-translate-x-full"}
                    >
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
                            {texts[i]}
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
                    </Transition>
                ))}
            </div>
        </div>
    )
}

