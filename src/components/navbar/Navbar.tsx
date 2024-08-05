"use client";
import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { AiOutlineMenu } from "react-icons/ai";

import Logo from "./Logo";
import NavbarItem from "./NavbarItem";
import { usePathname } from "next/navigation";
import ChangeLanguage from "./ChangeLanguage";

export default function Navbar() {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(true);
  const pathname = usePathname();

  const isActif = (href: string) => pathname.includes(href);

  return (
    <nav
      className="
                flex-col justify-around
                border-b p-4 sm:flex
                sm:flex-row"
    >
      <div className="flex items-center justify-between">
        <Link href={`/${locale}`}>
          <Logo src={t("logo")} />
        </Link>
        <div>
          <button
            className="
                            rounded-xl 
                            border bg-orange-500 
                            p-4
                            outline-2 outline-lime-500
                            hover:bg-orange-600 hover:outline sm:hidden"
            onClick={() => setCollapsed((collapsed) => !collapsed)}
          >
            <AiOutlineMenu size={32} />
          </button>
        </div>
      </div>
      <div className={`sm:flex ${collapsed ? "hidden" : ""}`}>
        <ul
          className="
                    items-center gap-4 space-y-2
                    px-10 py-2 sm:flex sm:space-y-0 sm:p-1"
        >
          <NavbarItem
            href={`/${locale}/courses/preschool2`}
            label={t("Preschool")}
            active={isActif("preschool2")}
          />
          <NavbarItem
            href={`/${locale}/courses/primary3`}
            label={t("Primary")}
            active={isActif("primary3")}
          />
          <NavbarItem
            href={`/${locale}/stories`}
            label={t("Stories")}
            active={isActif("stories")}
          />
          <NavbarItem
            href={`/${locale}/games`}
            label={t("games")}
            active={isActif("games")}
          />
        </ul>
        <div className="flex items-center justify-end">
          <ChangeLanguage />
        </div>
      </div>
    </nav>
  );
}
