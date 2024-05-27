'use client'
import { useState } from "react";
import Link from "next/link"
import { useTranslations, useLocale } from 'next-intl';
import { AiOutlineMenu } from 'react-icons/ai'

import Logo from "./Logo";
import NavbarItem from "./NavbarItem";
import { usePathname } from "next/navigation";



export default function Navbar() {
    const t = useTranslations('navbar');
    const locale = useLocale();
    const [collapsed, setCollapsed] = useState(true);
    const pathname = usePathname();

    const isActif = (href: string) => pathname.includes(href);


    return (
        <nav className="
                p-4 border-b
                flex-col sm:flex-row sm:flex
                justify-around"
        >
            <div className="flex justify-between items-center">
                <Link href={`/${locale}`} >
                    <Logo src={t("logo")} />
                </Link>
                <div>
                    <button className="
                            sm:hidden 
                            border rounded-xl 
                            p-4
                            bg-orange-500 hover:bg-orange-600
                            outline-2 outline-lime-500 hover:outline"
                        onClick={() => setCollapsed((collapsed) => !collapsed)}
                    >
                        <AiOutlineMenu size={32} />
                    </button>
                </div>
            </div>
            <div className={`sm:flex ${collapsed ? "hidden" : ""}`}>
                <ul className="
                    sm:flex gap-4 items-center
                    px-10 py-2 sm:space-y-0 space-y-2 sm:p-1"
                >
                    <NavbarItem
                        href={`/${locale}/courses/preschool2`}
                        label={t("Preschool")}
                        active={isActif('preschool2')}
                    />
                    <NavbarItem
                        href={`/${locale}/courses/primary3`}
                        label={t("Primary")}
                        active={isActif('primary3')}
                    />
                    <NavbarItem
                        href={`/${locale}/stories`}
                        label={t("Stories")}
                        active={isActif('stories')}
                    />
                </ul>
                {/* <div className="flex justify-end">
                    <ChangeLanguage />
                </div> */}
            </div>
        </nav>
    )
}