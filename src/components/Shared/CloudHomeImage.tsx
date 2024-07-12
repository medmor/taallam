'use client'
import Link from 'next/link';
import Image from 'next/image';
import { motion } from "framer-motion";

interface EmptyCloudHomeImageProps {
    top: number;
    transition: {
        initial: string,
        animate: string,
        duration: number
    }
    children?: React.ReactNode
    zIndex?: number,
    repeatType?: 'reverse';
    ease?: 'linear' | 'easeInOut'
}

interface CloudHomeImageProps extends EmptyCloudHomeImageProps {
    label: string;
    href: string;
    imageUrl: string;
}
export function CloudHomeImage({ label, href, imageUrl, top, transition }: CloudHomeImageProps) {
    return (
        <Link href={href} dir='rtl'>
            <EmptyCloudHomeImage top={top} transition={transition} zIndex={10} repeatType='reverse' ease='easeInOut'>
                {
                    <Image
                        className="w-[50px] h-[50px] rounded-full"
                        src={imageUrl} alt='label'
                        width="50"
                        height="50"
                    />
                }
                <div >
                    <div className='font-bold text-xl pt-4'>
                        {label}
                    </div>
                </div>
            </EmptyCloudHomeImage>
        </Link>
    )
}

export const EmptyCloudHomeImage = ({ top, transition, children, zIndex, repeatType, ease }: EmptyCloudHomeImageProps) => {
    return (
        <motion.div
            className='flex justify-center items-center bg-cover bg-no-repeat w-[400px] h-[120px] absolute gap-4'
            style={{ backgroundImage: "url('/images/home/cloud.png')", top, zIndex }}
            initial={{ x: transition.initial }}
            animate={{ x: transition.animate }}
            transition={{ duration: transition.duration, repeat: Infinity, repeatType, ease }}
        >
            {children}
        </motion.div>
    )
}
