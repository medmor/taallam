import Logo from "./navbar/Logo";
import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations('footer')
    return (
        <div className="bg-white p-4 min-h-[15vh] flex flex-col justify-center items-center">
            <Logo src={t('logo')} /> &copy; 2023
            <div>Images from
                <a className="mx-4 text-orange-600 font-semibold" target="blank" href="https://www.freepik.com/">
                    Freepik
                </a>
            </div>
        </div>
    )
}