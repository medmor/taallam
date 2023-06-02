import Link from 'next/link'
export interface HomeCardProps {
    label: string;
    href: string;
}
export default function HomeCard({ label, href }: HomeCardProps) {
    return (
        <Link href={href}>
            <div className="
                border 
                rounded-lg 
                w-[48%] 
                p-20 m-auto
                bg-yellow-400 
                font-semibold 
                flex 
                justify-center 
                items-center
                hover:outline
                hover:outline-4
                hover:outline-red-400
                hover:border-0
                cursor-pointer"
            >
                {label}
            </div>
        </Link>
    )
}
