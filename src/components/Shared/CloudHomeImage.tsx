'use client'
import Link from 'next/link';
import Image from 'next/image';
import { motion } from "framer-motion";

interface EmptyCloudHomeImageProps {
    imageUrl: string;
    top: number;
    transition: {
        initial: string,
        animate: string,
        duration: number
    }
}

interface CloudHomeImageProps {
    label: string;
    href: string;
    imageUrl: string;
    top: number;
    transition: {
        initial: string,
        animate: string,
        duration: number
    }
}
export function CloudHomeImage({ label, href, imageUrl, top, transition }: CloudHomeImageProps) {
    return (
        <Link href={href}>
            <motion.div
                className='flex justify-center items-center bg-cover bg-no-repeat w-[400px] h-[120px] absolute gap-4 translate-x-[50%]'
                style={{ backgroundImage: "url('/images/home/cloud.png')", top }}
                initial={{ right: transition.initial }}
                animate={{ right: transition.animate }}
                transition={{ duration: transition.duration, repeat: Infinity, repeatType: "reverse" }}
            >
                {
                    <Image
                        className="w-[50px] h-[50px] rounded-full"
                        src={imageUrl} alt='label'
                        width="50"
                        height="50"
                    />
                }
                <div >
                    <div className='font-bold text-xl'>
                        {label}
                    </div>
                </div>

            </motion.div>
        </Link>
    )
}

export const EmptyCloudHomeImage = ({ top, transition, imageUrl }: EmptyCloudHomeImageProps) => {
    return (
        <div className='flex justify-center items-center bg-cover bg-no-repeat w-[400px] h-[120px] absolute gap-4 translate-x-[50%]' >
            <motion.div
                className='flex justify-center items-center bg-cover bg-no-repeat w-[400px] h-[120px] absolute gap-4 translate-x-[50%]'
                style={{ backgroundImage: "url('/images/home/cloud.png')", top }}
                initial={{ right: transition.initial }}
                animate={{ right: transition.animate }}
                transition={{ duration: transition.duration, repeat: Infinity, repeatType: "reverse" }}
            >
                {
                    <Image
                        className="w-[50px] h-[50px] rounded-full"
                        src={imageUrl} alt='label'
                        width="50"
                        height="50"
                    />
                }


            </motion.div>
        </div>
    )
}
