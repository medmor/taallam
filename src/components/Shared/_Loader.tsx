'use client'
import Shapes from "./Shapes";
import ShapesClassification from "./ShapesClassification";
import Addition from "./Addition";
import Multiplication from "./Multiplication";
import NumberImage from "./NumberImage";
import SlidingPuzzle from "./SlidingPuzzle";
import { memo } from "react";

const Components = {
    Shapes, ShapesClassification, Addition, Multiplication, NumberImage, SlidingPuzzle
}

export interface DynamicComponentProps {
    component: string
    properties: string
}

const Loader = ({ component, properties }: DynamicComponentProps) => {
    const json = typeof properties == "string" ? JSON.parse(properties) : properties;
    return (
        //@ts-ignore
        Components[component](json)
    )
}

export default memo(Loader)