import Link from 'next/link';
import Image from 'next/image';
export interface HomeCardProps {
    label: string;
    href: string;
    imageUrl?: string;
    createdAt?: string;
}
export default function HomeCard({ label, href, imageUrl, createdAt }: HomeCardProps) {
    let createdAtSpan: any = undefined
    if (createdAt) {
        const date = new Date(createdAt);
        createdAtSpan = <span dir='ltr'>{`${date.getDate()} / ${date.getMonth()} / ${date.getFullYear()}`}</span>
    }
    return (
        <Link href={href}>
            <div className="
                border 
                rounded-3xl
                p-4
                bg-white
                flex flex-col
                justify-between 
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
                            className="rounded-lg mb-2"
                            src={imageUrl} alt='label'
                            width="200"
                            height="200"
                            unoptimized
                        />
                    )
                }
                <div >
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

                </div>

            </div>
        </Link>
    )
}
