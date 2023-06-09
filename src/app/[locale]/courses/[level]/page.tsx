import HomeCard from "@/components/HomeCard";
import InConstruction from "@/components/InConstruction";
import { useTranslations, useLocale } from "next-intl";

interface CoursesPageProps {
    params: {
        level: string;
    }
}
export default function CoursesPage({ params }: CoursesPageProps) {
    const locale = useLocale();
    const t = useTranslations('common');
    return (
        <div className="p-5  flex-col justify-center items-center h-full">
            <div className="flex flex-wrap justify-center gap-5 m-auto mb-2">
                <HomeCard label={t("math")} href={`/${locale}/courses/${params.level}/math`} />
                <HomeCard label={t("science")} href={`/${locale}/courses/${params.level}/science`} />
                <HomeCard label={t("arabic")} href={`/${locale}/courses/${params.level}/arabic`} />
                <HomeCard label={t("french")} href={`/${locale}/courses/${params.level}/french`} />
                <HomeCard label={t("english")} href={`/${locale}/courses/${params.level}/english`} />
            </div>
            <InConstruction />
        </div>
    )
}