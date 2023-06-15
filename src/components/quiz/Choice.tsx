import DynamicComponent from "../DynamicComponent";
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
        return <SummaryImage src={data[1]} alt={data[2]} />
    }
    return (
        <>
            {choice}
        </>
    )
}