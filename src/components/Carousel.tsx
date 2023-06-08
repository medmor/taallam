'use client'
import { Transition } from "@headlessui/react";
import Button from "./Button";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

interface CarouselProps {
    index: number;
    setIndex: any;
    dir: string
    setDir: any;
    children: React.ReactNode[];
    loop?: boolean;
    oneDirection?: boolean;
    onSlide?: any;
}

export default function Carousel({ children, index, setIndex, dir, setDir, loop, oneDirection, onSlide }: CarouselProps) {

    return (
        <div className='p-4'>
            <div dir="ltr" className='flex justify-around bg-white p-2 rounded-xl max-w-xl m-auto gap-5'>
                {
                    !oneDirection && <Button
                        label={""}
                        disabled={(index <= 0 && !loop)}
                        onClick={
                            () => {
                                if (onSlide) {
                                    onSlide();
                                }
                                setDir("prev");
                                if (loop && index <= 0) {
                                    setIndex(() => children.length - 1)
                                } else {
                                    setIndex((index: number) => index - 1);
                                }
                            }
                        }
                        icon={AiOutlineArrowLeft}
                    />
                }
                <div className="p-4 border border-orange-600 rounded-full">{index + 1}/{children.length}</div>
                <Button
                    label={""}
                    disabled={(index > children.length - 2 && !loop)}
                    onClick={
                        () => {
                            if (onSlide) {
                                onSlide();
                            }
                            setDir('next');
                            if (loop && index >= children.length - 1) {
                                setIndex(() => 0)
                            } else {
                                setIndex((index: number) => index + 1);
                            }
                        }
                    }
                    icon={AiOutlineArrowRight}
                />
            </div>
            <div className="grid grid-cols-1">
                {children.map((child, i) => (
                    <Transition className={`row-start-1 col-start-1`}
                        key={i}
                        show={i == index}
                        enter={`transition ease-in-out duration-1000 transform`}
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave={`transition ease-in-out duration-1000 transform`}
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                    >
                        {child}
                    </Transition>
                ))}
            </div>
        </div>
    )
}