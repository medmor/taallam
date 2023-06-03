

interface SubjectPage {
    params: {
        subject: string
    }
}
export default function SubjectPage({ params }: SubjectPage) {
    return (
        <div>{params.subject}</div>
    )
}