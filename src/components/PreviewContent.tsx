import { getEntries } from "@/lib/contentful/client";
import HomeCard from "./HomeCard";

interface PreviewContentProps {
    locale: string,
    href: string
}
export default async function PreviewContent({ href, locale }: PreviewContentProps) {
    const entries = await getEntries("course", locale, 'preview');

    return (
        <div className="flex flex-wrap justify-center gap-5 p-10">
            {entries.map(async (course) => (
                <div key={course.fields.title}>
                    <HomeCard
                        label={course.fields.title}
                        href={`${href}${course.sys.id}`}
                        imageUrl={`/images/content/${course.sys.id}/card.png`}
                    />
                </div>
            ))}
        </div>
    )
}