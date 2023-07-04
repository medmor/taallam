'use client'

import { Transition } from "@headlessui/react"
import Image from "next/image"
import { useCallback, useState } from "react";

interface SummaryImageProps {
    src: string;
    alt: string;
}
export default function SummaryImage({ src, alt }: SummaryImageProps) {
    const [loaded, setLoaded] = useState(false);
    const updateLoaded = useCallback(() => { setLoaded(true); }, [])
    return (
        <>
            <Image
                className={`rounded-xl border-2 p-1 m-auto w-full h-auto bg-white`}
                src={src}
                alt={alt}
                width={400}
                height={400}
                unoptimized
                onLoad={() => updateLoaded()}
            />
            {
                <Transition
                    show={!loaded}
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
        </>
    )
}