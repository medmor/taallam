import { useLocale } from "next-intl";
import { getTranslator } from "next-intl/server";
import HomeCard from "@/components/Shared/HomeCard";
import PreviewContent from "@/components/Shared/PreviewContent";
import { getEntries } from "@/lib/contentful/client";
import HomeCardList from "@/components/Shared/HomeCardList";


export async function generateMetadata({params: {locale}}:any) {
    const t = await getTranslator(locale, 'home');
    return {
        title: t("metadataTitle"),
        description: t("metadataDescription")
    }
}

interface CoursesPageProps {
    params: {
        level: string;
    }
}
export default async function CoursesPage({ params }: CoursesPageProps) {
    const locale = useLocale();
    const uslocale = locale == 'en' ? 'en-US' : locale;
    const entries = await getEntries("course", uslocale, params.level);

    return (
        <>
            <HomeCardList entries={entries} hrefBase={`/${locale}/courses/${params.level}`} />
            {
                process.env.NODE_ENV === 'development' && (
                    <PreviewContent
                        href={`/${locale}/courses/${params.level}/`}
                        locale={uslocale}
                    />
                )
            }
        </>
    )
}