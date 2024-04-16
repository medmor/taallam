'use client'
import Link from 'next/link';
import Image from 'next/image';
import { motion } from "framer-motion";
export interface HomeCardProps {
    label: string;
    href: string;
    imageUrl: string;
}
export default function CloudHomeImage({ label, href, imageUrl }: HomeCardProps) {

    return (
        <Link href={href}>
            <motion.div
                className='flex justify-center items-center bg-cover bg-no-repeat w-[400px] h-[120px] absolute gap-4'
                style={{ backgroundImage: "url('/images/home/cloud.png')" }}
                initial={{ right: "30%" }}
                animate={{ right: "70%" }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            >
                {
                    <Image
                        className="w-[50px] h-[50px]"
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
