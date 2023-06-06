'use client'
import { Transition } from "@headlessui/react";
import Button from "./Button";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

interface CarouselProps {
    index: number;
    setIndex: any;
    dir: string
    setDir: any;
    children: React.ReactNode[]
}

export default function Carousel({ children, index, setIndex, dir, setDir }: CarouselProps) {

    return (
        <div className='p-4'>
            <div dir="ltr" className='flex justify-around bg-white p-2 rounded-xl max-w-xl m-auto gap-5'>
                <Button
                    label={""}
                    disabled={index <= 0}
                    onClick={() => { setIndex((index: number) => index - 1); setDir("prev") }}
                    icon={AiOutlineArrowLeft}
                />
                <div>{index + 1}/{children.length}</div>
                <Button
                    label={""}
                    disabled={index > children.length - 2}
                    onClick={() => { setIndex((index: number) => index + 1); setDir('next') }}
                    icon={AiOutlineArrowRight}
                />
            </div>
            <div className="grid grid-cols-1">
                {children.map((child, i) => (
                    <Transition className={`row-start-1 col-start-1`}
                        key={i}
                        show={i == index}
                        enter="transition ease-in-out duration-500 transform"
                        enterFrom={dir == "next" ? "-translate-x-full" : "translate-x-full"}
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-500 transform"
                        leaveFrom="translate-x-0"
                        leaveTo={dir == "next" ? "translate-x-full" : "-translate-x-full"}
                    >
                        {child}
                    </Transition>
                ))}
            </div>
        </div>
    )
}