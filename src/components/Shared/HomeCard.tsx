'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from "framer-motion";
import { rnd } from '@/helpers/random';

export interface HomeCardProps {
    label: string;
    href: string;
    imageUrl?: string;
    createdAt?: string;
}
export default function HomeCard({ label, href, imageUrl, createdAt }: HomeCardProps) {
    const [src, setSrc] = useState(imageUrl || "")
    let createdAtSpan: any = undefined
    if (createdAt) {
        const date = new Date(createdAt);
        createdAtSpan = <span dir='ltr'>{`${date.getDate()} / ${date.getMonth()} / ${date.getFullYear()}`}</span>
    }
    return (
        <Link href={href}>
            <motion.div className="w-[310px] h-[370px] bg-cover bg-no-repeat flex flex-col justify-center items-center"
                style={{ backgroundImage: 'url("/images/home/cloudCard.png")' }}
                initial={{ rotateZ: -10 }}
                animate={{ rotateZ: 2 }}
                transition={{
                    ease: [0, 0.71, 0.2, 1.01],
                    repeat: Infinity,
                    repeatType: 'reverse',
                    stiffness: 50,
                    damping: 5, type: 'spring'
                }}
            >
                {
                    <Image
                        className="rounded-full w-[60%]"
                        src={src} alt='label'
                        width="200"
                        height="200"
                        unoptimized
                        onError={() => setSrc("/images/logo.png")}
                    />
                }
                <div className='font-bold text-xl'>
                    {label}
                </div>
                {
                    createdAtSpan && (
                        <div className='text-xs'>
                            {createdAtSpan}
                        </div>
                    )
                }
            </motion.div>
        </Link>
    )
}
