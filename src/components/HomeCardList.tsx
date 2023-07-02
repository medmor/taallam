import HomeCard from "./HomeCard"

interface HomeCardListProps {
    entries: any[];
    hrefBase: string
}
export default function HomeCardList({ entries, hrefBase }: HomeCardListProps) {
    return (
        <div className="flex flex-wrap justify-center gap-5 p-4 sm:p-10">
            {entries.map(async (course) => (
                <div key={course.fields.title}>
                    <HomeCard
                        label={course.fields.title}
                        href={`${hrefBase}/${course.sys.id}`}
                        imageUrl={`/images/content/${course.sys.id}/card.png`}
                    />
                </div>
            ))}
        </div>
    )
}