import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import HomeCard from "@/components/HomeCard";
import PreviewContent from "@/components/PreviewContent";
import { getEntries } from "@/lib/contentful/client";


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
        <div className="flex flex-wrap justify-center gap-5 p-10">
            {entries.map(async (course) => (
                <div key={course.fields.title}>
                    <HomeCard
                        label={course.fields.title}
                        href={`/${locale}/courses/${params.level}/${course.sys.id}`}
                        imageUrl={`/images/content/${course.sys.id}/card.png`}
                    />
                </div>
            ))}
            {process.env.NODE_ENV === 'development' && (
                <PreviewContent
                    href={`/${locale}/courses/${params.level}/`}
                    locale={uslocale}
                />
            )}
        </div>
    )
}