import { getTranslations } from "next-intl/server";
import PreviewContent from "@/components/Shared/PreviewContent";
import { getEntries } from "@/lib/contentful/client";
import HomeCardList from "@/components/Shared/HomeCardList";


export async function generateMetadata() {
    const t = await getTranslations('home');
    return {
        title: t("metadataTitle"),
        description: t("metadataDescription")
    }
}

interface CoursesPageProps {
    params: {
        level: string
        locale: string
    }
}
export default async function CoursesPage({ params }: CoursesPageProps) {

    const uslocale = params.locale == 'en' ? 'en-US' : params.locale;
    const entries = await getEntries("course", uslocale, params.level);

    return (
        <>
            <HomeCardList entries={entries} hrefBase={`/${params.locale}/courses/${params.level}`} />
            {
                process.env.NODE_ENV === 'development' && (
                    <PreviewContent
                        href={`/${params.locale}/courses/${params.level}/`}
                        locale={uslocale}
                    />
                )
            }
        </>
    )
}