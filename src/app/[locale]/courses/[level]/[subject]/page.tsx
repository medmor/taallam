import InConstruction from "@/components/InConstruction"


interface SubjectPage {
    params: {
        subject: string
    }
}
export default function SubjectPage({ params }: SubjectPage) {
    return (
        <div>\
            <InConstruction />
        </div>
    )
}