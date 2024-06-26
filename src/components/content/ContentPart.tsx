interface StoryPartProps {
    children: React.ReactNode;
    id: string;
}

export default function StoryPart({ children, id }: StoryPartProps) {
    return (
        <div id={id} className="max-w-5xl m-auto rounded-xl my-2 p-2">
            {children}
        </div>
    )
}