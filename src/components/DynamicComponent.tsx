import dynamic from "next/dynamic";

export interface DynamicComponentProps {
    component: string
    properties: string[];
}

export default function DynamicComponent({ component, properties }: DynamicComponentProps) {
    const Dynamic = dynamic<any>(() => import(`./dynamic/${component}`), {
        loading: () => <p>Loading...</p>,
    });
    return <Dynamic properties={properties} />
}