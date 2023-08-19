'use client'
import Shapes from "./Shapes";
import ShapesClassification from "./ShapesClassification";
import Addition from "./Addition";
import Multiplication from "./Multiplication";
import NumberImage from "./NumberImage";

const Components = {
    Shapes, ShapesClassification, Addition, Multiplication, NumberImage
}

export interface DynamicComponentProps {
    component: string
    properties: string
    noLoading?:Boolean
}

 const Loader = ({ component, properties, noLoading }: DynamicComponentProps) =>{
    const json = typeof properties == "string"? JSON.parse(properties):properties;
    return (
        //@ts-ignore
        Components[component](json)
    )
}

export default Loader