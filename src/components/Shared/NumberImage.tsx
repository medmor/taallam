
import Image from 'next/image'
interface NumberImageProps {
    number: string;
    className?: string;
    onClick?: any
}
export default function NumberImage(props: NumberImageProps) {
    const arr = props.number.split("")
    return (
        <div className={props.className} onClick={props.onClick}>
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