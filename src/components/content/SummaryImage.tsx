'use client'

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
                onLoad={() => updateLoaded()}
            />
            {
                !loaded &&
                <div className="dot absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"></div>
            }
        </>
    )
}