import DynamicComponent from "../DynamicComponent";

export default function Choice({ choice }: { choice: string }) {
    if (choice.startsWith('component')) {
        const data = choice.split('?')
        const component = data[1]
        const props = data[2].split("&")

        return <DynamicComponent component={component} properties={props} />
    }
    return (
        <>
            {choice}
        </>
    )
}