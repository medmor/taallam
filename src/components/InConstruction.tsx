import Image from "next/image"
import { useTranslations } from "next-intl"
export default function InConstruction() {
    const t = useTranslations("common");
    return (
        <div className="flex justify-center items-center pb-2">
            <Image
                className="rounded-lg"
                src={`/images/${t("inConstruction")}.png`}
                alt="in construction image"
                width={600}
                height={600}
                unoptimized
            />
        </div>
    )
}