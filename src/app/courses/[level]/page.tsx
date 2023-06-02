import HomeCard from "@/components/HomeCard";

interface CoursesPageProps {
    params: {
        level: string;
    }
}
export default function CoursesPage({ params }: CoursesPageProps) {

    return (
        <div className="p-5 flex items-center h-full">
            {params.level}
            <div className="flex flex-wrap gap-5 m-auto">
                <HomeCard label="Math" href={`/courses/${params.level}/math`} />
                <HomeCard label="Science" href={`/courses/${params.level}/science`} />
                <HomeCard label="Arabic" href={`/courses/${params.level}/arabic`} />
                <HomeCard label="French" href={`/courses/${params.level}/french`} />
                <HomeCard label="English" href={`/courses/${params.level}/english`} />
            </div>
        </div>
    )
}