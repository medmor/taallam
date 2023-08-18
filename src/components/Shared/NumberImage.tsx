
import { rndItem } from '@/helpers/random';
import Image from 'next/image'
interface NumberImageProps {
    number: string | number[];
    className?: string;
    onClick?: any
}
export default function NumberImage(props: NumberImageProps) {

    const arr = typeof props.number == "string" ? props.number.split("") : rndItem(props.number).toString().split("")
    return (
        <div className={props.className} onClick={props.onClick}>
            {arr.map((n: string, i: number) => (
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