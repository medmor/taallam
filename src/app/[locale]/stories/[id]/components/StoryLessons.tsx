import StoryPart from "./StoryPart";

interface Storylessons {
    lessons: string[];
}
export default function StoryLessons({ lessons }: Storylessons) {
    return (
        <StoryPart id="story-lessons" >
            <div className="p-4">

                {lessons.map((lesson) => {
                    const parts = lesson.split(":")
                    return (
                        <div key={parts[0]} className="text-center text-lg bg-white p-2 rounded-lg my-2">
                            <span className="font-bold">{parts[0]} :</span> {parts[1]}
                        </div>
                    )
                })}
            </div>
        </StoryPart>
    )
}