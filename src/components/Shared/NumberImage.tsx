
import Image from 'next/image'
interface NumberImageProps {
    number: string;
    className: string;
    onClick: any
}
export default function NumberImage({ number, className, onClick }: NumberImageProps) {
    const arr = number.split("")
    return (
        <div className={className} onClick={onClick}>

            {arr.map((n, i) => (
                <Image
                    src={`/images/content/numbers/small/${n}.png`}
                    alt={n}
                    key={i}
                    width={60}
                    height={60}
                    unoptimized
                    className="h-auto w-[60px]"
                />
            ))}
        </div>
    )
}