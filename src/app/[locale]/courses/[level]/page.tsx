import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import HomeCard from "@/components/HomeCard";
import PreviewContent from "@/components/PreviewContent";
import { getEntries } from "@/lib/contentful/client";
import HomeCardList from "@/components/HomeCardList";


export async function generateMetadata() {
    const t = await getTranslations('home');
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
                        href={`/${locale}/stories/`}
                        locale={uslocale}
                    />
                )
            }
        </>
    )
}