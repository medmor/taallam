import Link from "next/link"
import { useTranslations, useLocale } from 'next-intl';

export default function ChangeLanguage() {
    const t = useTranslations('navbar');
    const locale = useLocale();


    return (
        <Link href={`/${locale == 'ar' ? 'en' : 'ar'}`} className="mx-5 p-1" >
            {t("language")}
        </Link>
    )
}