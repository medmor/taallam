import HomeCard from "@/components/HomeCard";
import { getEntries, getImageUrl } from "@/lib/contentful/client";
import { useLocale } from "next-intl";

interface CoursesPageProps {
    params: {
        level: string;
    }
}
export default async function CoursesPage({ params }: CoursesPageProps) {
    console.log(params)
    const locale = useLocale();
    const entries = await getEntries(locale == 'en' ? 'en-US' : locale, `course,${params.level}`);

    return (
        <div className="flex flex-wrap justify-center gap-5 p-10">
            {entries.map(async (course) => (
                <div key={course.fields.title}>
                    <HomeCard
                        label={course.fields.title}
                        href={`/${locale}/courses/${params.level}/${course.sys.id}`}
                        imageUrl={await getImageUrl(course.fields.cardImage.sys.id)}
                    />
                </div>
            ))}
        </div>
    )
}