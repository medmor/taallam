import DynamicComponent from "../dynamic/_Loader";
import SummaryImage from "../content/SummaryImage";

export default function Choice({ choice }: { choice: string }) {
    if (choice.startsWith('component?')) {
        const data = choice.split('?')
        const component = data[1]
        const props = data[2].split("&")

        return <DynamicComponent component={component} properties={props} />
    }
    else if (choice.startsWith('image?')) {
        const data = choice.split("?")
        return (
            <div className=" max-w-[150px]">
                <SummaryImage src={data[1]} alt={data[2]} />
            </div>
        )
    }
    return (
        <>
            {choice}
        </>
    )
}