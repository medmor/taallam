import Link from 'next/link';
import Image from 'next/image';
export interface HomeCardProps {
    label: string;
    href: string;
    imageUrl?: string;
}
export default function HomeCard({ label, href, imageUrl }: HomeCardProps) {
    return (
        <Link href={href}>
            <div className="
                border 
                rounded-3xl
                p-4
                bg-white
                font-bold
                text-purple-800
                text-center
                text-2xl
                flex flex-col
                justify-center 
                items-center
                hover:outline
                hover:outline-4
                hover:outline-red-400
                hover:border-0
                cursor-pointer 
                h-full"
            >
                {
                    imageUrl && (
                        <Image
                            className="rounded-full mb-2"
                            src={imageUrl} alt='label'
                            width="200"
                            height="200"
                            unoptimized
                        />
                    )
                }
                {label}
            </div>
        </Link>
    )
}
