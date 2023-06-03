import Link from "next/link"
import { useTranslations, useLocale } from 'next-intl';

import ChangeLanguage from "./ChangeLanguage"



export default function Navbar() {
    const t = useTranslations('navbar');
    const locale = useLocale();
    return (
        <nav className="p-4 bg-blue-700" >
            <div className={locale == 'ar' ? 'float-left' : 'float-right'} >
                <ChangeLanguage />
            </div>
            <div className="flex">
                <Link href={`/${locale}`} className="font-bold text-xl text-white me-4">{t("Taallam")}</Link>
                <ul className="text-white flex gap-4 p-1">
                    <li>
                        <Link href={`/${locale}/courses/preschool.2`} >{t("Preschool 2")}</Link>
                    </li>
                    <li>
                        <Link href={`/${locale}/courses/primary.3`} >{t("Primary 3")}</Link>
                    </li>
                    <li>
                        <Link href={`/${locale}/stories`} className="text-orange-400 font-semibold" >{t("Stories")}</Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}