import HomeCard from "./HomeCard"

interface HomeCardListProps {
    entries: any[];
    hrefBase: string
}
export default function HomeCardList({ entries, hrefBase }: HomeCardListProps) {
    return (
        <div className="flex flex-wrap justify-center gap-5 p-4 sm:p-10">
            {entries.map(async (entrie) => (
                <div key={entrie.fields.title}>
                    <HomeCard
                        label={entrie.fields.title}
                        href={`${hrefBase}/${entrie.sys.id}`}
                        imageUrl={`/images/content/${entrie.sys.id}/card.png`}
                        createdAt={entrie.sys.createdAt}
                    />
                </div>
            ))}
        </div>
    )
}