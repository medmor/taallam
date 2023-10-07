import Link from "next/link";
import HtmlCommentsBox from "./HtmlCommentBox";
import Logo from "../navbar/Logo";
import { useTranslations } from "next-intl";

export default function Footer(props: any) {
    const t = useTranslations('footer')
    return (
        <div className="bg-white p-4 min-h-[15vh] flex flex-col justify-center items-center">
            <HtmlCommentsBox />
            <hr className="border-orange-200 my-8 w-full" />
            <Link href='/' >
                <Logo src={t('logo')} /> &copy; 2023
            </Link>
            <div>Images from
                <a className="mx-4 text-orange-600 font-semibold" target="blank" href="https://www.freepik.com/">
                    Designed by brgfx / Freepik
                </a>
            </div>
        </div>
    )
}