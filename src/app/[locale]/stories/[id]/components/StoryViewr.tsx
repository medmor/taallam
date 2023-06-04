
'use client'

import { useState } from "react";
import Image from 'next/image'
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai'
import { useTranslations } from 'next-intl';


import Button from "@/components/Button";


interface StoryViewerProps {
    images: { src: string; alt: string; }[];
    texts: string[];
}
export default function StroyViewer({ images, texts }: StoryViewerProps) {
    const t = useTranslations("home")
    const [index, setIndex] = useState(0);
    return (
        <div className='p-4'>
            <div className='flex justify-around bg-white p-2 rounded-xl max-w-xl m-auto gap-5'>
                <Button
                    label={t("next")}
                    disabled={index > texts.length - 3}
                    onClick={() => setIndex((index) => index + 1)}
                    icon={AiOutlineArrowRight}
                />
                <Button
                    label={t("previous")}
                    disabled={index <= 0}
                    onClick={() => setIndex((index) => index - 1)}
                    icon={AiOutlineArrowLeft}
                />
            </div>
            <div className='grid-cols-2 grid p-4 '>
                <Image
                    className="rounded-xl m-auto w-[400px] h-[350px]"
                    src={`https:${images[index].src}`}
                    alt={images[index].alt}
                    width={400}
                    height={400}
                />

                <div className={`
                    flex
                    items-center
                    justify-center
                    text-center
                    p-4 space-y-5
                    rounded-xl
                    bg-white 
                    ${index == 0 ? 'text-[4vw] font-bold' : 'text-[3vw]'}
                    
                `}>
                    {texts[index]}
                </div>
            </div>
        </div>
    )
}

