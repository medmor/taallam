'use client'
import dynamic from "next/dynamic";
import { useMemo, } from "react";

export interface DynamicComponentProps {
    component: string
    properties: string[];
}

export default function DynamicComponent({ component, properties }: DynamicComponentProps) {

    const Dynamic = useMemo(() => dynamic<any>(() => import(`./dynamic/${component}`), {
        ssr: false,
        loading: () => (

            <div className="bg-white min-w-[200px] min-h-[200px]">
                <div className="dot absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"></div>
            </div>
        ),
    }), [component])
    return <Dynamic properties={properties} />
}