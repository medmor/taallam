'use client'
import Shapes from "./Shapes";
import Classification from "./Classification";
import Addition from "./Addition";
import Multiplication from "./Multiplication";
import NumberImage from "./NumberImage";

const Components = {
    Shapes, Classification, Addition, Multiplication, NumberImage
}

export interface DynamicComponentProps {
    component: string
    properties: string
    noLoading?:Boolean
}

 const DynamicComponent = ({ component, properties, noLoading }: DynamicComponentProps) =>{
    const json = typeof properties == "string"? JSON.parse(properties):properties;
    // const Dynamic =  dynamic<any>(() => import(`./${component}`), {
    //     loading: noLoading?()=><div></div>: () => (

    //         <div className="bg-white min-w-[200px] min-h-[200px]">
    //             <div className="dot absolute left-[50%] top-[50%] translate-x-[-50%]"></div>
    //         </div>
    //     ),
    // })
    return (
        //@ts-ignore
        Components[component](json)
        // <Dynamic properties={properties} />
    )
}

export default DynamicComponent