import { useTranslations } from "next-intl"

export default function Loading() {
    const t = useTranslations('loading')
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <p className="text-3xl">{t('loading')}</p>
        </div>
    )
}