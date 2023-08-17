'use client'
import dynamic from "next/dynamic";

export interface DynamicComponentProps {
    component: string
    properties: string[]
    noLoading?:Boolean
}

 const DynamicComponent = ({ component, properties, noLoading }: DynamicComponentProps) =>{
    const Dynamic =  dynamic<any>(() => import(`./${component}`), {
        loading: noLoading?()=><div></div>: () => (

            <div className="bg-white min-w-[200px] min-h-[200px]">
                <div className="dot absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"></div>
            </div>
        ),
    })

    return (
        <Dynamic properties={properties} />
    )
}

export default DynamicComponent